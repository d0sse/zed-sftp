import * as fs from "fs";
import * as path from "path";
import { minimatch } from "minimatch";

export interface SftpConfig {
	name?: string;
	protocol: "sftp" | "ftp" | "ftps";
	host: string;
	port?: number;
	username: string;
	password?: string;
	privateKeyPath?: string;
	passphrase?: string;
	remotePath: string;
	localPath?: string;
	context?: string; // Local subdirectory to use as root (e.g., "site/wp-content/")
	uploadOnSave?: boolean;
	downloadOnOpen?: boolean;
	ignore?: string[];
	concurrency?: number;
	connectTimeout?: number;
	keepalive?: number;
	interactiveAuth?: boolean;
	algorithms?: {
		kex?: string[];
		cipher?: string[];
		serverHostKey?: string[];
		hmac?: string[];
	};
	watcher?: {
		files?: string;
		autoUpload?: boolean;
		autoDelete?: boolean;
	};
	profiles?: {
		[key: string]: Partial<SftpConfig>;
	};
	defaultProfile?: string;
}

export class ConfigManager {
	private workspaceFolder: string;
	private config: SftpConfig | null = null;
	private ignorePatterns: string[] = [];
	private contextPath: string = ""; // Resolved context path

	constructor(workspaceFolder: string) {
		this.workspaceFolder = workspaceFolder;
	}

	async loadConfig(): Promise<SftpConfig | null> {
		// Try .zed/sftp.json first
		let configPath = path.join(this.workspaceFolder, ".zed", "sftp.json");

		if (!fs.existsSync(configPath)) {
			// Fall back to .vscode/sftp.json for compatibility
			configPath = path.join(this.workspaceFolder, ".vscode", "sftp.json");
		}

		if (!fs.existsSync(configPath)) {
			// Try root level sftp.json
			configPath = path.join(this.workspaceFolder, "sftp.json");
		}

		if (!fs.existsSync(configPath)) {
			return null;
		}

		try {
			const configContent = fs.readFileSync(configPath, "utf-8");
			this.config = JSON.parse(configContent);

			// Validate required fields
			if (!this.config) {
				throw new Error("Config is empty");
			}

			if (!this.config.host) {
				throw new Error("Missing required field: host");
			}

			if (!this.config.username) {
				throw new Error("Missing required field: username");
			}

			if (!this.config.remotePath) {
				throw new Error("Missing required field: remotePath");
			}

			if (!this.config.password && !this.config.privateKeyPath) {
				throw new Error("Either password or privateKeyPath must be provided");
			}

			if (this.config) {
				// Set default local path
				if (!this.config.localPath) {
					this.config.localPath = this.workspaceFolder;
				}

				// Handle context path (local subdirectory to use as root)
				if (this.config.context) {
					// Normalize context path (remove leading/trailing slashes)
					let context = this.config.context.replace(/^\/+|\/+$/g, "");
					this.contextPath = path.join(this.workspaceFolder, context);
				} else {
					this.contextPath = this.workspaceFolder;
				}

				// Load ignore patterns
				this.ignorePatterns = this.config.ignore || [];

				// Add default ignore patterns
				if (!this.ignorePatterns.includes(".git")) {
					this.ignorePatterns.push(".git");
				}
				if (!this.ignorePatterns.includes("node_modules")) {
					this.ignorePatterns.push("node_modules");
				}

				// Handle profiles
				if (this.config.profiles && this.config.defaultProfile) {
					const profile = this.config.profiles[this.config.defaultProfile];
					if (profile) {
						this.config = { ...this.config, ...profile };
					}
				}
			}

			return this.config;
		} catch (error) {
			throw new Error(`Failed to parse SFTP config: ${error}`);
		}
	}

	shouldIgnore(filePath: string): boolean {
		const relativePath = path.relative(this.workspaceFolder, filePath);

		for (const pattern of this.ignorePatterns) {
			if (minimatch(relativePath, pattern, { dot: true })) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Check if a file is within the context path
	 */
	isInContext(filePath: string): boolean {
		const normalized = path.normalize(filePath);
		const contextNormalized = path.normalize(this.contextPath);
		return normalized.startsWith(contextNormalized);
	}

	/**
	 * Get the remote path for a local file, respecting the context setting
	 */
	getRemotePath(localFilePath: string): string | null {
		if (!this.config) {
			return null;
		}

		// Check if file is within context
		if (!this.isInContext(localFilePath)) {
			return null;
		}

		// Get relative path from context directory
		const relativePath = path.relative(this.contextPath, localFilePath);

		// Security check: prevent path traversal
		if (relativePath.includes("..")) {
			throw new Error("Path traversal detected in file path");
		}

		// Normalize remote path (ensure it starts with /)
		let remotePath = this.config.remotePath;
		if (!remotePath.startsWith("/")) {
			remotePath = "/" + remotePath;
		}

		// Combine remote path with relative path (use forward slashes for remote)
		const remoteFilePath = path.posix.join(remotePath, relativePath.split(path.sep).join("/"));

		// Final security check on combined path
		if (remoteFilePath.includes("..")) {
			throw new Error("Path traversal detected in remote path");
		}

		return remoteFilePath;
	}

	getConfig(): SftpConfig | null {
		return this.config;
	}

	getContextPath(): string {
		return this.contextPath;
	}

	async saveConfig(config: SftpConfig): Promise<void> {
		const configDir = path.join(this.workspaceFolder, ".zed");

		if (!fs.existsSync(configDir)) {
			fs.mkdirSync(configDir, { recursive: true });
		}

		const configPath = path.join(configDir, "sftp.json");
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
		this.config = config;
	}

	async reloadConfig(): Promise<SftpConfig | null> {
		return this.loadConfig();
	}
}

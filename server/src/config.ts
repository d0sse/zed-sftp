import * as fs from 'fs';
import * as path from 'path';
import { minimatch } from 'minimatch';

export interface SftpConfig {
  name?: string;
  protocol: 'sftp' | 'ftp' | 'ftps';
  host: string;
  port?: number;
  username: string;
  password?: string;
  privateKeyPath?: string;
  passphrase?: string;
  remotePath: string;
  localPath?: string;
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

  constructor(workspaceFolder: string) {
    this.workspaceFolder = workspaceFolder;
  }

  async loadConfig(): Promise<SftpConfig | null> {
    // Try .zed/sftp.json first
    let configPath = path.join(this.workspaceFolder, '.zed', 'sftp.json');

    if (!fs.existsSync(configPath)) {
      // Fall back to .vscode/sftp.json for compatibility
      configPath = path.join(this.workspaceFolder, '.vscode', 'sftp.json');
    }

    if (!fs.existsSync(configPath)) {
      // Try root level sftp.json
      configPath = path.join(this.workspaceFolder, 'sftp.json');
    }

    if (!fs.existsSync(configPath)) {
      return null;
    }

    try {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      this.config = JSON.parse(configContent);

      if (this.config) {
        // Set default local path
        if (!this.config.localPath) {
          this.config.localPath = this.workspaceFolder;
        }

        // Load ignore patterns
        this.ignorePatterns = this.config.ignore || [];

        // Add default ignore patterns
        if (!this.ignorePatterns.includes('.git')) {
          this.ignorePatterns.push('.git');
        }
        if (!this.ignorePatterns.includes('node_modules')) {
          this.ignorePatterns.push('node_modules');
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

  getConfig(): SftpConfig | null {
    return this.config;
  }

  async saveConfig(config: SftpConfig): Promise<void> {
    const configDir = path.join(this.workspaceFolder, '.zed');

    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const configPath = path.join(configDir, 'sftp.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    this.config = config;
  }

  async reloadConfig(): Promise<SftpConfig | null> {
    return this.loadConfig();
  }
}


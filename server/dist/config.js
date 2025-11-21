"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const minimatch_1 = require("minimatch");
class ConfigManager {
    constructor(workspaceFolder) {
        this.config = null;
        this.ignorePatterns = [];
        this.contextPath = ""; // Resolved context path
        this.workspaceFolder = workspaceFolder;
    }
    async loadConfig() {
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
                }
                else {
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
        }
        catch (error) {
            throw new Error(`Failed to parse SFTP config: ${error}`);
        }
    }
    shouldIgnore(filePath) {
        const relativePath = path.relative(this.workspaceFolder, filePath);
        for (const pattern of this.ignorePatterns) {
            if ((0, minimatch_1.minimatch)(relativePath, pattern, { dot: true })) {
                return true;
            }
        }
        return false;
    }
    /**
     * Check if a file is within the context path
     */
    isInContext(filePath) {
        const normalized = path.normalize(filePath);
        const contextNormalized = path.normalize(this.contextPath);
        return normalized.startsWith(contextNormalized);
    }
    /**
     * Get the remote path for a local file, respecting the context setting
     */
    getRemotePath(localFilePath) {
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
    getConfig() {
        return this.config;
    }
    getContextPath() {
        return this.contextPath;
    }
    async saveConfig(config) {
        const configDir = path.join(this.workspaceFolder, ".zed");
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        const configPath = path.join(configDir, "sftp.json");
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        this.config = config;
    }
    async reloadConfig() {
        return this.loadConfig();
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config.js.map
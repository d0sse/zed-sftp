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
export declare class ConfigManager {
    private workspaceFolder;
    private config;
    private ignorePatterns;
    constructor(workspaceFolder: string);
    loadConfig(): Promise<SftpConfig | null>;
    shouldIgnore(filePath: string): boolean;
    getConfig(): SftpConfig | null;
    saveConfig(config: SftpConfig): Promise<void>;
    reloadConfig(): Promise<SftpConfig | null>;
}
//# sourceMappingURL=config.d.ts.map
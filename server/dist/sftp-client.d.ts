import { Connection } from 'vscode-languageserver';
import { SftpConfig } from './config';
export declare class SftpClient {
    private client;
    private config;
    private connection;
    private isConnected;
    constructor(config: SftpConfig, connection: Connection);
    private connect;
    private disconnect;
    private getRemotePath;
    uploadFile(localPath: string): Promise<void>;
    downloadFile(localPath: string): Promise<void>;
    uploadFolder(localFolderPath: string): Promise<void>;
    downloadFolder(localFolderPath: string): Promise<void>;
    syncFolder(localFolderPath: string): Promise<void>;
    listRemoteFiles(remotePath: string): Promise<string[]>;
    deleteRemoteFile(remotePath: string): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=sftp-client.d.ts.map
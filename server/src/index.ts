import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  TextDocumentSyncKind,
  InitializeResult,
  ExecuteCommandParams,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import * as path from 'path';
import * as fs from 'fs';
import { SftpClient } from './sftp-client';
import { ConfigManager } from './config';

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let workspaceFolder: string | undefined;
let configManager: ConfigManager | undefined;
let sftpClient: SftpClient | undefined;

connection.onInitialize((params: InitializeParams) => {
  if (params.workspaceFolders && params.workspaceFolders.length > 0) {
    workspaceFolder = params.workspaceFolders[0].uri.replace('file://', '');
  }

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      executeCommandProvider: {
        commands: [
          'sftp.upload',
          'sftp.download',
          'sftp.sync',
          'sftp.uploadFolder',
          'sftp.downloadFolder',
        ],
      },
    },
  };

  return result;
});

connection.onInitialized(async () => {
  connection.console.log('SFTP Language Server initialized');

  if (workspaceFolder) {
    try {
      configManager = new ConfigManager(workspaceFolder);
      const config = await configManager.loadConfig();

      if (config) {
        sftpClient = new SftpClient(config, connection, configManager);
        connection.console.log(`SFTP config loaded for ${config.host}`);

        // Log context path if set
        if (config.context) {
          connection.console.log(`Context path: ${config.context} -> ${configManager.getContextPath()}`);
        }

        // Start file watcher if uploadOnSave is enabled
        if (config.uploadOnSave) {
          connection.console.log('Upload on save is enabled');
        }
      } else {
        connection.console.warn('No SFTP config found');
      }
    } catch (error) {
      connection.console.error(`Failed to initialize SFTP: ${error}`);
    }
  }
});

// Handle document save
documents.onDidSave(async (event) => {
  if (!sftpClient || !configManager) {
    return;
  }

  const config = await configManager.loadConfig();
  if (!config || !config.uploadOnSave) {
    return;
  }

  const filePath = event.document.uri.replace('file://', '');

  // Check if file is within context path
  if (!configManager.isInContext(filePath)) {
    connection.console.log(`File is outside context path: ${filePath}`);
    return;
  }

  // Check if file should be ignored
  if (configManager.shouldIgnore(filePath)) {
    connection.console.log(`Ignoring file: ${filePath}`);
    return;
  }

  try {
    connection.console.log(`Uploading file on save: ${filePath}`);
    await sftpClient.uploadFile(filePath);
    connection.window.showInformationMessage(`Uploaded: ${path.basename(filePath)}`);
  } catch (error) {
    connection.console.error(`Failed to upload file: ${error}`);
    connection.window.showErrorMessage(`Failed to upload: ${error}`);
  }
});

// Handle commands
connection.onExecuteCommand(async (params: ExecuteCommandParams) => {
  if (!sftpClient || !configManager) {
    connection.window.showErrorMessage('SFTP not configured');
    return;
  }

  try {
    switch (params.command) {
      case 'sftp.upload':
        if (params.arguments && params.arguments[0]) {
          const filePath = params.arguments[0] as string;
          await sftpClient.uploadFile(filePath);
          connection.window.showInformationMessage(`Uploaded: ${path.basename(filePath)}`);
        }
        break;

      case 'sftp.download':
        if (params.arguments && params.arguments[0]) {
          const filePath = params.arguments[0] as string;
          await sftpClient.downloadFile(filePath);
          connection.window.showInformationMessage(`Downloaded: ${path.basename(filePath)}`);
        }
        break;

      case 'sftp.sync':
        await sftpClient.syncFolder(workspaceFolder!);
        connection.window.showInformationMessage('Sync completed');
        break;

      case 'sftp.uploadFolder':
        if (params.arguments && params.arguments[0]) {
          const folderPath = params.arguments[0] as string;
          await sftpClient.uploadFolder(folderPath);
          connection.window.showInformationMessage(`Uploaded folder: ${path.basename(folderPath)}`);
        }
        break;

      case 'sftp.downloadFolder':
        if (params.arguments && params.arguments[0]) {
          const folderPath = params.arguments[0] as string;
          await sftpClient.downloadFolder(folderPath);
          connection.window.showInformationMessage(`Downloaded folder: ${path.basename(folderPath)}`);
        }
        break;

      default:
        connection.window.showErrorMessage(`Unknown command: ${params.command}`);
    }
  } catch (error) {
    connection.console.error(`Command failed: ${error}`);
    connection.window.showErrorMessage(`Command failed: ${error}`);
  }
});

// Make the text document manager listen on the connection
documents.listen(connection);

// Listen on the connection
connection.listen();


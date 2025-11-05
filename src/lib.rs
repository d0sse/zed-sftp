use std::fs;
use zed_extension_api::{self as zed, settings::LspSettings, LanguageServerId, Result};

struct SftpExtension {
    did_find_server: bool,
}

impl SftpExtension {
    fn server_exists(&self) -> bool {
        fs::metadata("server/dist/index.js").map_or(false, |stat| stat.is_file())
    }

    fn server_script_path(&mut self, worktree: &zed::Worktree) -> Result<String> {
        let server_exists = self.server_exists();
        if self.did_find_server && server_exists {
            return Ok("server/dist/index.js".to_string());
        }

        zed::set_language_server_installation_status(
            &LanguageServerId("sftp-server".to_string()),
            &zed::LanguageServerInstallationStatus::CheckingForUpdate,
        );

        let version = "1.0.0";

        if !server_exists {
            zed::set_language_server_installation_status(
                &LanguageServerId("sftp-server".to_string()),
                &zed::LanguageServerInstallationStatus::Downloading,
            );

            // Install dependencies
            let npm_install_output = worktree
                .which("npm")
                .ok_or_else(|| "npm not found in PATH".to_string())?;

            // For now, we'll use a simple approach - the server code will be bundled with the extension
            // In a real implementation, you'd want to npm install the dependencies
        }

        self.did_find_server = true;
        Ok("server/dist/index.js".to_string())
    }
}

impl zed::Extension for SftpExtension {
    fn new() -> Self {
        Self {
            did_find_server: false,
        }
    }

    fn language_server_command(
        &mut self,
        language_server_id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        let server_path = self.server_script_path(worktree)?;
        let node_path = zed::node_binary_path()?;

        Ok(zed::Command {
            command: node_path,
            args: vec![
                server_path,
                "--stdio".to_string(),
            ],
            env: worktree.shell_env(),
        })
    }

    fn language_server_workspace_configuration(
        &mut self,
        _language_server_id: &LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<Option<serde_json::Value>> {
        let settings = LspSettings::for_worktree("sftp-server", worktree)
            .ok()
            .and_then(|lsp_settings| lsp_settings.settings.clone())
            .unwrap_or_default();

        Ok(Some(settings))
    }
}

zed::register_extension!(SftpExtension);


use zed_extension_api as zed;

struct SftpExtension;

impl zed::Extension for SftpExtension {
    fn new() -> Self {
        Self
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        worktree: &zed::Worktree,
    ) -> zed::Result<zed::Command> {
        // Get the user's home directory
        let home =
            std::env::var("HOME").map_err(|_| "HOME environment variable not set".to_string())?;

        let installed_path = format!(
            "{}/Library/Application Support/Zed/extensions/installed/sftp",
            home
        );

        // Check if it's a symlink (dev extension)
        let extension_path = std::path::Path::new(&installed_path);
        let resolved_path = if extension_path.is_symlink() {
            std::fs::read_link(extension_path)
                .map_err(|e| format!("Failed to resolve symlink: {}", e))?
        } else {
            extension_path.to_path_buf()
        };

        let server_path = resolved_path.join("server").join("dist").join("index.js");

        // Verify server file exists
        if !server_path.exists() {
            return Err(format!("Server file not found at {:?}", server_path).into());
        }

        Ok(zed::Command {
            command: zed::node_binary_path()?,
            args: vec![
                server_path.to_string_lossy().to_string(),
                "--stdio".to_string(),
            ],
            env: worktree.shell_env(),
        })
    }
}

zed::register_extension!(SftpExtension);

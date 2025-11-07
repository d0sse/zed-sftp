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
        let root_path = worktree.root_path();
        let server_path = format!("{}/server/dist/index.js", root_path);

        Ok(zed::Command {
            command: zed::node_binary_path()?,
            args: vec![
                server_path,
                "--stdio".to_string(),
            ],
            env: worktree.shell_env(),
        })
    }
}

zed::register_extension!(SftpExtension);


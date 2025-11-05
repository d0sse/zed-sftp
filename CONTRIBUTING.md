# Contributing to Zed SFTP Extension

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Current State

This extension is currently a **template/placeholder** because Zed's extension API doesn't yet support the file system operations needed for full SFTP functionality.

## How You Can Help

### 1. Monitor Zed's Extension API Development

The most impactful contribution would be helping to add file system extension support to Zed itself:

- Watch the [Zed repository](https://github.com/zed-industries/zed)
- Participate in discussions about extension API features
- Contribute to Zed core to add necessary APIs

### 2. Improve Documentation

Help improve the workarounds and documentation:

- Test the workarounds on different platforms
- Add new workaround methods
- Improve existing documentation
- Add screenshots and examples
- Translate documentation

### 3. Design the Future API

Help design what the SFTP extension API should look like:

- Review the vscode-sftp feature set
- Propose API designs for Zed
- Create mockups of configuration formats
- Document use cases

### 4. Build Proof of Concepts

If Zed adds relevant APIs:

- Implement basic file transfer
- Add configuration parsing
- Create UI components
- Test on different platforms

## Development Setup

### Prerequisites

1. **Rust** (via rustup):
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. **Zed Editor**:
   - Download from [zed.dev](https://zed.dev)

### Local Development

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/andreyc0d3r/zed-sftp
   cd zed-sftp
   ```

2. Make your changes

3. Test the extension:
   - Open Zed
   - Open Extensions (Cmd+Shift+X / Ctrl+Shift+X)
   - Click "Install Dev Extension"
   - Select this directory

4. Check for errors:
   - Open Zed log: `zed: open log` from command palette
   - Or run Zed from terminal: `zed --foreground`

### Building

```bash
cargo build --release
```

## Code Style

- Follow Rust standard formatting: `cargo fmt`
- Run clippy: `cargo clippy`
- Write clear comments
- Add documentation for public APIs

## Commit Messages

Use conventional commits format:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

Examples:
```
docs: add SSHFS workaround for Linux

feat: add basic extension structure

chore: update dependencies
```

## Pull Request Process

1. **Fork** the repository
2. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

4. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub

6. **Describe your changes**:
   - What does this PR do?
   - Why is it needed?
   - How was it tested?
   - Screenshots (if applicable)

7. **Wait for review** and address feedback

## Testing

Currently, since the extension doesn't have functional code, testing focuses on:

1. **Documentation accuracy**:
   - Test all workarounds on your platform
   - Verify commands work as documented
   - Check for typos and clarity

2. **Extension structure**:
   - Ensure extension loads in Zed
   - Verify no errors in logs
   - Check metadata is correct

3. **Future functionality**:
   - Write tests for planned features
   - Document test cases
   - Create integration test plans

## Documentation Guidelines

When contributing documentation:

1. **Be clear and concise**
2. **Include examples** for all commands
3. **Test on multiple platforms** (macOS, Linux, Windows)
4. **Add troubleshooting** sections
5. **Keep it up to date** with latest Zed versions

### Documentation Structure

```
README.md           - Overview and quick start
WORKAROUNDS.md      - Detailed workaround guides
CONTRIBUTING.md     - This file
LICENSE             - MIT license
```

## Feature Requests

Have an idea? Open an issue with:

1. **Clear title** describing the feature
2. **Use case** - why is this needed?
3. **Proposed solution** - how should it work?
4. **Alternatives** - what else did you consider?
5. **Additional context** - screenshots, examples, etc.

## Bug Reports

Found a bug? Open an issue with:

1. **Clear title** describing the bug
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Environment**:
   - OS and version
   - Zed version
   - Extension version
6. **Logs** (from `zed: open log`)

## Questions

Have questions? You can:

1. Check existing [issues](https://github.com/andreyc0d3r/zed-sftp/issues)
2. Open a new issue with the "question" label
3. Check [Zed's documentation](https://zed.dev/docs)
4. Join [Zed's Discord](https://discord.gg/zed)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

Examples of behavior that contributes to a positive environment:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior:

- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by opening an issue or contacting the project maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- GitHub contributors page

## Resources

- [Zed Extension Documentation](https://zed.dev/docs/extensions)
- [Zed Extension API Docs](https://docs.rs/zed_extension_api/)
- [Zed GitHub Repository](https://github.com/zed-industries/zed)
- [Original vscode-sftp](https://github.com/Natizyskunk/vscode-sftp)
- [Rust Book](https://doc.rust-lang.org/book/)

## Thank You!

Thank you for contributing to make Zed better! 🎉


# Contributing to ReadAI

First off, thank you for considering contributing to ReadAI! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs what actually happened
- **Screenshots** if applicable
- **Environment details** (OS, browser, Python/Node versions)

### Suggesting Features

Feature requests are welcome! Please provide:

- **Clear description** of the feature
- **Use case** - why would this be useful?
- **Possible implementation** approach (optional)

### Pull Requests

1. **Fork** the repo and create your branch from `main`
2. **Install** dependencies and set up the development environment
3. **Make** your changes with clear, descriptive commits
4. **Test** your changes thoroughly
5. **Update** documentation if needed
6. **Submit** your PR with a clear description

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/readai.git
cd readai

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
yarn install
```

## Style Guidelines

### Python (Backend)
- Follow PEP 8
- Use type hints where possible
- Document functions with docstrings

### JavaScript (Frontend)
- Use functional components with hooks
- Follow ESLint configuration
- Use meaningful variable names

### Git Commits
- Use present tense ("Add feature" not "Added feature")
- Keep commits focused and atomic
- Reference issues when applicable (`Fixes #123`)

## Questions?

Feel free to open an issue for any questions!

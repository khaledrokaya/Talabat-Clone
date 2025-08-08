# Contributing to Talabat API

Thank you for your interest in contributing to the Talabat API! This document provides guidelines and information for contributors.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/talabat-api.git
   cd talabat-api
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up your environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

## 📋 Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Your Changes
- Follow the existing code style and patterns
- Write tests for new functionality
- Update documentation as needed
- Ensure all linting and formatting rules pass

### 3. Test Your Changes
```bash
# Run all checks
npm run check

# Run tests
npm test

# Start the development server
npm run dev
```

### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add new feature description"
# or
git commit -m "fix: resolve issue description"
```

Use conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:
- Clear title and description
- Reference any related issues
- Include screenshots if applicable
- Ensure all CI checks pass

## 🎯 Code Standards

### TypeScript Guidelines
- Use strict TypeScript with proper typing
- Avoid `any` types - use proper interfaces
- Follow existing naming conventions
- Use async/await instead of promises where possible

### Code Style
- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Write clear comments for complex logic
- Keep functions small and focused

### API Design
- Follow RESTful conventions
- Use proper HTTP status codes
- Implement comprehensive error handling
- Include request/response validation
- Document all endpoints with Swagger

### Testing
- Write unit tests for new functions
- Include integration tests for API endpoints
- Mock external dependencies
- Aim for good test coverage

## 📁 Project Structure

When adding new features, follow the existing modular structure:

```
src/modules/your-module/
├── routes.ts              # API routes
├── controllers/           # Request handlers
├── services/             # Business logic
├── dto/                  # Data transfer objects
├── interfaces/           # TypeScript interfaces
├── middlewares/          # Module-specific middleware
└── schemas/              # Database models
```

## 🔍 Code Review Process

1. **Automatic Checks**: Ensure all CI checks pass
2. **Peer Review**: At least one team member review
3. **Testing**: Verify functionality works as expected
4. **Documentation**: Check that docs are updated
5. **Security**: Review for potential security issues

## 🐛 Bug Reports

When reporting bugs, please include:
- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to recreate the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node.js version, etc.
- **Additional Context**: Logs, screenshots, etc.

## 💡 Feature Requests

For new features, please:
- Check if similar features exist or are planned
- Describe the use case and benefits
- Provide detailed requirements
- Consider backward compatibility
- Discuss implementation approach

## 🔒 Security

- Never commit sensitive information (passwords, keys, etc.)
- Use environment variables for configuration
- Follow security best practices
- Report security issues privately

## 📚 Documentation

- Update README.md for significant changes
- Add/update Swagger documentation for API changes
- Include inline code comments for complex logic
- Update any relevant guides or tutorials

## ❓ Questions and Support

If you need help:
- Check existing issues and discussions
- Ask questions in pull requests
- Contact the maintainers
- Review the project documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to Talabat API! 🙏

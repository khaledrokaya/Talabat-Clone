# Contributing to Talabat Food Delivery Platform

Thank you for your interest in contributing to the Talabat project! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Development Setup](#development-setup)
- [Testing Guidelines](#testing-guidelines)

## 📜 Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow:

- **Be respectful** and inclusive in all interactions
- **Be collaborative** and helpful to other contributors
- **Be constructive** when providing feedback
- **Be patient** with newcomers and questions
- **Focus on the project** and avoid personal attacks

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Git
- A code editor (VS Code recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Talabat-Nti-Project.git
   cd Talabat-Nti-Project
   ```
3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/Ahmedfahmy8308/Talabat-Nti-Project.git
   ```

## 🔄 Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards

3. **Test your changes**:
   ```bash
   cd Api
   npm test
   npm run lint
   ```

4. **Commit your changes** using conventional commits

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** from your fork to the main repository

## 🏗️ Project Structure

```
Talabat/
├── Api/                    # Backend API
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── config/         # Configuration
│   │   └── docs/           # Documentation
│   ├── tests/              # Test files
│   └── package.json
├── FrontEnd/               # Frontend (Coming Soon)
├── docs/                   # Project documentation
├── README.md               # Main project documentation
├── LICENSE                 # License file
└── CONTRIBUTING.md         # This file
```

## 💻 Coding Standards

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Use **meaningful variable names** and **descriptive function names**
- Add **JSDoc comments** for public APIs
- Prefer **async/await** over promises chains
- Use **interface** over **type** for object shapes

### File Naming

- Use **kebab-case** for file names: `user-service.ts`
- Use **PascalCase** for class names: `UserService`
- Use **camelCase** for function and variable names: `getUserById`
- Use **UPPER_SNAKE_CASE** for constants: `MAX_RETRY_ATTEMPTS`

### API Design

- Follow **RESTful** conventions
- Use appropriate **HTTP status codes**
- Implement proper **error handling**
- Add **input validation** for all endpoints
- Document APIs with **Swagger/OpenAPI**

### Database

- Use **descriptive schema names**
- Add **proper indexes** for performance
- Implement **data validation** at schema level
- Use **MongoDB best practices**

## 📝 Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```bash
feat(auth): add JWT token refresh functionality
fix(order): resolve order status update issue
docs(api): update authentication documentation
test(user): add unit tests for user service
```

## 🔍 Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Add or update tests** for your changes
3. **Run the test suite** and ensure all tests pass
4. **Run linting** and fix any issues
5. **Update CHANGELOG.md** if applicable

### PR Requirements

- **Clear title** describing the change
- **Detailed description** of what was changed and why
- **Reference any related issues**: `Fixes #123`
- **Screenshots** for UI changes (when frontend is available)
- **Breaking changes** must be clearly documented

### Review Process

1. At least **one maintainer review** is required
2. All **CI checks** must pass
3. **No merge conflicts** with the main branch
4. **All conversations** must be resolved

## 🐛 Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Clear title** and description
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Environment details** (Node.js version, OS, etc.)
- **Screenshots or logs** if applicable

### Feature Requests

For new features, provide:

- **Clear description** of the feature
- **Use case** and motivation
- **Proposed implementation** (if you have ideas)
- **Acceptance criteria**

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or improvement
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority: high/medium/low`: Issue priority

## 🛠️ Development Setup

### Backend Setup

1. **Navigate to API directory**:
   ```bash
   cd Api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

### Database Setup

1. **Install MongoDB** locally or use MongoDB Atlas
2. **Create database**: `talabat_dev`
3. **Update connection string** in `.env`

## 🧪 Testing Guidelines

### Unit Tests

- Write **unit tests** for all services and utilities
- Use **Jest** testing framework
- Aim for **80%+ code coverage**
- Mock external dependencies

### Integration Tests

- Test **API endpoints** with real database
- Use **test database** (separate from development)
- Test **authentication and authorization**
- Test **error scenarios**

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- user.service.test.ts
```

## 📚 Documentation

### Code Documentation

- Add **JSDoc comments** for public APIs
- Document **complex algorithms** and business logic
- Keep **README files** up to date
- Update **API documentation** for endpoint changes

### API Documentation

- Use **Swagger/OpenAPI** for API documentation
- Document **request/response schemas**
- Provide **example requests and responses**
- Document **error responses**

## 🚀 Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Create release branch**: `release/v1.2.0`
2. **Update version** in `package.json`
3. **Update CHANGELOG.md**
4. **Create pull request** to main
5. **Tag release** after merge
6. **Deploy to production**

## 🤝 Community

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **Pull Requests**: Code contributions and discussions
- **Code Reviews**: Collaborative improvement process

### Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **CHANGELOG.md** for significant contributions
- **Release notes** for major features

## ❓ Questions?

If you have questions about contributing:

1. **Check existing issues** and documentation
2. **Search closed issues** for similar questions
3. **Create a new issue** with the `question` label
4. **Be specific** about what you need help with

Thank you for contributing to Talabat! 🎉

# Contributing to MED-AID SAARTHI v2.0

🎉 Thank you for considering contributing to MED-AID SAARTHI! This healthcare platform aims to bridge healthcare gaps in India with AI, privacy-first architecture, and government integration.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pre-Commit Hooks](#pre-commit-hooks)
- [Security Requirements](#security-requirements)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, background, or identity.

### Expected Behavior

- ✅ Be respectful and considerate
- ✅ Collaborate openly and constructively
- ✅ Focus on what is best for the community
- ✅ Show empathy towards others

### Unacceptable Behavior

- ❌ Harassment, discrimination, or inappropriate conduct
- ❌ Publishing others' private information
- ❌ Trolling, insulting, or derogatory comments

**Report issues**: Contact maintainers at [security@medaidsathi.com](mailto:security@medaidsathi.com)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or higher ([nvm recommended](https://github.com/nvm-sh/nvm))
- **npm**: v10 or higher
- **Git**: Latest version
- **Supabase account**: For database access
- **Python 3.11+**: For backend modules (optional)

### Initial Setup

1. **Fork the repository**:
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/YOUR_USERNAME/medaid-sathi-extract.git
   cd medaid-sathi-extract/medaid-sathi-extract
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Generate secure secrets**:
   ```bash
   # Generate 64-character secrets for encryption
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Run database migrations**:
   ```bash
   # Apply migrations in Supabase SQL Editor
   # Files in supabase/migrations/
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

---

## 🔄 Development Workflow

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `security/description` - Security improvements
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/fixes

**Examples**:
- `feature/add-video-consultation`
- `fix/authentication-timeout`
- `security/rotate-jwt-secrets`

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `security`: Security improvement
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code restructuring
- `test`: Test additions/fixes
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(auth): add multi-factor Health ID creation

- Implement age-based document selection
- Add zero-knowledge privacy storage
- Create comprehensive documentation

Closes #123

security(encryption): upgrade to HMAC-SHA256 with 64-char secrets

- Migrate from SHA-256 to HMAC-SHA256
- Implement envelope encryption for PHI
- Add JWT token rotation with 15-min expiry

BREAKING CHANGE: Requires re-encryption of existing data
```

---

## 🔒 Pre-Commit Hooks

### Setup Pre-Commit Hooks

1. **Install husky**:
   ```bash
   npm install --save-dev husky
   npx husky install
   ```

2. **Create pre-commit hook**:
   ```bash
   npx husky add .husky/pre-commit "npm run pre-commit"
   ```

3. **Add to package.json**:
   ```json
   {
     "scripts": {
       "pre-commit": "npm run lint && npm run type-check && npm run secret-scan",
       "lint": "eslint . --fix",
       "type-check": "tsc --noEmit",
       "secret-scan": "node scripts/scan-secrets.js"
     }
   }
   ```

### Pre-Commit Checklist

Before every commit, the following checks run automatically:

- ✅ **Linting**: ESLint with auto-fix
- ✅ **Type checking**: TypeScript compilation check
- ✅ **Secret scanning**: Detect exposed API keys
- ✅ **Formatting**: Prettier auto-format (if configured)

### Manual Secret Scan

```bash
# Install gitleaks
brew install gitleaks  # macOS
# OR
curl -sSfL https://raw.githubusercontent.com/gitleaks/gitleaks/master/scripts/install.sh | sh

# Run scan
gitleaks detect --source . --verbose
```

**Common secrets to avoid**:
- ❌ API keys (Supabase, Google Maps, OpenAI)
- ❌ Database passwords
- ❌ JWT secrets
- ❌ Private keys (.pem, .key files)

---

## 🛡️ Security Requirements

### CRITICAL: Never Commit

- ❌ `.env.local` or `.env` files
- ❌ API keys, tokens, or secrets
- ❌ Aadhaar numbers (even for testing)
- ❌ Patient health data (PHI)
- ❌ Database credentials

### Security Checklist for PRs

- [ ] No hardcoded secrets in code
- [ ] All sensitive data encrypted at rest
- [ ] RLS policies updated for new tables
- [ ] Audit logging added for data access
- [ ] Input validation for user data
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized output)
- [ ] CSRF tokens for state-changing operations
- [ ] Rate limiting for authentication endpoints

### Security Review Required For

- 🔒 Authentication/authorization changes
- 🔒 Database schema modifications
- 🔒 API endpoint additions
- 🔒 Encryption algorithm changes
- 🔒 Third-party library additions
- 🔒 File upload handling

**Label PR with**: `security-review-required`

---

## 📝 Pull Request Process

### 1. Before Creating PR

- [ ] Code compiles without errors
- [ ] All tests pass (when implemented)
- [ ] Linting passes (npm run lint)
- [ ] Type checking passes (npm run type-check)
- [ ] No secrets exposed
- [ ] Updated documentation (if needed)
- [ ] Added tests for new features

### 2. PR Title Format

```
<type>: <short description>

[feat] Add Health ID verification with government documents
[fix] Resolve authentication timeout issue
[security] Implement JWT token rotation
```

### 3. PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Security improvement
- [ ] Documentation update
- [ ] Breaking change

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] Security impact assessed

## Related Issues
Closes #123
```

### 4. Code Review Process

1. **Automated checks**: CI/CD runs security scans, linting, tests
2. **Peer review**: At least 1 approval required
3. **Security review**: Required for sensitive changes
4. **Final review**: Maintainer approval

### 5. Merge Requirements

- ✅ All CI checks passing
- ✅ At least 1 approval
- ✅ No merge conflicts
- ✅ Up-to-date with main branch
- ✅ Security review (if applicable)

---

## 🎨 Coding Standards

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow **ESLint** rules (`.eslintrc.js`)
- Use **functional components** with hooks (React)
- Avoid **any** type (use specific types)
- Add **JSDoc comments** for public functions

**Example**:
```typescript
/**
 * Hash sensitive document using HMAC-SHA256.
 * 
 * @param data - Sensitive data to hash
 * @param secret - HMAC secret key
 * @returns Hex-encoded hash
 */
export function hmacHash(data: string, secret: string): string {
  if (!data) throw new Error('Data cannot be empty');
  if (!secret) throw new Error('Secret not configured');
  
  const hmac = createHmac('sha256', secret);
  hmac.update(data);
  return hmac.digest('hex');
}
```

### React Components

- Use **functional components** with hooks
- Extract **custom hooks** for reusable logic
- Keep components **small and focused**
- Use **TypeScript interfaces** for props
- Add **prop validation** with TypeScript

**Example**:
```typescript
interface HealthIdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHealthIdGenerated: (healthId: string) => void;
}

export const HealthIdDialog: React.FC<HealthIdDialogProps> = ({
  open,
  onOpenChange,
  onHealthIdGenerated,
}) => {
  // Component implementation
};
```

### File Organization

```
src/
├── components/       # Reusable UI components
├── pages/           # Page-level components
├── lib/             # Utility functions
├── config/          # Configuration modules
│   ├── security.ts  # Cryptographic operations
│   ├── privacy.ts   # Privacy & compliance
│   └── monitoring.ts # Metrics & logging
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── integrations/    # Third-party integrations
```

### Naming Conventions

- **Components**: PascalCase (`HealthIdDialog.tsx`)
- **Functions**: camelCase (`generateHealthId`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_LOGIN_ATTEMPTS`)
- **Files**: kebab-case (`health-id-verification.tsx`)
- **CSS classes**: kebab-case (`health-id-input`)

---

## 🧪 Testing Guidelines

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { Security } from '@/config/security';

describe('Security Module', () => {
  describe('hmacHash', () => {
    it('should hash data with HMAC-SHA256', () => {
      const hash = Security.hmacHash('test-data', 'secret-key');
      expect(hash).toHaveLength(64); // SHA256 hex = 64 chars
    });
    
    it('should throw error for empty data', () => {
      expect(() => Security.hmacHash('', 'secret')).toThrow();
    });
  });
});
```

### Test Coverage Goals

- **Critical paths**: 90%+ coverage
- **Security functions**: 100% coverage
- **Utility functions**: 80%+ coverage
- **UI components**: 60%+ coverage

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

---

## 📚 Documentation

### Code Documentation

- Add **JSDoc comments** for all exported functions
- Include **examples** in complex functions
- Document **side effects** and **error cases**
- Add **type annotations** everywhere

### README Updates

Update `README.md` when adding:
- New features
- Configuration options
- Setup steps
- API changes

### Changelog

Update `CHANGELOG.md` with:
- Version number
- Release date
- Notable changes (Added, Changed, Deprecated, Removed, Fixed, Security)

---

## 🐛 Bug Reports

### Before Reporting

- [ ] Search existing issues
- [ ] Reproduce on latest version
- [ ] Check if it's a known limitation

### Bug Report Template

```markdown
**Describe the bug**
Clear description of what's wrong

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
Add screenshots if applicable

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., v2.0.0]

**Additional context**
Any other relevant information
```

---

## ✨ Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Describe the problem

**Describe the solution you'd like**
Clear description of desired feature

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Mockups, examples, references
```

---

## 🙏 Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- Release notes
- Project README

Thank you for making MED-AID SAARTHI better! 🚀

---

**Questions?** Reach out:
- 📧 Email: support@medaidsathi.com
- 💬 Discussions: [GitHub Discussions](https://github.com/AnshXGrind/medaid-sathi-extract/discussions)
- 🐛 Issues: [GitHub Issues](https://github.com/AnshXGrind/medaid-sathi-extract/issues)

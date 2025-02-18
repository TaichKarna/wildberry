# Contributing to Wildberry Backend

We love your input! We want to make contributing to Wildberry as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Pull Request Process

1. Update the README.md with details of changes to the interface, if applicable.
2. Update the docs/api.md with any API changes.
3. The PR may be merged once you have the sign-off of two other developers.

## Code Style

### TypeScript

- Use TypeScript for all new code
- Follow the existing code style
- Use interfaces over types where possible
- Document complex functions and classes
- Use async/await over raw promises

Example:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

async function getUser(id: string): Promise<User> {
  try {
    return await db.users.findOne({ id });
  } catch (error) {
    throw new ApiError('USER_NOT_FOUND');
  }
}
```

### Testing

- Write unit tests for all new code
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern
- Mock external dependencies

Example:
```typescript
describe('UserService', () => {
  describe('getUser', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = '123';
      const mockUser = { id: userId, name: 'Test User' };
      jest.spyOn(db.users, 'findOne').mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUser(userId);

      // Assert
      expect(result).toEqual(mockUser);
    });
  });
});
```

### Error Handling

Use the custom error classes:

```typescript
throw new ApiError('VALIDATION_ERROR', 'Invalid input', {
  field: 'email',
  constraint: 'format'
});
```

### Logging

Use the logger service for all logging:

```typescript
import { logger } from '../services/logger';

logger.info('Processing request', { userId, action });
logger.error('Failed to process', { error, context });
```

## Branch Naming

- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`
- Performance improvements: `perf/description`

Example: `feature/add-subscription-management`

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code
- refactor: Code change that neither fixes a bug nor adds a feature
- perf: Code change that improves performance
- test: Adding missing tests
- chore: Changes to the build process or auxiliary tools

Example:
```
feat(auth): add refresh token endpoint

- Add refresh token endpoint
- Add token rotation
- Update tests and documentation

Closes #123
```

## Issue and Pull Request Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation only changes
- `help-wanted`: Extra attention is needed
- `good-first-issue`: Good for newcomers
- `question`: Further information is requested
- `security`: Security related issue
- `performance`: Performance related issue
- `dependencies`: Dependencies update

## Setting Up Development Environment

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Run database migrations:
```bash
npm run migrate
```

4. Start development server:
```bash
npm run dev
```

5. Run tests:
```bash
npm test
```

## Code Review Process

1. Another developer must review your code
2. All tests must pass
3. Code coverage should not decrease
4. Documentation must be updated
5. CI checks must pass

## Community

- Respect our Code of Conduct
- Be welcoming to newcomers
- Help others learn and grow

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

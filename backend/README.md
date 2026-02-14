# Backend API

Server-side application handling business logic, database operations, and API endpoints.

## 📂 Folder Structure

### `src/controllers/`
- Handle incoming HTTP requests
- Process request data and send responses
- **Examples**: `authController.js`, `blogController.js`, `userController.js`

### `src/models/`
- Define database schemas and models
- Database table representations
- **Examples**: `User.js`, `Blog.js`, `Comment.js`, `Category.js`

### `src/routes/`
- Define API endpoints and route mappings
- Connect URLs to controller functions
- **Examples**: `authRoutes.js`, `blogRoutes.js`, `userRoutes.js`

### `src/middlewares/`
- Request processing before reaching controllers
- **Examples**: `authMiddleware.js` (verify JWT), `validationMiddleware.js`, `errorHandler.js`

### `src/services/`
- Business logic layer
- Reusable service functions
- **Examples**: `authService.js`, `emailService.js`, `imageService.js`

### `src/config/`
- Configuration files
- **Examples**: `database.js`, `server.js`, `jwt.js`

### `src/utils/`
- Helper functions and utilities
- **Examples**: `logger.js`, `validators.js`, `responseFormatter.js`

### `tests/`
- Unit and integration tests
- **Examples**: `auth.test.js`, `blog.test.js`

## 🔧 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (or Fastify)
- **ORM**: Sequelize or Prisma (for PostgreSQL)
- **Authentication**: JWT, bcrypt
- **Validation**: Joi or express-validator

## 🚀 Getting Started

```bash
cd backend
npm install
npm run dev
```

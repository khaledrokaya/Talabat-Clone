# 🍔 Talabat API

A comprehensive food delivery platform API built with Express.js, TypeScript, and MongoDB. This RESTful API provides complete functionality for managing restaurants, customers, delivery personnel, orders, and administrative operations.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Modules Overview](#modules-overview)
- [Authentication & Authorization](#authentication--authorization)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🛒 Cart Management

### Cart Schema
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  items: [{
    meal: ObjectId (ref: 'Meal'),
    mealName: String,
    mealId: String,
    price: Number,
    quantity: Number,
    restaurant: ObjectId (ref: 'Restaurant')
  }],
  totalAmount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Cart Endpoints

#### Get User Cart
- **GET** `/api/v1/cart`
- **Auth**: Required
- **Description**: Retrieve the current user's cart
- **Response**: Cart object with populated meal and restaurant details

#### Add Item to Cart
- **POST** `/api/v1/cart/add`
- **Auth**: Required
- **Body**:
  ```json
  {
    "mealId": "meal_object_id",
    "quantity": 2
  }
  ```
- **Response**: Updated cart object

#### Update Cart Item
- **PUT** `/api/v1/cart/update`
- **Auth**: Required
- **Body**:
  ```json
  {
    "mealId": "meal_object_id",
    "quantity": 3
  }
  ```
- **Response**: Updated cart object

#### Remove Item from Cart
- **DELETE** `/api/v1/cart/remove/:mealId`
- **Auth**: Required
- **Response**: Updated cart object

#### Clear Cart
- **DELETE** `/api/v1/cart/clear`
- **Auth**: Required
- **Response**: Success message

#### Get Cart Total
- **GET** `/api/v1/cart/total`
- **Auth**: Required
- **Response**: 
  ```json
  {
    "totalAmount": 45.99,
    "itemCount": 3
  }
  ```
- Restaurant registration and profile management
- Menu and meal management
- Order tracking and processing
- Revenue analytics and reporting
- Availability and discount management

### 👥 User Management
- Multi-role authentication (Customer, Restaurant, Delivery, Admin)
- JWT-based secure authentication
- Role-based access control
- Profile management and preferences

### 🛍️ Order Management
- Real-time order placement and tracking
- Payment integration support
- Order history and status management
- Rating and review system
- Order cancellation and refund handling

### 🚚 Delivery System
- Delivery personnel management
- Real-time location tracking
- Delivery assignment and optimization
- Availability and schedule management
- Performance tracking

### 🔧 Administrative Tools
- System-wide analytics and reporting
- User and restaurant management
- Order monitoring and dispute resolution
- Platform configuration and settings

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **Testing**: Jest
- **Development**: ts-node-dev, ESLint, Prettier

## 🏗️ Architecture

The API follows a modular architecture with clear separation of concerns:

```
├── src/
│   ├── app.ts                 # Application entry point
│   ├── config/                # Configuration files
│   ├── docs/                  # API documentation
│   └── modules/               # Feature modules
│       ├── admin/             # Administrative functionality
│       ├── auth/              # Authentication & authorization
│       ├── delivery/          # Delivery management
│       ├── meal/              # Meal catalog
│       ├── order/             # Order processing
│       ├── restaurant/        # Restaurant management
│       ├── shared/            # Shared utilities & middleware
│       └── user/              # User management
```

Each module contains:
- **Routes**: API endpoint definitions
- **Controllers**: Business logic handlers
- **Services**: Core business logic
- **DTOs**: Data Transfer Objects
- **Interfaces**: Type definitions
- **Middlewares**: Module-specific middleware
- **Schemas**: Database models

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Talabat/Api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/TalabatDB

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (for OTP and notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@talabat.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Security
BCRYPT_SALT_ROUNDS=12
```

## 📚 API Documentation

The API is fully documented using Swagger/OpenAPI 3.0. Once the server is running, you can access:

- **Swagger UI**: `http://localhost:3000/swagger`
- **OpenAPI JSON**: `http://localhost:3000/api`

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### API Endpoints Overview

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/api/auth` | User authentication and registration |
| Admin | `/api/admin` | Administrative operations |
| Restaurant (Public) | `/api/restaurants` | Public restaurant browsing |
| Restaurant (Management) | `/api/restaurants/manage` | Restaurant owner operations |
| Customer | `/api/customers` | Customer-specific operations |
| Delivery | `/api/delivery` | Delivery personnel operations |
| Orders | `/api/orders` | Order management |
| Meals | `/api/meals` | Meal catalog operations |

## 📁 Project Structure

```
src/
├── app.ts                          # Main application file
├── config/
│   ├── database.ts                 # Database configuration
│   └── startup.ts                  # Application initialization
├── docs/
│   └── swagger.ts                  # Swagger configuration
└── modules/
    ├── admin/
    │   ├── routes.ts
    │   ├── controllers/
    │   ├── dto/
    │   ├── interfaces/
    │   ├── middlewares/
    │   └── services/
    ├── auth/
    │   ├── routes.ts
    │   ├── controllers/
    │   │   └── auth.controller.ts
    │   ├── dto/
    │   ├── interfaces/
    │   ├── middlewares/
    │   │   └── auth.middleware.ts
    │   ├── schemas/
    │   │   └── otp.schema.ts
    │   └── services/
    ├── delivery/
    │   ├── routes.ts
    │   ├── controllers/
    │   ├── dto/
    │   ├── interfaces/
    │   ├── middlewares/
    │   └── services/
    ├── meal/
    │   └── schemas/
    ├── order/
    │   ├── dto/
    │   └── schemas/
    ├── restaurant/
    │   ├── routes/
    │   │   ├── public.routes.ts      # Public restaurant endpoints
    │   │   └── restaurant-user.routes.ts  # Restaurant management
    │   ├── controllers/
    │   ├── dto/
    │   ├── interfaces/
    │   ├── middlewares/
    │   ├── schemas/
    │   └── services/
    ├── shared/
    │   ├── interfaces/
    │   ├── middlewares/
    │   └── utils/
    └── user/
        ├── routes.ts
        ├── controllers/
        ├── dto/
        ├── interfaces/
        ├── middlewares/
        │   └── user.middleware.ts
        ├── schemas/
        │   ├── admin.schema.ts
        │   ├── base-user.schema.ts
        │   ├── customer.schema.ts
        │   ├── delivery.schema.ts
        │   ├── index.ts
        │   └── restaurant.schema.ts
        └── services/
```

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run start:dev    # Alternative development command

# Production
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run check        # Run all checks (format, lint, build)

# Testing
npm test             # Run Jest tests
```

## 🧩 Modules Overview

### Authentication Module
- User registration and login
- JWT token management
- Password reset with OTP
- Role-based access control
- Session management

### Restaurant Module
- **Public Routes**: Restaurant discovery, menu browsing, search
- **Management Routes**: Profile management, menu editing, order processing
- Geolocation-based search
- Rating and review system

### Order Module
- Order placement and tracking
- Payment processing integration
- Order history and management
- Rating and feedback system
- Cancellation and refund handling

### Delivery Module
- Delivery personnel registration
- Real-time location tracking
- Order assignment and management
- Availability scheduling
- Performance analytics

### User Management
- Multi-role user system (Customer, Restaurant, Delivery, Admin)
- Profile management
- Preference settings
- Address management

### Admin Module
- System analytics and reporting
- User and restaurant management
- Order monitoring
- Platform configuration

## 🔐 Authentication & Authorization

The API uses JWT-based authentication with role-based access control:

### User Roles
- **Customer**: Can browse restaurants, place orders, track deliveries
- **Restaurant**: Can manage restaurant profile, menu, and process orders
- **Delivery**: Can manage delivery assignments and update order status
- **Admin**: Full system access for management and analytics

### Authentication Flow
1. User registers/logs in with credentials
2. Server validates and returns JWT token
3. Client includes token in Authorization header
4. Server validates token and extracts user information
5. Route-level middleware checks user permissions

### Protected Routes
Most endpoints require authentication. Public endpoints include:
- Restaurant browsing
- Menu viewing
- User registration
- Password reset initiation

## 🗄️ Database Schema

The application uses MongoDB with Mongoose ODM. Key collections include:

- **Users**: Customer, restaurant, delivery, and admin profiles
- **Restaurants**: Restaurant information and settings
- **Meals**: Menu items and meal details
- **Orders**: Order information and tracking
- **Reviews**: Customer reviews and ratings
- **OTP**: One-time passwords for verification

## 🔧 Development Guidelines

### Code Style
- TypeScript with strict type checking
- ESLint + Prettier for code formatting
- Modular architecture with clear separation
- Comprehensive error handling
- Input validation on all endpoints

### API Design Principles
- RESTful design patterns
- Consistent response formats
- Comprehensive error messages
- Proper HTTP status codes
- Rate limiting and security headers

### Testing
- Unit tests with Jest
- Integration tests for API endpoints
- Mock services for external dependencies
- Test coverage reporting

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/app.js"]
```

### Environment Setup
1. Configure production environment variables
2. Set up MongoDB replica set for production
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Configure monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow
1. Follow TypeScript and ESLint guidelines
2. Write tests for new features
3. Update API documentation
4. Ensure all checks pass (`npm run check`)
5. Submit detailed pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the API documentation at `/swagger`

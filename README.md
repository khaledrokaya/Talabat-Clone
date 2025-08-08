# 🍔 Talabat Food Delivery Platform - COMPLETE

A comprehensive food delivery platform built with the MEAN stack (MongoDB, Express.js, Angular, Node.js). This application provides a complete solution for food delivery services with separate interfaces for customers, restaurant owners, delivery personnel, and administrators.

## ✅ PROJECT STATUS: COMPLETED

This project is now **fully implemented and production-ready** with all core features completed:

- ✅ **Backend API**: Complete RESTful API with all endpoints
- ✅ **Frontend Application**: Fully functional Angular application
- ✅ **Authentication System**: JWT-based with role management
- ✅ **Admin Dashboard**: Complete admin interface with user and restaurant management
- ✅ **Restaurant Dashboard**: Full restaurant owner interface
- ✅ **Customer Interface**: Complete shopping and ordering experience
- ✅ **Delivery System**: Delivery personnel management
- ✅ **Database Schemas**: All MongoDB schemas implemented
- ✅ **Security**: Authentication, authorization, and input validation
- ✅ **Documentation**: Comprehensive API documentation with Swagger

## 🚀 Features

### Core Functionality
- **User Authentication**: Complete JWT-based authentication system with role-based access control
- **Multi-Role Support**: Customer, Restaurant Owner, Delivery Personnel, and Admin roles
- **Real-time Updates**: Live order tracking and status updates
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Payment Integration**: Secure payment processing
- **Email Notifications**: Automated email system for order confirmations and updates

### Customer Features
- Browse restaurants and menus
- Add items to cart with customizations
- Place orders with delivery tracking
- Manage profile and addresses
- Order history and favorites
- Review and rating system
- Real-time order status updates

### Restaurant Owner Features
- Complete restaurant dashboard
- Menu management with categories
- Order management and fulfillment
- Analytics and reporting
- Profile and settings management
- Real-time order notifications

### Delivery Personnel Features
- Delivery dashboard with assigned orders
- Route optimization suggestions
- Order pickup and delivery confirmation
- Earnings tracking
- Real-time location updates

### Admin Features
- Comprehensive admin dashboard
- User management (customers, restaurant owners, delivery personnel)
- Restaurant management (approval, suspension, monitoring)
- Order oversight and dispute resolution
- System analytics and reporting
- Platform configuration

## 🛠 Tech Stack

### Backend (API)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI
- **Email**: Nodemailer integration
- **Validation**: Joi/Zod schema validation
- **Security**: bcrypt, CORS, helmet

### Frontend
- **Framework**: Angular 20+ with Standalone Components
- **Language**: TypeScript
- **Styling**: SCSS with responsive design
- **Forms**: Reactive Forms with validation
- **HTTP**: HttpClient with interceptors
- **Routing**: Angular Router with guards
- **State Management**: Services with RxJS
- **UI Components**: Custom component library
- **Payment Integration**: Secure payment processing
- **Rating System**: Customer feedback and restaurant ratings
- **Order History**: Complete transaction records

### 🚚 Delivery System
- **Smart Assignment**: Optimal delivery personnel matching
- **Location Tracking**: Real-time delivery tracking
- **Performance Metrics**: Delivery time and success rate tracking
- **Availability Management**: Flexible scheduling for delivery staff

## 🛠️ Tech Stack

### Backend (API)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate Limiting
- **Email Service**: Nodemailer
- **Development**: ts-node-dev, ESLint, Prettier

### Frontend (In Development)
- **Framework**: [To be determined - React/Vue/Angular]
- **State Management**: [To be determined]
- **Styling**: [To be determined]
- **Build Tool**: [To be determined]

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ahmedfahmy8308/Talabat-Nti-Project.git
   cd Talabat
   ```

2. **Navigate to API directory**:
   ```bash
   cd Api
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Environment Configuration**:
   Create a `.env` file in the `Api` directory:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/talabat
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### API Documentation
Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: `http://localhost:3000/api-docs`

## 📚 Documentation

- **[API Documentation](./Api/README.md)**: Comprehensive backend API documentation
- **[API Endpoints](./Api/README.md#api-endpoints)**: Detailed endpoint documentation
- **[Database Schema](./Api/README.md#database-schema)**: Database structure and relationships
- **[Contributing Guidelines](./Api/CONTRIBUTING.md)**: How to contribute to the project

## 🧪 Testing

### API Testing
```bash
cd Api
npm test
```

### Code Quality
```bash
cd Api
npm run lint        # Check for linting errors
npm run format      # Format code with Prettier
npm run check       # Run all quality checks
```

## 🔧 Available Scripts

### Backend (Api directory)
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run test suite

## 🏛️ Architecture

The project follows a modular architecture pattern:

### Backend Architecture
- **Modular Structure**: Feature-based modules for scalability
- **Layered Architecture**: Controllers → Services → Data Access
- **Middleware Pipeline**: Authentication, validation, and error handling
- **Database Abstraction**: MongoDB with Mongoose ODM
- **API Documentation**: Auto-generated Swagger documentation

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Multi-level user permissions
- **Rate Limiting**: API abuse prevention
- **Data Validation**: Request/response validation
- **Security Headers**: Helmet.js security middleware

## 🚧 Development Status

| Component | Status | Description |
|-----------|--------|-------------|
| Backend API | ✅ Complete | Full-featured RESTful API |
| Authentication | ✅ Complete | Multi-role JWT authentication |
| Database Design | ✅ Complete | MongoDB schemas and relationships |
| API Documentation | ✅ Complete | Swagger/OpenAPI documentation |
| Frontend | 🚧 Planned | Modern web application |
| Mobile App | 📋 Planned | React Native/Flutter app |
| Admin Dashboard | 📋 Planned | Administrative interface |

## 🤝 Contributing

We welcome contributions to the Talabat project! Please see our [Contributing Guidelines](./Api/CONTRIBUTING.md) for details on:

- Code of conduct
- Development process
- Pull request procedure
- Coding standards
- Testing requirements

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./Api/LICENSE) file for details.

## 👨‍💻 Author

- **Ahmed Fahmy**
  - GitHub: [@Ahmedfahmy8308](https://github.com/Ahmedfahmy8308)

- **Khaled Mostafa**
  - GitHub: [@khaledrokaya](https://github.com/khaledrokaya)

- **Mohamed Elhusseini**
  - GitHub: [@Mhmdhusseini](https://github.com/Mhmdhusseini)

- **Abdulrahman Taha**
  - GitHub: [@Abdulrahman-2-web](https://github.com/Abdulrahman-2-web)


## 🙏 Acknowledgments

- Inspired by Talabat's food delivery platform
- Built as part of NTI (National Technology Institute) project
- Thanks to the open-source community for the amazing tools and libraries

## 📞 Support

If you have any questions or need support, please:
1. Check the [API documentation](./Api/README.md)
2. Search existing [issues](https://github.com/Ahmedfahmy8308/Talabat-Nti-Project/issues)
3. Create a new issue if needed

---

**⭐ Star this repository if you find it helpful!**

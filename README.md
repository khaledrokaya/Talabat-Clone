# 🍕 Talabat Platform - Food Delivery System

A comprehensive, full-stack food delivery platform built with modern web technologies. This platform enables seamless food ordering and delivery operations with dedicated interfaces for customers, restaurants, delivery personnel, and administrators.

## 🌟 Project Overview

Talabat Platform is a complete food delivery ecosystem that replicates the functionality of major delivery platforms like Talabat, Uber Eats, and DoorDash. The platform provides real-time order management, cart functionality, authentication, and multi-role access control.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │
│   (Angular 18)  │◄──►│  (Node.js +     │
│                 │    │   Express +     │
│                 │    │   MongoDB)      │
└─────────────────┘    └─────────────────┘
         │                       │
         │                       │
    ┌─────────┐              ┌─────────┐
    │ Client  │              │Database │
    │ Browser │              │(MongoDB)│
    └─────────┘              └─────────┘
```

## ✨ Key Features

### 👥 Multi-Role System
- **Customers**: Browse restaurants, manage cart, place orders, track deliveries
- **Restaurants**: Manage menus, process orders, update restaurant information
- **Delivery Personnel**: Accept deliveries, update order status, track earnings
- **Administrators**: Oversee platform operations, manage users and restaurants

### 🛒 Advanced Cart System
- **Real-time Cart Management**: Add, update, and remove items instantly
- **Cross-Device Synchronization**: Cart data persisted via API (no localStorage)
- **Order Validation**: Automatic price calculation and inventory checking
- **Multi-Restaurant Support**: Handle orders from different restaurants

### 🔐 Robust Authentication
- **JWT-based Authentication**: Secure token-based auth system
- **Role-Based Access Control**: Fine-grained permissions per user type
- **Email Verification**: Account activation via email
- **Password Recovery**: Secure password reset functionality

### 📱 Responsive Design
- **Mobile-First**: Optimized for all device sizes
- **Progressive Web App**: Fast loading and offline capabilities
- **Modern UI/UX**: Clean, intuitive interface design

## 🛠️ Technology Stack

### Frontend
- **Framework**: Angular 18.x with TypeScript
- **Styling**: SCSS + Bootstrap 5
- **State Management**: RxJS Observables
- **Build Tool**: Angular CLI
- **Testing**: Jasmine + Karma

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

### DevOps & Deployment
- **Containerization**: Docker support
- **Cloud Platforms**: Vercel deployment ready
- **Version Control**: Git with semantic versioning
- **CI/CD**: Automated testing and deployment

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (v5.0+)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Talabat_Platform
   ```

2. **Backend Setup**
   ```bash
   cd Api
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ng serve
   ```

4. **Access the Application**
   - Frontend: `http://localhost:4200`
   - Backend API: `http://localhost:3000`
   - API Documentation: `http://localhost:3000/api-docs`

## 📋 Environment Variables

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/talabat_platform
MONGODB_TEST_URI=mongodb://localhost:27017/talabat_test

# JWT
JWT_SECRET=your_super_secure_jwt_secret
JWT_EXPIRE=7d

# Email (for verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:4200
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1'
};
```

## 📁 Project Structure

```
Talabat_Platform/
├── 📁 Api/                     # Backend API
│   ├── 📁 src/
│   │   ├── 📁 config/          # Database & app configuration
│   │   ├── 📁 modules/         # Feature modules
│   │   │   ├── 📁 auth/        # Authentication module
│   │   │   ├── 📁 cart/        # Shopping cart module
│   │   │   ├── 📁 customer/    # Customer management
│   │   │   ├── 📁 delivery/    # Delivery operations
│   │   │   ├── 📁 meal/        # Meal management
│   │   │   ├── 📁 order/       # Order processing
│   │   │   ├── 📁 restaurant/  # Restaurant management
│   │   │   └── 📁 shared/      # Shared utilities
│   │   └── 📄 app.ts           # Main application file
│   ├── 📄 package.json
│   └── 📄 README.md
├── 📁 frontend/                # Angular frontend
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── 📁 admin/       # Admin panel
│   │   │   ├── 📁 auth/        # Authentication pages
│   │   │   ├── 📁 cart/        # Shopping cart
│   │   │   ├── 📁 checkout/    # Order checkout
│   │   │   ├── 📁 delivery-dashboard/
│   │   │   ├── 📁 home/        # Landing page
│   │   │   ├── 📁 orders/      # Order management
│   │   │   ├── 📁 profile/     # User profile
│   │   │   ├── 📁 restaurant-dashboard/
│   │   │   ├── 📁 restaurants/ # Restaurant listing
│   │   │   └── 📁 shared/      # Shared components
│   │   └── 📁 assets/          # Static assets
│   ├── 📄 angular.json
│   ├── 📄 package.json
│   └── 📄 README.md
├── 📄 README.md               # This file
├── 📄 CHANGELOG.md
├── 📄 CONTRIBUTING.md
└── 📄 LICENSE
```

## 🔌 API Documentation

The API provides comprehensive endpoints for all platform operations:

### Core Modules
- **Authentication**: Login, register, email verification, password reset
- **Cart Management**: Add/remove items, update quantities, calculate totals
- **Order Processing**: Create orders, track status, payment integration
- **Restaurant Management**: CRUD operations, menu management
- **User Management**: Profile updates, role management
- **Delivery Operations**: Assignment, tracking, status updates

### API Documentation
- **Swagger UI**: Available at `/api-docs` when running the server
- **Postman Collection**: Available in the `docs/` directory
- **OpenAPI Spec**: Complete API specification included

## 🧪 Testing

### Backend Testing
```bash
cd Api
npm test                # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### Frontend Testing
```bash
cd frontend
ng test                # Unit tests
ng e2e                 # End-to-end tests
ng test --code-coverage # Coverage report
```

## 🚀 Deployment

### Backend Deployment (Vercel)
```bash
cd Api
vercel --prod
```

### Frontend Deployment (Vercel)
```bash
cd frontend
ng build --configuration production
vercel --prod
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with conventional commits: `git commit -m 'feat: add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📈 Roadmap

### Upcoming Features
- [ ] Real-time order tracking with maps
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Restaurant analytics
- [ ] Loyalty program
- [ ] Multi-language support

### Current Status
- [x] ✅ User authentication and authorization
- [x] ✅ Restaurant and menu management
- [x] ✅ Shopping cart functionality
- [x] ✅ Order processing
- [x] ✅ Admin panel
- [x] ✅ Delivery dashboard
- [x] ✅ Responsive design
- [x] ✅ API documentation

## 📞 Support

- **Documentation**: Check the README files in each module
- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

## 👨‍💻 Development Team

- **Full Stack Developer**: [Amjad Kunnah](https://github.com/amjadkunnah)
- **Backend Developer**: [Mohand Omer](https://github.com/MohandOmer)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Angular team for the excellent framework
- Express.js community for the robust backend framework
- MongoDB for the flexible database solution
- All contributors and supporters of this project

---

**Made with ❤️ by the Talabat Platform Team**

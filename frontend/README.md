# Talabat Platform - Frontend

A modern, responsive food delivery platform frontend built with Angular 18. This application provides a comprehensive interface for customers, restaurants, delivery personnel, and administrators.

## 🚀 Features

### Customer Features
- **User Authentication**: Register, login, password reset with email verification
- **Restaurant Discovery**: Browse restaurants with filtering and search capabilities
- **Menu Browsing**: View detailed restaurant menus with meal categories
- **Shopping Cart**: Add/remove items with real-time quantity management
- **Order Management**: Place orders, track order status, view order history
- **Profile Management**: Update personal information and preferences

### Restaurant Dashboard
- **Menu Management**: Add, edit, and remove meals from the menu
- **Order Management**: Receive and process incoming orders
- **Restaurant Profile**: Update restaurant information and settings

### Delivery Dashboard
- **Order Assignment**: View and accept delivery assignments
- **Order Tracking**: Update delivery status and location
- **Delivery History**: Track completed deliveries

### Admin Panel
- **User Management**: Manage customers, restaurants, and delivery personnel
- **Order Oversight**: Monitor all platform orders and resolve issues
- **Restaurant Management**: Approve new restaurants and manage existing ones
- **Delivery Management**: Oversee delivery operations and personnel

## 🛠️ Technology Stack

- **Framework**: Angular 18.x
- **Language**: TypeScript 5.x
- **Styling**: SCSS with Bootstrap components
- **State Management**: RxJS Observables
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router with guards
- **Build Tool**: Angular CLI
- **Package Manager**: npm

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Angular CLI (v18 or higher)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Talabat_Platform/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Angular CLI globally** (if not already installed)
   ```bash
   npm install -g @angular/cli
   ```

## ⚙️ Configuration

1. **Environment Setup**
   
   Update environment files with your API endpoints:
   
   ```typescript
   // src/environments/environment.ts (Development)
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api/v1'
   };
   
   // src/environments/environment.prod.ts (Production)
   export const environment = {
     production: true,
     apiUrl: 'https://your-api-domain.com/api/v1'
   };
   ```

## 🚀 Running the Application

### Development Server
```bash
ng serve
```
Navigate to `http://localhost:4200/` for the development server.

### Production Build
```bash
ng build --configuration production
```
Build artifacts will be stored in the `dist/` directory.

### Development Build
```bash
ng build
```

## 🧪 Testing

### Unit Tests
```bash
ng test
```
Executes unit tests via Karma.

### End-to-End Tests
```bash
ng e2e
```
Run end-to-end tests with your preferred testing framework.

### Code Coverage
```bash
ng test --code-coverage
```
Generates a coverage report in the `coverage/` directory.

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/                 # Admin panel modules
│   │   ├── admin-dashboard/
│   │   ├── orders-management/
│   │   ├── restaurants-management/
│   │   └── users-management/
│   ├── auth/                  # Authentication modules
│   │   ├── login/
│   │   ├── register/
│   │   └── verify-email/
│   ├── cart/                  # Shopping cart functionality
│   ├── checkout/              # Order checkout process
│   ├── delivery-dashboard/    # Delivery personnel interface
│   ├── home/                  # Landing page
│   ├── orders/                # Order management
│   ├── profile/               # User profile management
│   ├── restaurant-dashboard/  # Restaurant owner interface
│   ├── restaurants/           # Restaurant listing and details
│   └── shared/                # Shared components and services
│       ├── components/
│       ├── guards/
│       ├── interfaces/
│       └── services/
├── assets/                    # Static assets
├── environments/              # Environment configurations
└── styles/                    # Global styles
```

## 🔐 Authentication & Authorization

The application implements JWT-based authentication with role-based access control:

- **Customer Role**: Access to shopping, ordering, and profile management
- **Restaurant Role**: Access to restaurant dashboard and order management
- **Delivery Role**: Access to delivery dashboard and order tracking
- **Admin Role**: Full platform administration access

### Route Guards
- `AuthGuard`: Protects authenticated routes
- `RoleGuard`: Enforces role-based access control
- `GuestGuard`: Redirects authenticated users from auth pages

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔄 State Management

The application uses a service-based architecture with RxJS Observables for state management:

- **AuthService**: User authentication and authorization
- **CartService**: Shopping cart state management
- **OrderService**: Order operations and tracking
- **RestaurantService**: Restaurant data management
- **UserService**: User profile operations

## 🌐 API Integration

All services communicate with the backend API using Angular's HttpClient:

- **Base URL**: Configured in environment files
- **Authentication**: JWT tokens in Authorization headers
- **Error Handling**: Global error interceptor
- **Loading States**: Consistent loading indicators

## 📦 Key Dependencies

```json
{
  "@angular/core": "^18.0.0",
  "@angular/router": "^18.0.0",
  "@angular/common": "^18.0.0",
  "@angular/forms": "^18.0.0",
  "rxjs": "^7.8.0",
  "bootstrap": "^5.3.0",
  "typescript": "^5.4.0"
}
```

## 🚀 Deployment

### Production Build
```bash
ng build --configuration production
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

The application includes Vercel configuration in `vercel.json`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 Code Style

- Follow Angular style guide
- Use TypeScript strict mode
- Implement proper error handling
- Write unit tests for components and services
- Use meaningful component and variable names

## 🐛 Troubleshooting

### Common Issues

1. **Port 4200 already in use**
   ```bash
   ng serve --port 4201
   ```

2. **Module not found errors**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build errors**
   ```bash
   ng build --verbose
   ```

## 📧 Support

For support and questions, please contact the development team or create an issue in the repository.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

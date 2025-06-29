# TCTRL Fashion E-Commerce 

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [API Documentation](#-api-documentation)
- [Payment Integration](#-payment-integration)
- [Security Measures](#-security-measures)
- [Deployment Guide](#-deployment-guide)
- [Troubleshooting](#-troubleshooting)
- [Contact](#-contact)

---

## 🚀 Overview

TCTRL Fashion E-Commerce API is a robust, secure, and scalable backend service powering the TCTRL fashion platform. Built with modern Node.js practices, this API provides comprehensive endpoints for user management, product catalog operations, cart functionality, order processing, secure payment integrations with Stripe and PayPal, and more.

The system features JWT authentication, Cloudinary integration for image management, and seamless payment processing capabilities, making it a complete solution for fashion e-commerce applications.

---

## ✨ Features

### User Management
- JWT-based authentication & authorization
- User registration with email verification
- Profile management with secure password handling
- Role-based access control (Customer, Admin)

### Product Management
- Comprehensive product CRUD operations
- Advanced filtering, sorting, and pagination
- Category and collection management
- Product image upload and optimization via Cloudinary

### Shopping Experience
- Cart creation, modification, and synchronization
- Wishlist management
- Order processing and history
- Inventory management

### Payment Processing
- Stripe integration with checkout sessions
- PayPal payment processing
- Cash on Delivery (COD) option
- Automated payment status webhooks
- Order confirmation emails

### Admin Tools
- Dashboard analytics endpoints
- Payment reconciliation utilities
- Webhook monitoring
- User management

---

## 📦 Tech Stack

### Core
- **Node.js** (v16+) - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database service
- **Mongoose** - MongoDB object modeling

### Authentication & Security
- **JSON Web Tokens** (JWT) - Secure authentication
- **bcrypt** - Password hashing
- **Helmet** - HTTP security headers
- **CORS** - Cross-Origin Resource Sharing
- **Morgan** - HTTP request logging

### File Storage
- **Cloudinary** - Cloud-based image management
- **Multer** - File upload handling

### Payment Processing
- **Stripe API** - Credit card processing
- **PayPal API** - Alternative payment method

### Email Services
- **SendGrid** - Email delivery service
- **Nodemailer** - Email composition and sending

### Utilities
- **dotenv** - Environment variable management

---

## 🏗️ Architecture

### Directory Structure

```
tctrl-backend/
├── config/                 # Configuration files
│   ├── cloudinaryImg.js    # Cloudinary setup
│   └── mongodb.js          # MongoDB connection
│
├── controllers/            # Business logic
│   ├── cartController.js   # Cart management
│   ├── ordersController.js # Order processing
│   ├── productsController.js # Product management
│   ├── usersController.js  # User authentication & profile
│   └── wishlistController.js # Wishlist management
│
├── middleware/             # Express middleware
│   ├── adminverify.js      # Admin authorization
│   ├── multers.js          # File upload handling
│   └── userVerify.js       # JWT authentication
│
├── models/                 # Mongoose schemas
│   ├── ordersModel.js      # Order data model
│   ├── productsMo.js       # Product data model
│   └── userModels.js       # User data model
│
├── routes/                 # API route definitions
│   ├── cartRoutes.js       # Cart endpoint routes
│   ├── ordersRoute.js      # Order endpoint routes
│   ├── productsRoute.js    # Product endpoint routes
│   ├── usersRoute.js       # User endpoint routes
│   └── wishlistRoute.js    # Wishlist endpoint routes
│
├── utils/                  # Helper functions
│   ├── Logo.png            # Application logo
│   └── sendEmail.js        # Email sending utility
│
├── .env                    # Environment variables (not committed)
├── .gitignore              # Git ignore file
├── package-lock.json       # Dependency lock file
├── package.json            # Project dependencies
├── README.md               # Project documentation
├── Server.js               # Application entry point
└── varcel.json             # Vercel deployment configuration
```

### Data Flow

1. Client request → Routes
2. Routes → Middleware (Authentication)
3. Middleware → Controllers
4. Controllers → Models (Database operations)
5. Models → Controllers
6. Controllers → Response to client

**API Authentication Flow:**
1. User registers/logs in
2. Server validates credentials
3. JWT token generated with user info
4. Token returned to client
5. Client includes token in Authorization header
6. userVerify.js middleware validates token
7. For admin routes, adminverify.js provides additional authorization

---

## 🔧 Installation

### Prerequisites

- Node.js (v16 or later)
- MongoDB Atlas account
- Cloudinary account
- Stripe & PayPal developer accounts

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/festuskumi/tctrl-backend.git
   cd tctrl-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the root directory (see Environment Configuration section)

4. **Start the development server**
   ```bash
   npm run server
   ```

The server will run on `http://localhost:4000` by default or the port specified in your environment variables.

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URL=your_mongodb_connection_string

# Cloudinary Configuration
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

# JWT Authentication
JWT_CODE=your_jwt_secret_code

# Admin Email Credentials
ADMIN_MAIL=your_admin_email
ADMIN_PASSWORD=your_admin_email_app_password
OUTLOOK_PASSWORD=your_outlook_password

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key

# Frontend URL
CLIENT_URL=http://localhost:5173

# Stripe
STRIPE_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Environment
NODE_ENV=development  # Set to 'production' for production deployment

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

**Important Security Notes:**
- Never commit your `.env` file to version control
- Use strong, unique secrets
- Rotate API keys regularly
- Store credentials in a secure environment variables manager for production

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/users/register` | Register a new user | No |
| POST | `/api/users/login` | User login | No |
| GET | `/api/users/verify/:token` | Verify email address | No |
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update user profile | Yes |

### Product Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/products` | Get all products | No |
| GET | `/api/products/:id` | Get single product | No |
| POST | `/api/products` | Create product | Yes (Admin) |
| PUT | `/api/products/:id` | Update product | Yes (Admin) |
| DELETE | `/api/products/:id` | Delete product | Yes (Admin) |
| GET | `/api/products/category/:category` | Get products by category | No |
| GET | `/api/products/search/:query` | Search products | No |

### Cart Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/cart` | Get user cart | Yes |
| POST | `/api/cart` | Add item to cart | Yes |
| PUT | `/api/cart/:itemId` | Update cart item | Yes |
| DELETE | `/api/cart/:itemId` | Remove from cart | Yes |
| POST | `/api/cart/sync` | Sync guest cart | Yes |
| DELETE | `/api/cart` | Clear cart | Yes |

### Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/order` | Create order | Yes |
| GET | `/api/order` | Get all user orders | Yes |
| GET | `/api/order/:id` | Get order details | Yes |
| POST | `/api/order/stripe-checkout` | Create Stripe checkout | Yes |
| POST | `/api/order/paypal-checkout` | Create PayPal order | Yes |
| POST | `/api/order/stripe-webhook` | Stripe webhook | No (Secret) |
| POST | `/api/order/paypal/webhook` | PayPal webhook | No (Secret) |

### Wishlist Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/wishlist` | Get user wishlist | Yes |
| POST | `/api/wishlist/:productId` | Add to wishlist | Yes |
| DELETE | `/api/wishlist/:productId` | Remove from wishlist | Yes |
| POST | `/api/wishlist/sync` | Sync guest wishlist | Yes |

### Admin Utilities

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/fix-stripe-payments` | Fix Stripe payments | Yes (Admin) |
| GET | `/api/fix-paypal-payments` | Fix PayPal payments | Yes (Admin) |
| GET | `/api/webhook-status` | Check webhook status | Yes (Admin) |

---

## 💳 Payment Integration

### Stripe Integration

The API integrates with Stripe for secure credit card processing:

1. **Checkout Flow**:
   - Create order in database
   - Generate Stripe checkout session
   - Return checkout URL to frontend
   - User completes payment on Stripe-hosted page
   - Webhook receives payment confirmation
   - Order status updated to paid

2. **Webhook Setup**:
   - Configure in Stripe dashboard: `https://your-domain.com/api/order/stripe-webhook`
   - For local testing, use Stripe CLI:
     ```bash
     stripe listen --forward-to localhost:4000/api/order/stripe-webhook
     ```

3. **Testing**:
   - Use Stripe test cards (e.g., `4242 4242 4242 4242`)
   - Test webhook events via Stripe dashboard

### PayPal Integration

For PayPal payments:

1. **Checkout Flow**:
   - Create order in database
   - Generate PayPal order via SDK
   - Return order ID to frontend
   - User completes payment on frontend
   - Webhook receives payment confirmation
   - Order status updated to paid

2. **Webhook Setup**:
   - Configure in PayPal developer dashboard
   - Point to: `https://your-domain.com/api/order/paypal/webhook`

3. **Testing**:
   - Use PayPal sandbox accounts
   - Test webhook events via PayPal dashboard

---

## 🔐 Security Measures

The API implements several security measures:

### Authentication & Authorization
- JWT-based authentication with proper expiration
- Secure HTTP-only cookies for tokens
- Role-based access control for admin routes
- Password hashing with bcrypt

### API Security
- Rate limiting to prevent brute force attacks
- CORS with dynamic origin whitelist
- Helmet.js for secure HTTP headers
- Input validation for all routes
- SQL injection protection via Mongoose

### Payment Security
- PCI compliance through Stripe/PayPal
- No storage of sensitive card data
- HTTPS enforced in production
- Webhook signatures validated

### Data Protection
- MongoDB authentication enabled
- Network security groups configured
- Regular security audits
- Data encryption in transit and at rest

---

## 📦 Deployment Guide

### Production Checklist

Before deploying to production, ensure:

1. **Environment Variables**:
   - All production env vars set securely
   - Strong, unique secrets used
   - Set `NODE_ENV=production`

2. **Database**:
   - MongoDB Atlas connection string updated for production
   - Database indexes created
   - Initial admin user set up

3. **Security**:
   - HTTPS enforced
   - Secure headers configured
   - CORS settings updated for production frontend

4. **Payment Processing**:
   - Stripe and PayPal in production mode
   - Webhooks configured for production URLs
   - Payment flows tested end-to-end

### Deployment Options

#### Vercel Deployment

The project includes a `vercel.json` configuration file for easy deployment to Vercel:

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

#### Traditional Hosting

1. **Server Setup**:
   - Node.js v16+ installed
   - PM2 for process management
   - Nginx/Apache as reverse proxy

2. **Deployment Steps**:
   ```bash
   git clone https://github.com/festuskumi/tctrl-backend.git
   cd tctrl-backend
   npm install
   # Set up environment variables
   pm2 start server.js --name tctrl-api
   ```

3. **PM2 Configuration**:
   ```bash
   pm2 ecosystem create
   # Edit ecosystem.config.js with your settings
   pm2 start ecosystem.config.js
   ```

#### Docker Deployment

1. **Build Docker Image**:
   ```bash
   docker build -t tctrl-api .
   ```

2. **Run Container**:
   ```bash
   docker run -p 4000:4000 --env-file .env tctrl-api
   ```

---

## 🚀 Performance Optimization

### Database Optimization
- Implement proper MongoDB indexes
- Use lean queries where possible
- Implement query caching for frequently accessed data
- Use projection to return only needed fields

### API Response Optimization
- Implement compression middleware
- Cache frequently requested data
- Paginate large result sets
- Use ETags for caching

### Code Optimization
- Minimize synchronous operations
- Implement efficient error handling
- Use async/await for asynchronous operations
- Optimize file uploads and processing

---

## 🔧 Troubleshooting

### Common Issues

#### Payment Webhook Failures
- Check webhook URL configuration
- Verify webhook secrets
- Ensure proper event handling
- Use logging to debug webhook payloads

#### MongoDB Connection Issues
- Verify connection string
- Check network access and IP whitelist
- Ensure proper authentication
- Verify MongoDB version compatibility

#### Authentication Problems
- Check JWT secret and expiry settings
- Verify token validation logic
- Check for CORS issues with cookies
- Ensure proper error handling

### Logging and Monitoring

The API uses Winston for logging:

- **Development**: Console output
- **Production**: File logs + optional services integration

Monitor application health with:
- Morgan for HTTP request logging
- Custom API for webhook status
- Integration with monitoring services (optional)

---

## 📞 Contact

**Project Lead**: Festus Kumi  
**Email**: festuskumi8@gmail.com  
**GitHub**: [@festuskumi](https://github.com/festuskumi)

For bug reports, feature requests, or general inquiries, please create an issue in the GitHub repository.

---

<div align="center">
  <sub>Built with ❤️ by Festus Kumi</sub>
</div>
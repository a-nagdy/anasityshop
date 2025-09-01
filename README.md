# 🛍️ Anasity Shop - Modern E-Commerce Platform

A full-stack e-commerce platform built with Next.js 15, featuring a customer-facing store and comprehensive admin dashboard with advanced inventory management, order processing, and content management capabilities.

## ✨ Features

### 🛒 Customer Features

- **Modern Shopping Experience**: Responsive design with 3D animations and particle effects
- **Dynamic Homepage**: Configurable hero banners, category sliders, and product showcases
- **Product Catalog**: Advanced filtering, search, and categorization
- **Shopping Cart**: Real-time cart management with quantity updates
- **User Authentication**: Secure registration and login system
- **Order Management**: Complete order tracking and history
- **Address Management**: Multiple shipping/billing addresses support

### 🎛️ Admin Features

- **Comprehensive Dashboard**: Analytics, charts, and key performance indicators
- **Product Management**: CRUD operations with multi-image upload and variants
- **Category Management**: Hierarchical category structure with automatic relationship handling
- **Order Management**: Complete order lifecycle management with status updates
- **User Management**: Customer and admin user administration
- **Inventory Control**: Automated stock status updates with low-stock alerts
- **Content Management**: Homepage customization with drag-and-drop sliders
- **Settings Management**: Site-wide configuration and theme customization

### 🔧 Technical Features

- **Role-Based Access Control**: Customer, Admin, and Super-Admin roles
- **JWT Authentication**: Secure token-based authentication with middleware protection
- **File Upload System**: Cloudinary integration for optimized image management
- **Automated Tasks**: Cron jobs for inventory updates and maintenance
- **Real-time Updates**: Live status updates for products and orders
- **Advanced Search**: Full-text search with indexing
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🚀 Tech Stack

### Frontend

- **Framework**: Next.js 15.3.2 with App Router
- **Language**: TypeScript 5.8.3
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: Redux Toolkit with TypeScript
- **Animations**: Framer Motion
- **3D Graphics**: React Three Fiber & Three.js
- **Icons**: Heroicons, React Icons
- **Notifications**: React Toastify
- **Charts**: Chart.js

### Backend

- **Runtime**: Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **File Storage**: Cloudinary
- **Scheduled Tasks**: node-cron
- **API**: Next.js API Routes

### Development Tools

- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **Code Formatting**: Built-in Next.js formatting
- **Build Tool**: Next.js with Turbo

## 📋 Prerequisites

- Node.js 18.x or higher
- MongoDB database
- Cloudinary account for image management
- Git for version control

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd anasityshop
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/anasityshop
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/anasityshop

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Application Environment
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

Make sure your MongoDB instance is running. The application will automatically connect and create the necessary collections on first run.

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
anasityshop/
├── app/                          # Next.js app directory
│   ├── (shop)/                   # Customer-facing routes
│   │   ├── layout.tsx           # Shop layout wrapper
│   │   └── page.tsx             # Homepage
│   ├── admin/                    # Admin dashboard
│   │   ├── components/          # Admin-specific components
│   │   ├── dashboard/           # Dashboard pages
│   │   ├── products/            # Product management
│   │   ├── categories/          # Category management
│   │   ├── orders/              # Order management
│   │   ├── customers/           # Customer management
│   │   └── settings/            # Site settings
│   ├── api/                      # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── products/            # Product CRUD operations
│   │   ├── categories/          # Category management
│   │   ├── orders/              # Order processing
│   │   ├── upload/              # File upload handling
│   │   └── models/              # Database models
│   ├── components/               # Reusable components
│   │   ├── home/                # Homepage components
│   │   ├── layout/              # Layout components
│   │   └── ui/                  # UI components
│   ├── store/                    # Redux store configuration
│   │   └── slices/              # Redux slices
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
├── middleware/                   # Custom middleware
├── utils/                        # Server-side utilities
├── next.config.ts               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── package.json                 # Project dependencies
```

## 🔐 Authentication & Authorization

### User Roles

- **Customer**: Can browse products, manage cart, place orders
- **Admin**: Full access to dashboard, can manage products, orders, users
- **Super-Admin**: All admin privileges plus system settings management

### Admin Access

1. Navigate to `/admin`
2. Login with admin credentials
3. Access the comprehensive dashboard

### API Authentication

All admin API routes are protected with JWT middleware. Include the token in requests:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## 📡 API Documentation

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Product Endpoints

- `GET /api/products` - Get all products (with filtering)
- `POST /api/products` - Create product (Admin only)
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product (Admin only)
- `DELETE /api/products/[id]` - Delete product (Admin only)

### Category Endpoints

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin only)
- `GET /api/categories/[id]` - Get single category
- `PUT /api/categories/[id]` - Update category (Admin only)
- `DELETE /api/categories/[id]` - Delete category (Admin only)

### Order Endpoints

- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get single order
- `PUT /api/orders/[id]` - Update order status (Admin only)

### File Upload

- `POST /api/upload` - Upload images to Cloudinary

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Models

The application uses the following main models:

- **User**: Authentication and user management
- **Product**: Product catalog with variants and inventory
- **Category**: Hierarchical category structure
- **Order**: Order processing and tracking
- **Cart**: Shopping cart management
- **Address**: User address management
- **Settings**: Site configuration

### Cron Jobs

Automated tasks run in production:

- **Product Status Updates**: Daily inventory status checks
- **Order Status Updates**: Automated order processing

## 🎨 Customization

### Homepage Configuration

Admins can customize the homepage through the settings panel:

- Hero banners with images and call-to-action buttons
- Category sliders showcasing product categories
- Product sliders for featured, bestseller, and new items
- Color themes and 3D animation settings

### Styling

The project uses Tailwind CSS for styling. Customize the design by:

1. Modifying `tailwind.config.js`
2. Updating component styles in respective files
3. Adjusting global styles in `app/globals.css`

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Manual Deployment

```bash
npm run build
npm run start
```

### Environment Variables for Production

Ensure all environment variables are set in your production environment:

- MongoDB connection string
- JWT secret key
- Cloudinary credentials
- Set `NODE_ENV=production`

## 🔍 Performance Optimization

- **Image Optimization**: Next.js Image component with Cloudinary
- **Code Splitting**: Automatic with Next.js App Router
- **Caching**: Static generation where applicable
- **Database Indexing**: Implemented for search performance
- **Lazy Loading**: Components and images load on demand

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🎯 Roadmap

- [ ] Payment gateway integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced SEO optimization
- [ ] Automated testing suite
- [ ] Email notification system
- [ ] Advanced inventory management

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**


## Refactoring Documentation Summary

This section consolidates key insights from previous refactoring plans, status, and patterns to maintain a clean project structure.

### Key Refactoring Phases
- **Core Infrastructure**: Implemented logging, error handling, type enhancements, and base service architecture.
- **Service Layer**: Created services for products, categories, orders, users, and auth with consistent patterns.
- **API Standardization**: Ensured consistent response formats and middleware.
- **Component Refactoring**: Updated admin and shop components to use service layer, improving type safety and UX.

### Performance Improvements
- Reduced API response times and page loads through indexing, caching, and optimizations.

### API Patterns
- Standardized success responses with data and messages.
- Consistent error handling across endpoints.

## Performance Optimizations

- **Database**: Added indexing, aggregation pipelines, connection pooling, and query profiling.
- **Caching**: Implemented in-memory caching with invalidation and TTL.
- **API**: Standardized responses, pagination, and field selection.
- **Security**: Input validation, rate limiting, enhanced password rules.
- **Improvements**: Reduced response times by 80-86% across key operations.

## SKU Implementation

- **Generation**: Auto-generates unique SKUs (e.g., PWH-234567-891) based on product name, timestamp, and random digits.
- **Fields**: Added specifications like weight, dimensions, material, warranty.
- **API**: Simplified to single endpoint using ID, removed redundant slug route.
- **Benefits**: User-friendly SKUs, enhanced product details, improved performance.

## Service Configuration

- **Smart URLs**: Environment-aware base URLs for client/server.
- **Custom Settings**: Service-specific timeouts and retries (e.g., auth: 10s, orders: 30s).
- **Benefits**: Flexible, optimized for different environments and operations.

For detailed history, refer to version control commits.

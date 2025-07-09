<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">

## 📦 About

Subply API is a backend service powering the Subply Android application — a digital platform for game top-ups and voucher purchases.
Built with NestJS, Drizzle ORM, and PostgreSQL, and integrated with Midtrans for payment processing.

This project is designed with clean architecture and follows a controller → service → repository pattern.

## 🔧 Tech Stack

- **Framework**: NestJS  
- **ORM**: Drizzle ORM  
- **Database**: PostgreSQL (via NeonDB)  
- **Containerization**: Docker  
- **Payment Gateway**: Midtrans  
- **Deployment**: Google Cloud Run  
- **Media Storage**: Cloudinary  
- **CI/CD**: GitHub Actions  
- **Container Registry**: GHCR & GAR (Google Artifact Registry)


## 🔐 Features

- Role-based Authentication (User, Admin, Superadmin)
- Midtrans Payment Integration
- Audit Logging System
- Basic Admin Dashboard (statistics)
- Rate Limiting
- DTO-based validation and data shaping
- E-commerce flow (without cart system)

## 📁 Project Structure (src/)
```
src/
├── auth/                     # Auth logic (JWT, Guards)
├── users/                    # User roles and profiles
├── games/                    # Game catalog
├── products/                 # Vouchers & Top-up items
├── orders/                   # Purchase handling
├── payments/                 # Midtrans gateway
├── payments-orders-shared/   # Shared logic
├── audit-log/                # Admin logs
├── statistics/               # Admin dashboard
├── common/                   # Constants, Decorator, Guard
├── database/                 # Drizzle and NeonDB config
├── upload/                   # File handling
└── main.ts                   # Application bootstrap
```

## ⚠️ Environment Variables Required
This API will not run without a valid .env file.
Please create a .env file in the project root with the following variables:

```
# Database (Neon PostgreSQL)
DATABASE_URL="your_neon_postgresql_url"

# Payment (Midtrans)
MIDTRANS_SERVER_KEY="your_midtrans_server_key"

# JWT Secret
JWT_SECRET="your_jwt_secret"

# Cloudinary
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
```

## 🐳 Run with Docker
Option 1: Using Docker Compose
```
$ docker compose up
```
Ensure your .env file is properly configured before running.

Option 2: Pull from GitHub Container Registry
```
$ docker pull ghcr.io/vhysxl/subply-api:latest
```
Replace any necessary port or environment settings based on your environment.


## 🚀 Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Docs

Swagger UI: https://subply-deploy-591941627936.asia-southeast2.run.app/api  

## TODO

- Expand test coverage to all core services (currently partial)
- Implement Middleware
- Swagger docs 

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

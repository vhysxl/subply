<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## 📦 About

Subply API is a backend service powering the Subply Android application — a digital platform for game top-ups and voucher purchases.
Built with NestJS, Drizzle ORM, and PostgreSQL, and integrated with Midtrans for payment processing.

This project is designed with clean architecture and follows a controller → service → repository pattern.

## 🔧 Tech Stack

- Framework: NestJS
- ORM: Drizzle ORM
- Database: PostgreSQL (NeonDB)
- Container: Docker (coming soon)
- Payment Gateway: Midtrans
- Hosting: GCP (planned)

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

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

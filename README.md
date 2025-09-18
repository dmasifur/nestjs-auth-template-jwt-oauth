# NestJS Authentication Boilerplate

A starter project for building secure and scalable authentication systems with **NestJS**. This boilerplate includes:

- **Passport.js** for authentication strategies like JWT and Google OAuth.
- **JWT (JSON Web Token)** for stateless authentication.
- **Google OAuth** integration for third-party login.
- **Redis** for rotating refresh tokens to ensure secure authentication sessions.

## Features

- User authentication with **Passport.js** and **JWT**.
- **Google OAuth** integration for logging in with Google accounts.
- Secure **refresh token rotation** with Redis to mitigate security risks.
- Easy to integrate into any NestJS application.
- Fully customizable to suit your needs.

## Installation

### Prerequisites

- **Node.js** (version >= 16.0.0)
- **NestJS** (latest version)
- **Redis** server running locally or using a cloud service.

### Clone the repository

```bash
git clone https://github.com/yourusername/nestjs-auth-boilerplate.git
```
```bash
cd nestjs-auth-boilerplate
```
```bash
npm install
```

### Set up environment variables

Create a .env file at the root of the project and configure the following environment variables:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/nest-auth?schema=public"
JWT_SECRET=


GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=



JWT_ACCESS_TOKEN_EXPIRATION_TIME=(ms)
JWT_REFRESH_TOKEN_EXPIRATION_TIME=(ms)

FRONTEND_SUCCESS_REDIRECT_URL=http://localhost:3000/dashboard

# Redis

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

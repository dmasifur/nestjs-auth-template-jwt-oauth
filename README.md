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

### Seed database

```ts



import { PrismaClient } from '../generated/prisma';
import lodash from 'lodash'
export const roles = [
    {
        id:1,
        name:'Admin'
    },
    {
        id:2,
        name:'Moderator'
    },
    {
        id:3,
        name:'User'
    },
]

export const permissions = [
    {
        id:1,
        role_id:1,
        action:'manage',
        subject:'all'
    },
    {
        id:2,
        role_id:2,
        action:'manage',
        subject:'product'
    },
    {
        id:3,
        role_id:3,
        action:'read',
        subject:'product'
    },
    {
        id:4,
        role_id:3,
        action:'manage',
        subject:'order',
        conditions:{created_by: `{{id}}`}
    },
]

export const users = [
    {
        id:1,
        first_name:'Asifur',
        last_name:'Rahman',
        email:'asifur@email.com',
        role_id: 1,
        password:'pass',

    },
    {
        id:2,
        first_name:'John',
        last_name:'Doe',
        email:'doe@email.com',
        role_id: 3,
        password:'pass',

    },
    {
        id:3,
        first_name:'El',
        last_name:'Bob',
        email:'bob@email.com',
        role_id: 2,
        password:'pass',

    },
]


const prisma = new PrismaClient();


async function main(){

   for await(const role of roles){
    const roleAttrs = lodash.cloneDeep(role);
    //@ts-ignore
    delete roleAttrs.id

    await prisma.role.upsert({
        where:{id:role.id},
        create:roleAttrs,
        update:roleAttrs
    })
   }

   for await(const perm of permissions){
    const permAttrs = lodash.cloneDeep(perm);
       //@ts-ignore
    delete permAttrs.id

    await prisma.permission.upsert({
        where:{id:perm.id},
        create:permAttrs,
        update:permAttrs
    })
   }

   for await (const user of users){
    const userAttrs = lodash.cloneDeep(user);
           //@ts-ignore
    delete userAttrs.id

    await prisma.user.upsert({
        where:{id:user.id},
        create:userAttrs,
        update:userAttrs
    })
   }
}

main()
    .then(async()=>{
        console.log('DB has been seeded.')
        await prisma.$disconnect()
    })
    .catch(async(e)=>{
        console.log(`Something went wrong: `,e)
        await prisma.$disconnect()
    })

```


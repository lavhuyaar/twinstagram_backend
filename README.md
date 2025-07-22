# Twinstagram — Backend

This is the backend for **Twinstagram**, a full-stack social media app inspired by Instagram. It handles authentication, user data, posts, follow systems, and more.

---

## Tech Stack

- **Express** + **TypeScript**
- **Prisma** ORM
- **PostgreSQL** (NeonDB)
- **Bcryptjs**
- **JWT** (HTTP-only cookies)
- **Multer** (image upload)
- **Express Validator**
- **Jest** + **Supertest** for testing
- **Docker** (basic setup)
- **Supabase** bucket
- Deployed on **Render**

---

## Features

- Register, login, and guest login
- HTTP-only cookie-based authentication using JWT
- Create/edit/delete posts (images optional)
- View posts of followed users (feed)
- Follow/unfollow with support for private/public profiles
- Accept/reject follow requests
- View followers/following (with access rules)
- Search users by username, first or last name
- Edit profile (image + privacy toggle)
- Protected routes
- Fully tested backend

---

##  Project Structure

├──prisma/                  # Prisma models and migrations
├──src/
    ├── controllers/        # Request handlers
    ├── db/                    # Prisma client and custom queries
    ├── middlewares/    # Auth, error handling, validation
    ├── routes/              # Route definitions
    ├── tests/                # Unit tests
    ├── types/               # Custom TypeScript types
    ├── validators/        # Validation schemas
    ├── utils/                 # Utility functions
    ├── app.ts               # App entry point
    └── server.ts

---

## Running Locally

### 1. Clone the repo

```bash
    git clone https://github.com/yourusername/twinstagram-backend.git
    cd twinstagram-backend
```

### 2. Install dependencies

```bash
    npm install
```

### 3. Configure environmental variables

Create an `.env` file in the root folder and add the variables mentioned below

```bash
NODE_ENV=development
PORT=4040
DATABASE_URL=your_database_url
JWT_SECRET_KEY=your_secret_key
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_PROJECT_URL=your_supabase_project_url
```

### 4. Set up the database

```bash
    npx prisma generate
    npx prisma migrate dev --name init
```

### 5. Start the development server

```bash
npm run dev
```

Server will run at `http://localhost:4040`

---

## Running Tests

```bash
    npm test
```

Uses **Jest** and **Supertest**

---

## Personal words

I loved this project, tried to achieve all I wanted to achieve (for ex- HTTP-only cookie)

I tried to enjoy writing tests but couldn't lol. Ik they are super important but very boring as well. Implementing pagination and filteration on search was fun tho.

Did a good work Lav. Proud of you. Keep up the good work

22-07-2025

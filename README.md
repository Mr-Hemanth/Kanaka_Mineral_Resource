# Kanaka Minerals Management Application

A production-grade web application to manage the operations of a Quartz Mining Business.

## Architecture

*   **Frontend**: React.js (Create React App), Vanilla JS, Tailwind CSS, Material UI (MUI), Recharts, React Router v6.
*   **Backend**: Node.js, Express.js, Prisma ORM, PostgreSQL.
*   **Authentication**: JSON Web Tokens (JWT) with Role-Based Access Control (Admin, Supervisor, Owner).

## Project Structure

*   `/backend` - Express API server, Prisma schema, and Database Migrations.
*   `/frontend` - React SPA for the user interface.

## Local Setup

### 1. Backend Setup
1.  Navigate to the backend directory: `cd backend`
2.  Install dependencies: `npm install`
3.  Set up your `.env` file with `DATABASE_URL`, `JWT_SECRET`, and `PORT`.
4.  Generate Prisma Client and push the schema:
    ```bash
    npx prisma generate
    npx prisma db push
    ```
5.  Seed the database with default users (Admin, Supervisor, Owner):
    ```bash
    npm run prisma:seed
    ```
6.  Start the development server:
    ```bash
    npm start # Or node index.js
    ```

### 2. Frontend Setup
1.  Navigate to the frontend directory: `cd frontend`
2.  Install dependencies: `npm install`
3.  Set up your `.env` file:
    ```env
    REACT_APP_API_URL=http://localhost:5000/api
    ```
4.  Start the development server:
    ```bash
    npm start
    ```

## Default Credentials (Local)
*   Admin: `admin@kanaka.com` / `admin123`
*   Supervisor: `supervisor@kanaka.com` / `super123`
*   Owner: `owner@kanaka.com` / `owner123`

## Deployment

*   **Frontend**: Designed to be deployed on **Vercel**. Simply push the repository to GitHub, link it to Vercel, and the provided `vercel.json` will handle the React Router SPA configuration.
*   **Backend**: Designed to be deployed on Render, Heroku, or equivalent Node.js hosting. Connect your PostgreSQL database and set up the environment variables.

## Modules Implemented

*   Authentication & RBAC
*   Dashboard Analytics
*   Vehicle & Diesel Management
*   Truck Dispatch Tracking
*   Expense Management
*   Maintenance & Labour Logs
*   Document Management (Uploads)

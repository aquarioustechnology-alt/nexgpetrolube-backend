# Admin Login Setup Guide

This guide explains how to set up the admin login functionality for the NexGPetrolube admin portal.

## Prerequisites

1. Backend server running on port 3001
2. Database connection configured
3. Prisma migrations applied

## Setup Steps

### 1. Run Database Migration

First, apply the Prisma migration to add the password field to the AdminUser model:

```bash
cd Backend
npx prisma migrate dev --name add-admin-password
```

### 2. Create Admin User

Run the script to create the admin user in the database:

```bash
cd Backend
npm run create-admin
```

This will create an admin user with the following credentials:
- **Email**: admin@nexgpetrolube.com
- **Password**: Admin@123
- **Role**: SUPER_ADMIN

### 3. Start the Backend Server

```bash
cd Backend
npm run start:dev
```

### 4. Start the Admin Frontend

```bash
cd Admin
npm run dev
```

## How It Works

### Backend Authentication

1. **Admin Login Endpoint**: `POST /auth/admin/login`
   - Validates credentials against the `admin_users` table
   - Returns JWT token and admin user data
   - Updates `lastLoginAt` timestamp

2. **Password Hashing**: Uses bcrypt to hash passwords securely
3. **JWT Tokens**: Returns signed JWT tokens for authentication

### Frontend Authentication

1. **Login Form**: Sends credentials to backend API
2. **Token Storage**: Stores JWT token and user data in localStorage
3. **Route Protection**: Admin layout checks authentication status
4. **Auto Redirect**: Redirects to login if not authenticated

### Database Schema

The `admin_users` table includes:
- `id`: Unique identifier
- `email`: Admin email (unique)
- `firstName`: Admin first name
- `lastName`: Admin last name
- `password`: Hashed password
- `role`: Admin role (SUPER_ADMIN, COMPLIANCE, etc.)
- `isActive`: Account status
- `lastLoginAt`: Last login timestamp
- `createdAt`: Account creation time
- `updatedAt`: Last update time

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt
2. **JWT Tokens**: Secure token-based authentication
3. **Route Protection**: Admin routes are protected
4. **Session Management**: Tracks last login time

## Testing the Login

1. Navigate to `http://localhost:3000/login`
2. Use the credentials:
   - Email: admin@nexgpetrolube.com
   - Password: Admin@123
3. You should be redirected to the admin dashboard

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Ensure the database is running and connection string is correct
2. **Migration Error**: Run `npx prisma migrate dev` to apply pending migrations
3. **Admin User Already Exists**: The script will skip creation if user already exists
4. **CORS Error**: Ensure backend CORS is configured to allow frontend requests

### Environment Variables

Make sure these environment variables are set in the backend:

```env
DATABASE_URL="your_database_connection_string"
JWT_SECRET="your_jwt_secret_key"
```

## API Endpoints

- `POST /auth/admin/login` - Admin login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Admin logout

## Next Steps

1. Implement role-based access control
2. Add admin user management interface
3. Implement password reset functionality
4. Add audit logging for admin actions

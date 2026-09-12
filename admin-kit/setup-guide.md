# Admin Kit Setup Guide

## Environment Variables

⚠️ **IMPORTANT SECURITY NOTE**: Never commit `.env.local` to version control!

Add these environment variables to your `.env.local` file:

### Required for JWT Authentication
```bash
# JWT Secret - Generate a secure random string
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_secure_jwt_secret_here

# Database URL - Replace with your actual Neon PostgreSQL credentials
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

### Optional for Stack Auth Integration
```bash
# Stack Auth credentials - Get from your Stack Auth dashboard
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
STACK_SECRET_SERVER_KEY=your_stack_secret_key
```

### Additional Database Variables (Optional)
```bash
# Additional Neon database configuration options
DATABASE_URL_UNPOOLED=postgresql://username:password@host/database?sslmode=require
POSTGRES_URL=postgresql://username:password@host-pooler/database?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://username:password@host/database?sslmode=require
POSTGRES_USER=your_db_username
POSTGRES_HOST=your_db_host
POSTGRES_PASSWORD=your_db_password
POSTGRES_DATABASE=your_db_name
```

### Application Settings
```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions

1. **Copy the example above** into a new file called `.env.local` in your project root
2. **Replace all placeholder values** with your actual credentials
3. **Ensure `.env.local` is in `.gitignore`** (it should be by default)
4. **Generate a secure JWT secret** using the command provided above
5. **Get your database credentials** from your Neon dashboard

... existing code ...
\`\`\`

```typescript file="" isHidden

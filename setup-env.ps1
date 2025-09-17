# PowerShell script to set up environment variables for NexGPetrolube Backend
# This connects to your existing PostgreSQL container with the nextgpetrolube database

Write-Host "Setting up environment variables for NexGPetrolube Backend..." -ForegroundColor Green

# Set environment variables for the current session
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/nextgpetrolube?schema=public"
$env:JWT_SECRET = "nexg-petrolube-super-secret-jwt-key-2024"
$env:JWT_EXPIRES_IN = "7d"
$env:JWT_REFRESH_SECRET = "nexg-petrolube-refresh-secret-2024"
$env:JWT_REFRESH_EXPIRES_IN = "30d"
$env:NODE_ENV = "development"
$env:PORT = "8000"
$env:API_PREFIX = "api/v1"
$env:FRONTEND_URL = "http://localhost:3000"
$env:ADMIN_URL = "http://localhost:3001"
$env:ADMIN_DEMO_EMAIL = "admin@nexgpetrolube.com"
$env:ADMIN_DEMO_PASSWORD = "Admin@123"
$env:THROTTLE_TTL = "60"
$env:THROTTLE_LIMIT = "100"
$env:CORS_ORIGIN = "http://localhost:3000,http://localhost:3001"
$env:WS_CORS_ORIGIN = "http://localhost:3000,http://localhost:3001"
$env:MAX_FILE_SIZE = "10485760"
$env:MAX_FILES = "5"
$env:BCRYPT_ROUNDS = "12"
$env:SESSION_SECRET = "nexg-petrolube-session-secret-2024"

Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host "Database URL: $env:DATABASE_URL" -ForegroundColor Yellow
Write-Host "JWT Secret: $env:JWT_SECRET" -ForegroundColor Yellow
Write-Host "Port: $env:PORT" -ForegroundColor Yellow

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Run: pnpm prisma:generate" -ForegroundColor White
Write-Host "2. Run: pnpm prisma:migrate" -ForegroundColor White
Write-Host "3. Run: pnpm prisma:seed" -ForegroundColor White
Write-Host "4. Run: pnpm start:dev" -ForegroundColor White
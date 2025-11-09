# Full-Stack Web Application

A modern web application with PHP backend and TypeScript/Vite frontend.

## Project Structure

```
.
├── backend/         # PHP backend application
│   ├── public/     # Public facing PHP files
│   ├── src/        # Backend source code
│   └── vendor/     # Composer dependencies
└── frontend/       # TypeScript/Vite frontend
    ├── public/     # Static assets
    └── src/        # Frontend source code
```

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Copy the environment file and configure it:
```bash
cp .env.example .env
```

3. Install PHP dependencies:
```bash
composer install
```

4. Import the database schema: (Ensure your .env has the required database credentials)
```bash
cd src
php db.php
```

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

## Development

- Backend API runs on PHP
- Frontend uses TypeScript with Vite for fast development
- Database schema available in `shop.sql`

## Building for Production

### Backend
- Ensure all configurations in `.env` are set for production
- Deploy the contents of the `backend` directory to your server

### Frontend
```bash
cd frontend
pnpm build
```

## Technologies Used

- Backend:
  - PHP
  - Composer for dependency management
  - MySQL database
- Frontend:
  - TypeScript
  - Vite
  - PNPM for package management

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

[MIT License](LICENSE)

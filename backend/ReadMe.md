# Backend Setup Guide

This guide will help you set up and run the backend for this project.

## Prerequisites
- PHP 7.4 or higher
- Composer (dependency manager for PHP)

## 1. Clone the Repository
Clone the project to your local machine:

```
git clone <repository-url>
cd backend
```

## 2. Install Composer
If you don't have Composer installed, download and install it from [getcomposer.org](https://getcomposer.org/download/).

## 3. Install Dependencies
Run the following command in the `backend` directory to install PHP dependencies. The `--ignore-platform-reqs` flag ensures compatibility across different environments:

```
composer install --ignore-platform-reqs
```

## 4. Set Up Environment Variables
1. Copy the example environment file to create your own `.env` file:
   
   ```
   cp .env.example .env
   ```
   On Windows, you can use:
   ```
   copy .env.example .env
   ```
2. Edit the `.env` file to set your database and other environment-specific settings.

## 5. Create the Database and tables (If you haven't already)
The database queries are in shop.sql

## 6. Start the PHP Development Server
Run the following command in the `backend` directory:

```
php -S localhost:8000 -t public
```

This will start the backend server at [http://localhost:8000](http://localhost:8000).

## 7. Troubleshooting
- If you encounter missing extensions or platform errors, ensure you are using the `--ignore-platform-reqs` flag with Composer.
- Make sure your `.env` file is configured correctly for your environment.

## 8. Additional Notes
- Do not commit your `.env` file or the `vendor/` directory to version control.

---

If you have any issues, please consult the project documentation or contact the maintainer.

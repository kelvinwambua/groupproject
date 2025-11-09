<?php
require __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

 
$rootDir = __DIR__ . '/../'; 
$dotenv = Dotenv::createImmutable($rootDir);
try {
    $dotenv->load();
} catch (\Dotenv\Exception\InvalidPathException $e) {
    
    die("Error: .env file not found in $rootDir. Please create one.\n");
}



$host = $_ENV['DB_HOST'] ?? 'localhost';
$db   = $_ENV['DB_DATABASE'] ?? 'shop';
$user = $_ENV['DB_USERNAME'] ?? 'root';
$pass = $_ENV['DB_PASSWORD'] ?? '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE               => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE    => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES      => false,
];


try {
     $pdo = new PDO("mysql:host=$host;charset=$charset", $user, $pass, $options);
     echo "Connection to MySQL established.\n";
} catch (\PDOException $e) {
     die("Connection failed: " . $e->getMessage() . "\n");
}



$sql = "
    -- Create Database if it doesn't exist (using the name from .env)
    CREATE DATABASE IF NOT EXISTS `$db`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
    
    -- Switch to the new/existing database
    USE `$db`;

    -- users table
    CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        two_factor_code VARCHAR(6) NULL,
        two_factor_expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- email_verification_tokens table
    CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX(token),
        INDEX(user_id)
    );

    -- products table
    CREATE TABLE IF NOT EXISTS products (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        created_by INT UNSIGNED,
        description TEXT,
        image_url VARCHAR(255),
        price DECIMAL(10, 2) NOT NULL,
        stock INT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );
    
    -- categories table
    CREATE TABLE IF NOT EXISTS categories (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- product_category pivot table (many-to-many relationship)
    CREATE TABLE IF NOT EXISTS product_category (
        product_id INT UNSIGNED NOT NULL,
        category_id INT UNSIGNED NOT NULL,
        PRIMARY KEY (product_id, category_id),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    -- carts table
    CREATE TABLE IF NOT EXISTS carts (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED UNIQUE NOT NULL,
        status ENUM('active', 'completed') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- cart_items table
    CREATE TABLE IF NOT EXISTS cart_items (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        cart_id INT UNSIGNED NOT NULL,
        product_id INT UNSIGNED NOT NULL,
        quantity INT UNSIGNED DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_cart_product (cart_id, product_id),
        FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
";


try {
    $pdo->exec($sql);
    echo "Database '$db' created/selected.\n";
    echo "All tables created or confirmed to exist successfully.\n";
} catch (\PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}

?>
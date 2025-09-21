<?php
use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Events\Dispatcher;
use Illuminate\Container\Container;

$capsule = new Capsule;

$capsule->addConnection([
    'driver' => 'mysql',
    'host' => $_ENV['DB_HOST'] ?? 'localhost',
    'port' => $_ENV['DB_PORT'] ?? 3306,
    'database' => $_ENV['DB_DATABASE'] ?? 'shop',
    'username' => $_ENV['DB_USERNAME'] ?? 'root',
    'password' => $_ENV['DB_PASSWORD'] ?? 'Jason',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
    'strict' => false,
    'engine' => null,
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ],
]);

$capsule->setEventDispatcher(new Dispatcher(new Container));
$capsule->setAsGlobal();
$capsule->bootEloquent();
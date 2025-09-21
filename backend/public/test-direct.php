<?php
require __DIR__ . '/../vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;

$capsule->addConnection([
    'driver' => 'mysql',
    'host' => 'localhost',
    'port' => 3306,
    'database' => 'shop',
    'username' => 'root',
    'password' => 'Jason',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

try {
    $result = $capsule->getConnection()->select('SELECT "Eloquent works!" as message');
    echo json_encode($result[0]);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
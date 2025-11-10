<?php
require __DIR__ . '/../vendor/autoload.php';
ini_set('memory_limit', '512M');

if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            putenv($line);
            list($key, $value) = explode('=', $line, 2);
            $_ENV[$key] = $value;
        }
    }
}

require __DIR__ . '/../src/database.php';

use Slim\Factory\AppFactory;

$app = AppFactory::create();

$app->addErrorMiddleware(true, true, true);

$app->add(function ($request, $handler) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return $handler->handle($request);
});


$app->add(function ($request, $handler) {
    $origin = $request->getHeaderLine('Origin');

    // Allow localhost origins on any port (useful during development)
    $isLocalOrigin = false;
    if ($origin) {
        $isLocalOrigin = preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin);
    }

    if ($request->getMethod() === 'OPTIONS') {
        $response = new \Slim\Psr7\Response();
    if ($isLocalOrigin) {
            return $response
        ->withHeader('Access-Control-Allow-Origin', $origin)
                ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
                ->withHeader('Access-Control-Allow-Credentials', 'true')
                ->withHeader('Access-Control-Max-Age', '3600')
                ->withStatus(204);
        }
        return $response->withStatus(204);
    }

    $response = $handler->handle($request);
    if ($isLocalOrigin) {
        $response = $response
            ->withHeader('Access-Control-Allow-Origin', $origin)
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
            ->withHeader('Access-Control-Allow-Credentials', 'true')
            ->withHeader('Access-Control-Max-Age', '3600');
    }
    return $response;
});

require __DIR__ . '/../src/routes.php';

$app->run();
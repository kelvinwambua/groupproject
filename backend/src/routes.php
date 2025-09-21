<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\User;  
use App\Controllers\LoginController;  

$app->options('/api/login', function (Request $request, Response $response) {
    return $response;
});

$app->post('/api/login', function (Request $request, Response $response) {
    $data = json_decode($request->getBody(), true);
    
    if (!$data['email'] || !$data['password']) {
        $response->getBody()->write(json_encode(['success' => false, 'error' => 'Email and password are required']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }
    
    $controller = new LoginController();
    $result = $controller->login($data['email'], $data['password']);
    
    $response->getBody()->write(json_encode($result));
    return $response->withStatus($result['success'] ? 200 : 401)->withHeader('Content-Type', 'application/json');
});

$app->options('/api/verify-2fa', function (Request $request, Response $response) {
    return $response;
});

$app->post('/api/verify-2fa', function (Request $request, Response $response) {
    $data = json_decode($request->getBody(), true);
    
    if (!$data['email'] || !$data['code']) {
        $response->getBody()->write(json_encode(['success' => false, 'error' => 'Email and 2FA code are required']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }
    
    $controller = new LoginController();
    $result = $controller->verify2FA($data['email'], $data['code']);
    
    $response->getBody()->write(json_encode($result));
    return $response->withStatus($result['success'] ? 200 : 401)->withHeader('Content-Type', 'application/json');
});

$app->options('/api/resend-2fa', function (Request $request, Response $response) {
    return $response;
});

$app->post('/api/resend-2fa', function (Request $request, Response $response) {
    $data = json_decode($request->getBody(), true);
    
    if (!$data['email']) {
        $response->getBody()->write(json_encode(['success' => false, 'error' => 'Email is required']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }
    
    $controller = new LoginController();
    $result = $controller->resend2FACode($data['email']);
    
    $response->getBody()->write(json_encode($result));
    return $response->withStatus($result['success'] ? 200 : 400)->withHeader('Content-Type', 'application/json');
});

$app->options('/api/logout', function (Request $request, Response $response) {
    return $response;
});

$app->post('/api/logout', function (Request $request, Response $response) {
    $controller = new LoginController();
    $result = $controller->logout();
    $response->getBody()->write(json_encode($result));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/api/session', function (Request $request, Response $response) {
    $controller = new LoginController();
    $user = $controller->check();
    if ($user) {
        $response->getBody()->write(json_encode(['loggedIn' => true, 'user' => $user]));
    } else {
        $response->getBody()->write(json_encode(['loggedIn' => false]));
    }
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/api/users', function (Request $request, Response $response) {
    $users = User::all();
    
    $response->getBody()->write(json_encode($users));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/api/users/{id}', function (Request $request, Response $response, $args) {
    $user = User::find($args['id']);
    
    if (!$user) {
        $response->getBody()->write(json_encode(['error' => 'User not found']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }
    
    $response->getBody()->write(json_encode($user));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/api/test-db', function (Request $request, Response $response) {
    try {
        $pdo = new PDO('mysql:host=localhost;dbname=shop', 'root', '');
        $stmt = $pdo->query('SELECT "Connection works!" as message');
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (PDOException $e) {
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

$app->post('/api/users', function (Request $request, Response $response) {
    $data = json_decode($request->getBody(), true);
    $existingUser = User::where('email', $data['email'])->first();
    if ($existingUser) {
        $response->getBody()->write(json_encode([
            'error' => 'A user with this email already exists.'
        ]));
        return $response
            ->withStatus(409) 
            ->withHeader('Content-Type', 'application/json');
    }
    
    $user = User::create([
        'name' => $data['name'],
        'email' => $data['email'],
        'password' => password_hash($data['password'], PASSWORD_BCRYPT)
    ]);
    
    $response->getBody()->write(json_encode($user));
    return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
});

$app->put('/api/users/{id}', function (Request $request, Response $response, $args) {
    $user = User::find($args['id']);
    
    if (!$user) {
        $response->getBody()->write(json_encode(['error' => 'User not found']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }
    
    $data = json_decode($request->getBody(), true);
    $user->update($data);
    
    $response->getBody()->write(json_encode($user));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->delete('/api/users/{id}', function (Request $request, Response $response, $args) {
    $user = User::find($args['id']);
    
    if (!$user) {
        $response->getBody()->write(json_encode(['error' => 'User not found']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }
    
    $user->delete();
    
    $response->getBody()->write(json_encode(['message' => 'User deleted']));
    return $response->withHeader('Content-Type', 'application/json');
});
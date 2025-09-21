<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\User;
use backend\src\Controllers\LoginController;
// Login, logout, and session check routes
$app->post('/api/login', function (Request $request, Response $response) {
    $data = json_decode($request->getBody(), true);
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $remember = $data['remember'] ?? false;
    $controller = new LoginController();
    $user = $controller->login($email, $password, $remember);
    if ($user) {
        $response->getBody()->write(json_encode(['success' => true, 'user' => $user]));
        return $response->withHeader('Content-Type', 'application/json');
    } else {
        $response->getBody()->write(json_encode(['success' => false, 'error' => 'Invalid credentials']));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
});

$app->post('/api/logout', function (Request $request, Response $response) {
    $controller = new LoginController();
    $controller->logout();
    $response->getBody()->write(json_encode(['success' => true]));
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

// Get all users
$app->get('/api/users', function (Request $request, Response $response) {
    $users = User::all();
    
    $response->getBody()->write(json_encode($users));
    return $response->withHeader('Content-Type', 'application/json');
});

// Get single user
$app->get('/api/users/{id}', function (Request $request, Response $response, $args) {
    $user = User::find($args['id']);
    
    if (!$user) {
        $response->getBody()->write(json_encode(['error' => 'User not found']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }
    
    $response->getBody()->write(json_encode($user));
    return $response->withHeader('Content-Type', 'application/json');
});


// Test database connection
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

// Create user
$app->post('/api/users', function (Request $request, Response $response) {
    $data = json_decode($request->getBody(), true);
    // Check if email already exists
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

// Update user
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

// Delete user
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
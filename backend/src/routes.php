<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\User;

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
$app->get('/api/test-db', function (Request $request, Response $response) {
    try {
        $pdo = new PDO('mysql:host=localhost;dbname=shop', 'root', 'Jason');
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
    
    $user = User::create([
        'name' => $data['name'],
        'email' => $data['email']
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
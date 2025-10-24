<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\User;  
use App\Controllers\LoginController;  
use App\Controllers\SignupController;
use App\Models\Product; 
use App\Models\Category;
use Dompdf\Dompdf;
use Dompdf\Options; 

// Category routes
$app->get('/api/categories', function (Request $request, Response $response) {
    $categories = Category::all();
    $response->getBody()->write(json_encode($categories));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/api/categories', function (Request $request, Response $response) {
    $controller = new LoginController();
    $adminUser = $controller->check();
    if(!$adminUser || $adminUser->role !== 'admin') {
        $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }

    $data = json_decode($request->getBody(), true);
    if (empty($data['name'])) {
        $response->getBody()->write(json_encode(['error' => 'Category name is required']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $category = Category::create([
        'name' => $data['name'],
        'description' => $data['description'] ?? null,
        'slug' => strtolower(str_replace(' ', '-', $data['name']))
    ]);

    $response->getBody()->write(json_encode($category));
    return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
});


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
    error_log(print_r($user, true));
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
$app->get('/api/users/report', function (Request $request, Response $response) {
  
          $controller = new LoginController();

    $adminUser = $controller->check();
    if(!$adminUser || $adminUser->role !== 'admin') {
        $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }

    
    $users = User::all();

    
    $html = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Users Report</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 40px;
            }
            h1 {
                text-align: center;
                color: #333;
                margin-bottom: 10px;
            }
            .report-info {
                text-align: center;
                color: #666;
                margin-bottom: 30px;
                font-size: 12px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th {
                background-color: #4CAF50;
                color: white;
                padding: 12px;
                text-align: left;
                font-weight: bold;
            }
            td {
                padding: 10px;
                border-bottom: 1px solid #ddd;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            tr:hover {
                background-color: #f5f5f5;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 10px;
                color: #999;
            }
            .badge {
                padding: 4px 8px;
                border-radius: 3px;
                font-size: 11px;
                font-weight: bold;
            }
            .badge-admin {
                background-color: #ff9800;
                color: white;
            }
            .badge-user {
                background-color: #2196F3;
                color: white;
            }
        </style>
    </head>
    <body>
        <h1>Users Report</h1>
        <div class="report-info">
            Generated on: ' . date('F d, Y h:i A') . '<br>
            Total Users: ' . count($users) . '
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                </tr>
            </thead>
            <tbody>';
    
    foreach ($users as $user) {
        $role = $user->role ?? 'user';
        $badgeClass = $role === 'admin' ? 'badge-admin' : 'badge-user';
        
        $html .= '
                <tr>
                    <td>' . htmlspecialchars($user->id) . '</td>
                    <td>' . htmlspecialchars($user->name) . '</td>
                    <td>' . htmlspecialchars($user->email) . '</td>
                    <td><span class="badge ' . $badgeClass . '">' . strtoupper($role) . '</span></td>
                    <td>' . date('M d, Y', strtotime($user->created_at)) . '</td>
                </tr>';
    }
    
    $html .= '
            </tbody>
        </table>
        
      
    </body>
    </html>';

    
    $options = new Options();
    $options->set('isHtml5ParserEnabled', true);
    $options->set('isPhpEnabled', true);
    $options->set('defaultFont', 'Arial');
    

    $dompdf = new Dompdf($options);
    
    
    $dompdf->loadHtml($html);
    
    
    $dompdf->setPaper('A4', 'portrait');
    
    
    $dompdf->render();
    
    
    $pdf = $dompdf->output();
    
    
    $response = $response
        ->withHeader('Content-Type', 'application/pdf')
        ->withHeader('Content-Disposition', 'attachment; filename="users-report-' . date('Y-m-d') . '.pdf"')
        ->withHeader('Cache-Control', 'private, max-age=0, must-revalidate')
        ->withHeader('Pragma', 'public');
    
    $response->getBody()->write($pdf);
    
    return $response;
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

        $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
        $port = $_ENV['DB_PORT'] ?? 3307;
        $db = $_ENV['DB_DATABASE'] ?? 'shop';
        $user = $_ENV['DB_USERNAME'] ?? 'root';
        $pass = $_ENV['DB_PASSWORD'] ?? '';

        $dsn = "mysql:host={$host};port={$port};dbname={$db}";
        $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $stmt = $pdo->query('SELECT "Connection works!" as message');
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (PDOException $e) {
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});


// Signup route
$app->post('/api/users', function (Request $request, Response $response) {
    $data = json_decode($request->getBody(), true);

    
    if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
        $response->getBody()->write(json_encode([
            'error' => 'Name, email, and password are required.'
        ]));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    // Call the SignupController
    $controller = new SignupController();
    $result = $controller->register($data['name'], $data['email'], $data['password']);

    // If there’s an error (like duplicate email)
    if (isset($result['error'])) {
        $response->getBody()->write(json_encode($result));
        return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
    }

    
    $response->getBody()->write(json_encode($result));
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
          $controller = new LoginController();

    $adminUser = $controller->check();
    if(!$adminUser || $adminUser->role !== 'admin') {
        $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }
    $user = User::find($args['id']);

    
    if (!$user) {
        $response->getBody()->write(json_encode(['error' => 'User not found']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }
    
    $user->delete();
    
    $response->getBody()->write(json_encode(['message' => 'User deleted']));
    return $response->withHeader('Content-Type', 'application/json');
});
$app->get('/api/products', function (Request $request, Response $response) {
    $query = Product::query();
      
    if ($categoryname = $request->getQueryParams()['category_name'] ?? null) {
        $query->where('category_name', $categoryname);
    }
  
    $products = $query->with(['category', 'creator'])->get();
    
    $response->getBody()->write(json_encode($products));
    return $response->withHeader('Content-Type', 'application/json');
});
$app->get('/api/products/{id}', function (Request $request, Response $response, $args) {
    $product = Product::find($args['id']);

    if (!$product) {
        $response->getBody()->write(json_encode(['error' => 'Product not found']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }

    $response->getBody()->write(json_encode($product));
    return $response->withHeader('Content-Type', 'application/json');
});
$app->post('/api/products', function (Request $request, Response $response) {
          $controller = new LoginController();

    $adminUser = $controller->check();
    if(!$adminUser) {
        $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }
    $data = json_decode($request->getBody(), true);

    if (empty($data['name']) || empty($data['description']) || !isset($data['price']) || !isset($data['stock']) || !isset($data['category_name'])) {
        $response->getBody()->write(json_encode([
            'error' => 'Name, description, price, stock, and category are required.'
        ]));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $category = Category::find($data['category_name']);
    if (!$category) {
        $response->getBody()->write(json_encode(['error' => 'Invalid category']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $product = Product::create([
        'name' => $data['name'],
        'created_by' => $adminUser->id,
        'category_name' => $data['category_name'],
        'description' => $data['description'],
        'image_url' => $data['image_url'] ?? null,
        'price' => $data['price'],
        'stock' => $data['stock'],
    ]);

    $response->getBody()->write(json_encode($product));
    return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
});
$app->post('/api/products/upload', function (Request $request, Response $response) {
    $controller = new LoginController();

    
    $adminUser = $controller->check();
    if (!$adminUser) {
        $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }

    
    $uploadedFiles = $request->getUploadedFiles();

    if (empty($uploadedFiles['image'])) {
        $response->getBody()->write(json_encode(['error' => 'No file uploaded']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $image = $uploadedFiles['image'];

    if ($image->getError() !== UPLOAD_ERR_OK) {
        $response->getBody()->write(json_encode([
            'error' => 'Upload failed with error code ' . $image->getError()
        ]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }

    
    $uploadDir = __DIR__ . '/../public/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    
    $extension = pathinfo($image->getClientFilename(), PATHINFO_EXTENSION);
    $basename = bin2hex(random_bytes(8)); 
    $filename = sprintf('%s.%s', $basename, $extension);


    $image->moveTo($uploadDir . DIRECTORY_SEPARATOR . $filename);

    $url = '/uploads/' . $filename;

    $response->getBody()->write(json_encode([
        'filename' => $filename,
        'url' => $url
    ]));

    return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
});




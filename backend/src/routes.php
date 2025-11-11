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
use App\Models\Cart;
use App\Models\Cart_Item;
use Illuminate\Database\Capsule\Manager as Capsule;

// Helper function to get or create cart for user
$getOrCreateActiveCart = function (User $user) {
    $cart = Cart::where('user_id', $user->id)
                ->where('status', 'active')
                ->first();
    if (!$cart) {
        $cart = new Cart();
        $cart->user_id = $user->id;
        $cart->status = 'active';
        $cart->save();
    }
    return $cart;
};

// Simple shipping cost calculator closure
$computeShippingCost = function ($shipping, $subtotal = 0.0) {
    $country = strtolower(trim($shipping['country'] ?? ''));
    $city = strtolower(trim($shipping['city'] ?? ''));
    $subtotal = floatval($subtotal);

    
    if ($country === 'kenya' || $country === 'ke') {
        
        if ($city !== '' && strpos($city, 'nairobi') !== false) {
            return ['method' => 'Local Standard', 'cost' => 100.00, 'eta_days' => 1];
        }

        return ['method' => 'National Standard', 'cost' => 300.00, 'eta_days' => 3];
    }


    return ['method' => 'International Standard', 'cost' => 1000.00, 'eta_days' => 7];
};

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

    if (empty($data['name']) || empty($data['description']) || 
        !isset($data['price']) || !isset($data['stock']) || !isset($data['category_name'])) {
        $response->getBody()->write(json_encode(['error' => 'Missing fields']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $category = Category::where('name', $data['category_name'])->first();
    if (!$category) {
        $response->getBody()->write(json_encode(['error' => 'Invalid category']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $product = Product::create([
        'name' => $data['name'],
        'created_by' => $adminUser->id,
        'category_id' => $category->id,         
        'description' => $data['description'],
        'image_url' => $data['image_url'] ?? null,
        'price' => $data['price'],
        'stock' => $data['stock'],
    ]);

    $response->getBody()->write(json_encode($product->load('category')));
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

$app->get('/api/users/{id}/cart', function (Request $request, Response $response, $args) {
    $controller = new LoginController();
    $user = User::find($args['id']);

    if (!$user) {
        $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }

    $cart = Cart::where('user_id', $user->id)
                ->where('status', 'active')
                ->with('cart_items.product')
                ->first();

    if (!$cart) {
        $response->getBody()->write(json_encode(['cart_items' => [], 'quantity' => 0, 'total_price' => 0]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    $response->getBody()->write(json_encode($cart));
    return $response->withHeader('Content-Type', 'application/json');
});
$app->post('/api/users/{id}/cart', function (Request $request, Response $response, $args) use ($getOrCreateActiveCart) {
    $userId = $args['id'];
    $user = User::find($userId);

    if (!$user) {
        $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }

    $data = $request->getParsedBody();
    $productId = $data['product_id'] ?? null;
    $quantity = (int) ($data['quantity'] ?? 1); 

    if (!$productId || $quantity <= 0) {
        $response->getBody()->write(json_encode(['error' => 'Invalid product ID or quantity.']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $cart = $getOrCreateActiveCart($user);

    
    $Cart_Item = Cart_Item::where('cart_id', $cart->id)
                        ->where('product_id', $productId)
                        ->first();

    if ($Cart_Item) {
        
        $Cart_Item->quantity += $quantity;
        $Cart_Item->save();
        $message = "Product quantity incremented.";
    } else {
        
        $Cart_Item = new Cart_Item();
        $Cart_Item->cart_id = $cart->id;
        $Cart_Item->product_id = $productId;
        $Cart_Item->quantity = $quantity;
        $Cart_Item->save();
        $message = "Product added to cart.";
    }

    
    $updatedCart = $cart->load('cart_items.product'); 
    $response->getBody()->write(json_encode(['message' => $message, 'cart' => $updatedCart]));
    return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
});
$app->put('/api/users/{id}/cart', function (Request $request, Response $response, $args) {
    $userId = $args['id'];
    $user = User::find($userId);

    if (!$user) {
        $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }

    $data = $request->getParsedBody();
    $Cart_ItemId = $data['cart_item_id'] ?? null;
    $newQuantity = (int) ($data['quantity'] ?? 0);

    if (!$Cart_ItemId || $newQuantity < 0) {
        $response->getBody()->write(json_encode(['error' => 'Invalid cart item ID or quantity.']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }
    
    
    $Cart_Item = Cart_Item::where('id', $Cart_ItemId)
                        ->whereHas('cart', function ($query) use ($userId) {
                            $query->where('user_id', $userId)->where('status', 'active');
                        })
                        ->first();

    if (!$Cart_Item) {
        $response->getBody()->write(json_encode(['error' => 'Cart item not found or does not belong to user.']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }
    
    $message = "Quantity updated successfully.";

    if ($newQuantity === 0) {
        
        $Cart_Item->delete();
        $message = "Cart item removed successfully.";
    } else {
        
        $Cart_Item->quantity = $newQuantity;
        $Cart_Item->save();
    }

    
    $updatedCart = Cart::where('user_id', $userId)
                        ->where('status', 'active')
                        ->with('cart_items.product')
                        ->first();
                        
    $response->getBody()->write(json_encode(['message' => $message, 'cart' => $updatedCart]));
    return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
});
$app->delete('/api/users/{id}/cart/{cart_item_id}', function (Request $request, Response $response, $args) {
    $userId = $args['id'];
    $Cart_ItemId = $args['cart_item_id'];
    $user = User::find($userId);

    if (!$user) {
        $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }   
    
    $deletedCount = Cart_Item::where('id', $Cart_ItemId)
                        ->whereHas('cart', function ($query) use ($userId) {
                            $query->where('user_id', $userId)->where('status', 'active');
                        })
                        ->delete(); 

    if ($deletedCount === 0) {
        $response->getBody()->write(json_encode(['error' => 'Cart item not found or already removed.']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }

    
    $updatedCart = Cart::where('user_id', $userId)
                        ->where('status', 'active')
                        ->with('cart_items.product')
                        ->first();
                        
    $response->getBody()->write(json_encode(['message' => 'Item successfully removed from cart.', 'cart' => $updatedCart]));
    return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
});

// Checkout 
$app->post('/api/users/{id}/checkout', function (Request $request, Response $response, $args) {
    $userId = $args['id'];
    $user = User::find($userId);

    if (!$user) {
        $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }

    
    $body = $request->getParsedBody();
    if (is_null($body)) {
        
        $raw = (string) $request->getBody();
        $body = json_decode($raw, true) ?? [];
    }
    $shipping = $body['shipping'] ?? null;


    $subtotal = 0.0;
    foreach ($cart->cart_items ?? [] as $ci_tmp) {
        $pprice = floatval($ci_tmp->product->price ?? 0);
        $subtotal += $pprice * $ci_tmp->quantity;
    }
    if ($shipping && !isset($shipping['cost'])) {
        try {
            $calc = $computeShippingCost($shipping, $subtotal);
            $shipping['cost'] = $calc['cost'];
            if (!isset($shipping['method'])) $shipping['method'] = $calc['method'];
        } catch (\Exception $e) {
            
        }
    }

    
    $cart = Cart::where('user_id', $user->id)
                ->where('status', 'active')
                ->with('cart_items.product')
                ->first();

    if (!$cart || empty($cart->cart_items)) {
        $response->getBody()->write(json_encode(['error' => 'Cart is empty.']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    try {
    $orderId = null;
    Capsule::connection()->transaction(function () use ($cart, $user, &$orderId, $shipping) {
            $total = 0.0;
            $orderItems = [];

            foreach ($cart->cart_items as $ci) {
                $product = $ci->product;
                if (!$product) {
                    throw new \Exception("Product not found: {$ci->product_id}");
                }
                if ($product->stock < $ci->quantity) {
                    throw new \Exception("Insufficient stock for product {$product->id}: available {$product->stock}, requested {$ci->quantity}");
                }
                $price = isset($product->price) ? floatval($product->price) : 0.0;
                $line = $price * $ci->quantity;
                $total += $line;
                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $ci->quantity,
                    'price' => $price,
                ];
            }

            
            $shipping_cost = 0.0;
            $shipping_method = null;
            if ($shipping) {
                
                if (isset($shipping['cost']) && is_numeric($shipping['cost'])) {
                    $shipping_cost = floatval($shipping['cost']);
                } else {
                    
                    $country = strtolower(trim((string)($shipping['country'] ?? '')));
                    $city = strtolower(trim((string)($shipping['city'] ?? '')));

                    if ($country === 'kenya') {
                        if (strpos($city, 'nairobi') !== false) {
                            $shipping_cost = 100.00;
                            $shipping_method = 'local';
                        } else {
                            $shipping_cost = 300.00;
                            $shipping_method = 'national';
                        }
                    } else {
                        $shipping_cost = 1000.00;
                        $shipping_method = 'international';
                    }

                    
                }

                if (isset($shipping['method']) && !$shipping_method) {
                    $shipping_method = $shipping['method'];
                }
            }

            $orderData = [
                'user_id' => $user->id,
                'status' => 'pending',
                'total' => number_format($total, 2, '.', ''),
                'shipping_address' => $shipping ? json_encode($shipping) : null,
                'shipping_method' => $shipping_method ?? ($shipping['method'] ?? null),
                'shipping_cost' => number_format($shipping_cost, 2, '.', ''),
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];

            $orderId = Capsule::table('orders')->insertGetId($orderData);

            foreach ($orderItems as $oi) {
                Capsule::table('order_items')->insert([
                    'order_id' => $orderId,
                    'product_id' => $oi['product_id'],
                    'quantity' => $oi['quantity'],
                    'price' => number_format($oi['price'], 2, '.', ''),
                    'created_at' => date('Y-m-d H:i:s')
                ]);

                Capsule::table('products')->where('id', $oi['product_id'])->decrement('stock', $oi['quantity']);
            }

            $cart->status = 'completed';
            $cart->save();
        });

        $created = Capsule::table('orders')->where('id', $orderId)->first();
        $response->getBody()->write(json_encode(['message' => 'Checkout successful', 'order' => $created]));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');

    } catch (\Exception $e) {
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }
});

// Get order details
$app->get('/api/orders/{id}', function (Request $request, Response $response, $args) {
    $orderId = $args['id'];
    $order = Capsule::table('orders')->where('id', $orderId)->first();
    if (!$order) {
        $response->getBody()->write(json_encode(['error' => 'Order not found']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }

    $items = Capsule::table('order_items')
                ->where('order_id', $orderId)
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->select('order_items.*', 'products.name as product_name', 'products.image_url as product_image')
                ->get();

    $order->items = $items;

    $response->getBody()->write(json_encode($order));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/api/orders/{id}/send-confirmation', function (Request $request, Response $response, $args) {
    $orderId = $args['id'];

    try {
        $order = Capsule::table('orders')->where('id', $orderId)->first();
        if (!$order) {
            $response->getBody()->write(json_encode(['error' => 'Order not found']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $user = User::find($order->user_id);
        if (!$user) {
            $response->getBody()->write(json_encode(['error' => 'User not found for order']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $items = Capsule::table('order_items')
                    ->where('order_id', $orderId)
                    ->join('products', 'order_items.product_id', '=', 'products.id')
                    ->select('order_items.*', 'products.name as product_name')
                    ->get();

        
        $body = "<h2>Order Confirmation</h2>";
        $body .= "<p>Hi " . htmlspecialchars($user->name ?? $user->email) . ",</p>";
        $body .= "<p>Thank you for your order. Here are the details:</p>";
        $body .= "<h3>Items</h3><ul>";
        $subtotal = 0.0;
        foreach ($items as $it) {
            $line = floatval($it->price) * intval($it->quantity);
            $subtotal += $line;
            $body .= "<li>" . htmlspecialchars($it->product_name) . " — Qty: " . intval($it->quantity) . " — Unit: " . number_format(floatval($it->price),2) . " — Line: " . number_format($line,2) . "</li>";
        }
        $body .= "</ul>";

        $body .= "<h3>Shipping</h3>";
        $body .= "<p>Method: " . htmlspecialchars($order->shipping_method ?? '—') . "</p>";
        $body .= "<p>Cost: " . number_format(floatval($order->shipping_cost ?? 0),2) . "</p>";

        
        $formattedAddress = '';
        if ($order->shipping_address) {
            $addr = null;
            if (is_string($order->shipping_address)) {
                $decoded = json_decode($order->shipping_address, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $addr = $decoded;
                } else {
                    
                    $formattedAddress = nl2br(htmlspecialchars($order->shipping_address));
                }
            } elseif (is_array($order->shipping_address) || is_object($order->shipping_address)) {
                $addr = (array)$order->shipping_address;
            }

            if ($addr && is_array($addr)) {
                $lines = [];
                if (!empty($addr['recipient_name'])) $lines[] = htmlspecialchars($addr['recipient_name']);
                $lineParts = [];
                if (!empty($addr['line1'])) $lineParts[] = htmlspecialchars($addr['line1']);
                if (!empty($addr['line2'])) $lineParts[] = htmlspecialchars($addr['line2']);
                if (!empty($lineParts)) $lines[] = implode(', ', $lineParts);
                $cityLine = '';
                if (!empty($addr['city'])) $cityLine .= htmlspecialchars($addr['city']);
                if (!empty($addr['state'])) $cityLine .= ($cityLine ? ', ' : '') . htmlspecialchars($addr['state']);
                if (!empty($addr['postal_code'])) $cityLine .= ($cityLine ? ' ' : '') . htmlspecialchars($addr['postal_code']);
                if ($cityLine) $lines[] = $cityLine;
                if (!empty($addr['country'])) $lines[] = htmlspecialchars($addr['country']);
                if (!empty($addr['phone'])) $lines[] = 'Phone: ' . htmlspecialchars($addr['phone']);

                $formattedAddress = implode("<br/>", $lines);
            }
        }

        $body .= "<p>Delivery address:<br/>" . ($formattedAddress ?: '—') . "</p>";

        $total = floatval($order->total) + floatval($order->shipping_cost ?? 0);
        $body .= "<h3>Order total: " . number_format($total,2) . "</h3>";

        
        $eta_days = $order->eta_days ?? null;
        if (!$eta_days) {
            $method = strtolower((string)($order->shipping_method ?? ''));
            if (strpos($method, 'local') !== false) $eta_days = 1;
            elseif (strpos($method, 'national') !== false) $eta_days = 3;
            else $eta_days = 7;
        }
        $est = new DateTime();
        $est->modify("+{$eta_days} days");
        $body .= "<p>Estimated delivery date: " . $est->format('Y-m-d') . "</p>";
        $body .= "<p>Pay on Delivery </p>";

        $body .= "<p>Regards,<br/>Your Shop</p>";

        $emailService = new \App\Services\EmailService();
        $sent = $emailService->sendEmail($user->email, $user->name ?? $user->email, "Order Confirmation #{$orderId}", $body);

        if ($sent) {
            $response->getBody()->write(json_encode(['message' => 'Confirmation email sent']));
            return $response->withHeader('Content-Type', 'application/json');
        } else {
            $response->getBody()->write(json_encode(['error' => 'Failed to send email']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

    } catch (\Exception $e) {
        error_log('Send confirmation email error: ' . $e->getMessage());
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});
$app->post('/api/users/send-email', function (Request $request, Response $response) {
    $data = json_decode($request->getBody(), true);

    if (empty($data['to']) || empty($data['subject']) || empty($data['body'])) {
        $response->getBody()->write(json_encode(['error' => 'To, subject, and body are required.']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $emailService = new \App\Services\EmailService();
    $success = $emailService->sendEmail($data['to'], $data['name'], $data['subject'], $data['body']);

    if ($success) {
        $response->getBody()->write(json_encode(['message' => 'Email sent successfully.']));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    } else {
        $response->getBody()->write(json_encode(['error' => 'Failed to send email.']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// Shipping cost calculator endpoint
$app->post('/api/shipping/calc', function (Request $request, Response $response) use ($computeShippingCost) {
    $body = $request->getParsedBody();
    if (is_null($body)) {
        $raw = (string) $request->getBody();
        $body = json_decode($raw, true) ?? [];
    }

    $shipping = $body['shipping'] ?? null;
    $subtotal = isset($body['subtotal']) ? floatval($body['subtotal']) : 0.0;

    if (!$shipping || !is_array($shipping)) {
        $response->getBody()->write(json_encode(['error' => 'Shipping information required']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $calc = $computeShippingCost($shipping, $subtotal);
    $eta_days = isset($calc['eta_days']) ? intval($calc['eta_days']) : null;
    $eta_date = $eta_days !== null ? date('Y-m-d', strtotime("+{$eta_days} days")) : null;

    $response->getBody()->write(json_encode([
        'method' => $calc['method'],
        'cost' => $calc['cost'],
        'eta_days' => $eta_days,
        'eta_date' => $eta_date
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});


$app->get('/api/users/{id}/addresses', function (Request $request, Response $response, $args) {
    $userId = $args['id'];
    $user = User::find($userId);
    if (!$user) {
        $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }

    $addresses = Capsule::table('addresses')->where('user_id', $userId)->get();
    $response->getBody()->write(json_encode($addresses));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/api/users/{id}/addresses', function (Request $request, Response $response, $args) {
    $userId = $args['id'];
    $user = User::find($userId);
    if (!$user) {
        $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }

    $data = $request->getParsedBody() ?? json_decode((string)$request->getBody(), true) ?? [];
    $required = ['recipient_name','line1','city','postal_code','country'];
    foreach ($required as $r) {
        if (empty($data[$r])) {
            $response->getBody()->write(json_encode(['error' => "Field $r is required"]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    $id = Capsule::table('addresses')->insertGetId([
        'user_id' => $userId,
        'label' => $data['label'] ?? null,
        'recipient_name' => $data['recipient_name'],
        'line1' => $data['line1'],
        'line2' => $data['line2'] ?? null,
        'city' => $data['city'],
        'state' => $data['state'] ?? null,
        'postal_code' => $data['postal_code'],
        'country' => $data['country'],
        'phone' => $data['phone'] ?? null,
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ]);

    $addr = Capsule::table('addresses')->where('id', $id)->first();
    $response->getBody()->write(json_encode($addr));
    return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
});

$app->put('/api/users/{id}/addresses/{aid}', function (Request $request, Response $response, $args) {
    $userId = $args['id'];
    $aid = $args['aid'];
    $user = User::find($userId);
    if (!$user) {
        $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }

    $data = $request->getParsedBody() ?? json_decode((string)$request->getBody(), true) ?? [];
    Capsule::table('addresses')->where('id', $aid)->where('user_id', $userId)->update(array_merge($data, ['updated_at' => date('Y-m-d H:i:s')]));

    $addr = Capsule::table('addresses')->where('id', $aid)->first();
    $response->getBody()->write(json_encode($addr));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->delete('/api/users/{id}/addresses/{aid}', function (Request $request, Response $response, $args) {
    $userId = $args['id'];
    $aid = $args['aid'];
    $user = User::find($userId);
    if (!$user) {
        $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }

    Capsule::table('addresses')->where('id', $aid)->where('user_id', $userId)->delete();
    $response->getBody()->write(json_encode(['message' => 'Address deleted']));
    return $response->withHeader('Content-Type', 'application/json');
});
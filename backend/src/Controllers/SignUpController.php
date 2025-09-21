<?php
namespace App\Controllers;

use App\Models\User;


class SignupController
{
    /**
     * Generate a simple base64 access token
     */
    private function generateAccessToken($user)
    {
        $payload = [
            'user_id' => $user->id,
            'email'   => $user->email,
            'iat'     => time(),
            'exp'     => time() + (60 * 60 * 24) // 24 hours expiry
        ];

        return base64_encode(json_encode($payload));
    }

    /**
     * Handle user signup
     */
    public function register($name, $email, $password)
    {
        // Check if email is already taken
        $existingUser = User::where('email', $email)->first();
        if ($existingUser) {
            return [
                'error' => 'Email already registered.'
            ];
        }

        // Hash the password
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Create the user
        $user = User::create([
            'name'     => $name,
            'email'    => $email,
            'password' => $hashedPassword,
        ]);

        // Generate token
        $token = $this->generateAccessToken($user);

        // Hide password before returning
        unset($user->password);

        return [
            'message' => 'Signup successful.',
            'user'    => $user,
            'token'   => $token
        ];
    }
}

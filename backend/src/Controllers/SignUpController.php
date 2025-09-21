<?php
namespace App\Controllers;

use App\Models\User;
use App\Services\EmailService;

class SignupController
{
    private $emailService;

    public function __construct()
    {
        $this->emailService = new EmailService();
    }

    // Generate a simple access token 
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

    // Generate a random 6-digit 2FA code
    private function generate2FACode()
    {
        return sprintf('%06d', random_int(100000, 999999));
    }

    // Register a new user
    public function register($name, $email, $password)
    {
        // Check if email is already taken
        $existingUser = User::where('email', $email)->first();
        if ($existingUser) {
            return [
                'success' => false,
                'error' => 'Email already registered.'
            ];
        }

        // Hash the password
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Create the user (but mark them as unverified)
        $user = User::create([
            'name'     => $name,
            'email'    => $email,
            'password' => $hashedPassword,
        ]);

        // Generate 2FA code
        $code = $this->generate2FACode();
        $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        $user->two_factor_code = $code;
        $user->two_factor_expires_at = $expiresAt;
        $user->save();

        // Send 2FA code via email
        $emailSent = $this->emailService->send2FACode($user->email, $user->name, $code);

        return [
            'success' => true,
            'requires_2fa' => true,
            'message' => 'Signup successful. Please check your email for the 2FA verification code.',
            'email_sent' => $emailSent
        ];
    }

    /**
     * Verify the signup 2FA code
     */
    public function verify2FA($email, $code)
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            return ['success' => false, 'error' => 'User not found'];
        }

        if (!$user->two_factor_code || 
            $user->two_factor_code !== $code || 
            strtotime($user->two_factor_expires_at) < time()) {
            return ['success' => false, 'error' => 'Invalid or expired 2FA code'];
        }

        // Clear 2FA fields
        $user->two_factor_code = null;
        $user->two_factor_expires_at = null;
        $user->save();

        // Start session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $_SESSION['user_id'] = $user->id;
        $_SESSION['user_email'] = $user->email;

        // Generate access token
        $accessToken = $this->generateAccessToken($user);

        return [
            'success' => true,
            'access_token' => $accessToken,
            'user' => $user->makeHidden(['password', 'two_factor_code'])
        ];
    }

    
     // Resend new 2FA code
     
    public function resend2FACode($email)
    {
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            return ['success' => false, 'error' => 'User not found'];
        }

        $code = $this->generate2FACode();
        $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        $user->two_factor_code = $code;
        $user->two_factor_expires_at = $expiresAt;
        $user->save();

        $emailSent = $this->emailService->send2FACode($user->email, $user->name, $code);

        return [
            'success' => true,
            'message' => 'New 2FA code sent to your email',
            'email_sent' => $emailSent
        ];
    }
}

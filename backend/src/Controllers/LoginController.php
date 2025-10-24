<?php

namespace App\Controllers;

use App\Models\User;
use App\Services\EmailService;

class LoginController
{
    private $emailService;

    public function __construct()
    {
        $this->emailService = new EmailService();
    }

    public function login($email, $password)
    {
        $user = User::where('email', $email)->first();

        if (!$user || !password_verify($password, $user->password)) {
            return ['success' => false, 'error' => 'Invalid credentials'];
        }

        $code = $this->generate2FACode();
        $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));

        $user->two_factor_code = $code;
        $user->two_factor_expires_at = $expiresAt;
        $user->save();

        $emailSent = $this->emailService->send2FACode($user->email, $user->name, $code);

        return [
            'success' => true,
            'requires_2fa' => true,
            'message' => 'Please check your email for the 2FA verification code',
            'email_sent' => $emailSent,
            
        ];
    }

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

        $user->two_factor_code = null;
        $user->two_factor_expires_at = null;
        $user->save();

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $_SESSION['user_id'] = $user->id;
        $_SESSION['user_email'] = $user->email;

        $accessToken = $this->generateAccessToken($user);

        return [
            'success' => true,
            'access_token' => $accessToken,
            'user' => $user->makeHidden(['password', 'two_factor_code']),
            'user_id' => $user->id
        ];
    }

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

    private function generate2FACode()
    {
        return sprintf('%06d', random_int(100000, 999999));
    }

    private function generateAccessToken($user)
    {
        $payload = [
            'user_id' => $user->id,
            'email' => $user->email,
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24) 
        ];

        return base64_encode(json_encode($payload));
    }

    public function check()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (isset($_SESSION['user_id'])) {
            return User::find($_SESSION['user_id']);
        }

        if (isset($_COOKIE['remember_token'])) {
            $user = User::where('remember_token', $_COOKIE['remember_token'])->first();
            if ($user) {
                $_SESSION['user_id'] = $user->id;
                $_SESSION['user_email'] = $user->email;
                return $user;
            }
        }

        return null;
    }

    public function logout()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        session_unset();
        session_destroy();

        setcookie('remember_token', '', time() - 3600, "/");

        return ['success' => true, 'message' => 'Logged out successfully'];
    }
}
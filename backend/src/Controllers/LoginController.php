<?php

namespace backend\src\Controllers;

use backend\src\Models\User;

class LoginController
{
    /**
     * Handle user login
     */
    public function login($email, $password, $remember = false)
    {
        $user = User::where('email', $email)->first();

        if ($user && password_verify($password, $user->password)) {
            
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            
            $_SESSION['user_id'] = $user->id;
            $_SESSION['user_email'] = $user->email;

            
            if ($remember) {
                $token = bin2hex(random_bytes(16)); // Generate random token
                setcookie('remember_token', $token, time() + (86400 * 30), "/"); // 30 days

                
                $user->remember_token = $token;
                $user->save();
            }

            return $user;
        }

        return null;
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
    }
}

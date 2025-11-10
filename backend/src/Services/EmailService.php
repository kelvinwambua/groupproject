<?php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    private $smtp_host = 'smtp.gmail.com';
    private $smtp_port = 587;
    private $smtp_username = 'zshkelvin@gmail.com';
    private $smtp_password = 'ssmb otzl srtn kavv';
    private $from_email = 'zshkelvin@gmail.com';
    private $from_name = 'Brand';

    public function send2FACode($email, $name, $code)
    {
        try {
            $mail = new PHPMailer(true);
            
            $mail->isSMTP();
            $mail->Host = $this->smtp_host;
            $mail->SMTPAuth = true;
            $mail->Username = $this->smtp_username;
            $mail->Password = $this->smtp_password;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $this->smtp_port;

            $mail->setFrom($this->from_email, $this->from_name);
            $mail->addAddress($email, $name);

            $mail->isHTML(true);
            $mail->Subject = 'Your 2FA Verification Code';
            $mail->Body = $this->get2FAEmailTemplate($name, $code);

            $mail->send();
            return true;
            
        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            return false;
        }
    }

    private function get2FAEmailTemplate($name, $code)
    {
        return "
        <html>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <h2 style='color: #2c3e50; text-align: center;'>Your Verification Code</h2>
                
                <p>Hello " . htmlspecialchars($name) . ",</p>
                
                <p>You are attempting to log in to your account. Please use the following verification code:</p>
                
                <div style='background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;'>
                    <h1 style='color: #2c3e50; font-size: 32px; letter-spacing: 8px; margin: 0;'>" . $code . "</h1>
                </div>
                
                <p><strong>This code will expire in 10 minutes.</strong></p>
                
                <p>If you did not request this code, please ignore this email and ensure your account is secure.</p>
                
                <hr style='border: none; border-top: 1px solid #eee; margin: 30px 0;'>
                
                <p style='color: #666; font-size: 12px; text-align: center;'>
                    This is an automated message, please do not reply to this email.
                </p>
            </div>
        </body>
        </html>
        ";
    }
    public function sendEmail($toEmail, $toName, $subject, $body)
    {
        try {
            $mail = new PHPMailer(true);
            
            $mail->isSMTP();
            $mail->Host = $this->smtp_host;
            $mail->SMTPAuth = true;
            $mail->Username = $this->smtp_username;
            $mail->Password = $this->smtp_password;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $this->smtp_port;

            $mail->setFrom($this->from_email, $this->from_name);
            $mail->addAddress($toEmail, $toName);

            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $body;

            $mail->send();
            return true;
            
        } catch (Exception $e) {
            error_log("Email sending failed: " . $e->getMessage());
            return false;
        }
    }
}
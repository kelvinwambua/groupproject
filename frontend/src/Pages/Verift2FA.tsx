import React, { useState, useEffect } from "react";
import { Button } from "../Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Components/ui/card";
import { Label } from "../Components/ui/label";
import { Alert, AlertDescription } from "../Components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "../Components/ui/input-otp";

export default function Verify2FA() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        const storedEmail = localStorage.getItem('verify_email');
        if (!storedEmail) {
            window.location.href = "/login";
            return;
        }
        setEmail(storedEmail);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!code || code.length !== 6) {
            setError("Please enter a valid 6-digit code.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("http://localhost:8000/api/verify-2fa", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('userId', data.user_id);
                localStorage.removeItem('verify_email');
                window.location.href = "/";
            } else {
                setError(data.error || "Verification failed");
                setIsLoading(false);
            }
        } catch (err) {
            setError("Network error. Please try again.");
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setError("");

        try {
            const res = await fetch("http://localhost:8000/api/resend-2fa", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            
            if (!res.ok || !data.success) {
                setError(data.error || "Failed to resend code");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        }
        
        setIsResending(false);
    };

    const handleBackToLogin = () => {
        localStorage.removeItem('verify_email');
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Verify your identity</h1>
                    <p className="text-muted-foreground">We've sent a code to {email}</p>
                </div>

                <Card className="border-0 shadow-2xl">
                    <CardHeader className="space-y-1 pb-8">
                        <CardTitle className="text-2xl font-bold text-center">Enter 2FA Code</CardTitle>
                        <CardDescription className="text-center">
                            Enter the 6-digit code from your email
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Verification Code</Label>
                                <div className="flex justify-center">
                                    <InputOTP 
                                        maxLength={6} 
                                        value={code}
                                        onChange={setCode}
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                        </InputOTPGroup>
                                        <InputOTPSeparator />
                                        <InputOTPGroup>
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button 
                                type="submit" 
                                className="w-full" 
                                disabled={isLoading || code.length !== 6}
                            >
                                {isLoading ? "Verifying..." : "Verify Code"}
                            </Button>
                        </form>

                        <div className="space-y-4">
                            <div className="text-center text-sm">
                                <span className="text-muted-foreground">Didn't receive the code? </span>
                                <Button 
                                    variant="link" 
                                    className="px-0 font-normal h-auto"
                                    onClick={handleResend}
                                    disabled={isResending}
                                >
                                    {isResending ? "Sending..." : "Resend"}
                                </Button>
                            </div>

                            <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={handleBackToLogin}
                            >
                                Back to Login
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
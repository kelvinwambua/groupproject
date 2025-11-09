import { ShoppingCart, X, Plus, Minus, Loader2 } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {useNavigate} from "react-router-dom";


interface Product {
    id: number;
    name: string;
    price: string;
    image_url: string;
}

interface CartItem {
    id: number;
    cart_id: number;
    product_id: number;
    quantity: number;
    product: Product;
}

interface CartData {
    id: number;
    user_id: number;
    status: 'active' | 'completed';
    cart_items: CartItem[];
}



export default function Cart() {
    const BASE_URL = "http://localhost:8000/api/users";
    const navigate = useNavigate();

    const [userIdState, setUserIdState] = useState<string | null>(null);
    const [cartData, setCartData] = useState<CartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

    const fetchCart = useCallback(async (currentUserId: string) => {
        setLoading(true);
        try {
        const response = await fetch(`${BASE_URL}/${currentUserId}/cart`);
        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        setCartData(data);

        } catch (err: any) {
        console.error("Error fetching cart data:", err);
        setError(`Could not load cart data: ${err.message || 'Please try again.'}`);
        setCartData(null);
        } finally {
        setLoading(false);
        }
    }, [BASE_URL]);

    useEffect(() => {
        const storedId = localStorage.getItem("userId");

        if (storedId) {
        setUserIdState(storedId);
        } else {
        setError("User ID not found. Please log in.");
        setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userIdState) {
        fetchCart(userIdState);
        }
    }, [userIdState, fetchCart]);

    const handleAction = async (method: string, endpoint: string, body?: any) => {
        if (!userIdState) return;

        setIsActionLoading(true);
        setError(null);

        try {
        const response = await fetch(`${BASE_URL}/${userIdState}/cart${endpoint}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API error! Status: ${response.status}`);
        }

           
        await fetchCart(userIdState);

        } catch (err: any) {
        console.error(err);
        setError(`Action failed: ${err.message}`);
        } finally {
        setIsActionLoading(false);
        }
    };

    const handleQuantityChange = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 0) return;

        if (newQuantity === 0) {
        
        await handleRemoveItem(itemId);
        } else {
        await handleAction('PUT', '', { cart_item_id: itemId, quantity: newQuantity });
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        await handleAction('DELETE', `/${itemId}`);
    };

    const { totalItems, totalPrice } = useMemo(() => {
        if (!cartData || cartData.cart_items.length === 0) {
        return { totalItems: 0, totalPrice: 0 };
        }

        const total = cartData.cart_items.reduce((acc, item) => {
        const itemPrice = parseFloat(item.product?.price || '0');
        return acc + item.quantity * itemPrice;
        }, 0);

        const count = cartData.cart_items.reduce((acc, item) => acc + item.quantity, 0);

        return { totalItems: count, totalPrice: parseFloat(total.toFixed(2)) };
    }, [cartData]);

    if (loading) {
        return (
        <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span className="text-xl font-medium">Loading Cart...</span>
        </div>
        );
    }

    if (error) {
        return (
        <Card className="max-w-xl mx-auto mt-10 border-red-500">
            <CardHeader>
        <CardTitle className="text-red-600 flex items-center">
            ❌ Cart Error
        </CardTitle>
            </CardHeader>
            <CardContent>
        <p className="text-lg">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
        </Card>
        );
    }

    if (!cartData || cartData.cart_items.length === 0) {
        return (
        <Card className="max-w-2xl mx-auto mt-10 text-center">
            <CardHeader>
        <CardTitle className="text-3xl font-bold flex justify-center items-center">
            <ShoppingCart className="w-8 h-8 mr-3" /> Your Cart is Empty
        </CardTitle>
            </CardHeader>
            <CardContent>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Start shopping to add items to your cart.</p>
        <Button onClick={() => navigate('/')} >
            Continue Shopping
        </Button>
            </CardContent>
        </Card>
        );
    }

    return (
        <div className="container mx-auto p-4 lg:p-8">
        <h1 className="text-4xl font-bold mb-8 flex items-center">
            <ShoppingCart className="w-8 h-8 mr-3" /> Shopping Cart ({totalItems})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Cart Items Table - Takes 3/5 width */}
            <div className="lg:col-span-3">
        <Card>
            <CardHeader>
                <CardTitle>Items in Cart</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                <TableHeader>
                    <TableRow>
                <TableHead className="w-[120px]">Product</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-[150px] text-center">Quantity</TableHead>
                <TableHead className="text-right w-[100px]">Total</TableHead>
                <TableHead className="w-[60px] text-center">Remove</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cartData.cart_items.map((item) => {
                const productPrice = parseFloat(item.product?.price || '0');
                const itemTotal = productPrice * item.quantity;

                return (
                    <TableRow key={item.id} className="hover:bg-accent/50">
                        <TableCell className="font-medium">
                        <img
                            src={`http://localhost:8000${item.product.image_url}`}
                            alt={item.product?.name || 'Product Image'}
                            className="w-16 h-16 object-cover rounded-md"
                        />
                        </TableCell>
                        <TableCell>
                        <h3 className="font-semibold">{item.product?.name || 'Unknown Product'}</h3>
                        <p className="text-sm text-muted-foreground">Unit: ${productPrice.toFixed(2)}</p>
                        </TableCell>
                        <TableCell className="text-center">
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-center space-x-1">
                            <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isActionLoading}
                            >
                        <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                        type="text"
                        readOnly
                        value={item.quantity}
                        className="w-10 text-center text-sm"
                            />
                            <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={isActionLoading}
                            >
                        <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-base">
                        ${itemTotal.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isActionLoading}
                        >
                            {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                        </Button>
                        </TableCell>
                    </TableRow>
                );
                    })}
                </TableBody>
                </Table>
            </CardContent>
        </Card>
            </div>

            {/* Cart Summary - Takes 2/5 width */}
            <div className="lg:col-span-2">
        <Card className="sticky top-20">
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between text-base">
                <span>Subtotal ({totalItems} items):</span>
                <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base text-green-600">
                <span>Shipping Estimate:</span>
                <span className="font-semibold">FREE</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                <span>Order Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full text-lg py-6" onClick={() => console.log("Proceed to Checkout")} disabled={isActionLoading}>
                Proceed to Checkout
                </Button>
            </CardFooter>
        </Card>
            </div>
        </div>
        </div>
    );
}
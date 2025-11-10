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
    const [showShippingModal, setShowShippingModal] = useState<boolean>(false);
    const [shippingInfo, setShippingInfo] = useState({
        recipient_name: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: ''
    });
    const [shippingMethod, setShippingMethod] = useState<string | null>(null);
    const [shippingCost, setShippingCost] = useState<number | null>(null);
    const [shippingEtaDate, setShippingEtaDate] = useState<string | null>(null);

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

    const handleCheckout = async (shipping?: any) => {
        if (!userIdState) return alert('Please login to checkout.');

        setIsActionLoading(true);
        setError(null);

        try {
            const body: any = {};
            if (shipping) body.shipping = shipping;

            const res = await fetch(`${BASE_URL}/${userIdState}/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Checkout failed');
            }

            
            const orderId = data.order?.id ?? data.order?.id ?? null;
            if (orderId) {
                navigate(`/order-confirmation/${orderId}`);
            } else {
                
                await fetchCart(userIdState);
                alert('Checkout completed');
            }
        } catch (err: any) {
            console.error(err);
            setError(`Checkout failed: ${err.message}`);
        } finally {
            setIsActionLoading(false);
        }
    };

    const openShippingAndCheckout = () => {
      
        setShowShippingModal(true);
    };

    const submitShippingAndCheckout = async () => {
        
        if (!shippingInfo.recipient_name || !shippingInfo.line1 || !shippingInfo.city || !shippingInfo.postal_code || !shippingInfo.country) {
            setError('Please fill in all required shipping fields (name, address, city, postal code, country).');
            return;
        }

        
        try {
            const calcRes = await fetch('http://localhost:8000/api/shipping/calc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shipping: shippingInfo, subtotal: totalPrice })
            });
            const calcData = await calcRes.json();
            if (!calcRes.ok) {
                throw new Error(calcData.error || 'Failed to calculate shipping');
            }

            const method = calcData.method ?? 'Shipping';
            const cost = Number(calcData.cost ?? 0);
            const eta_date = calcData.eta_date ?? null;
            setShippingMethod(method);
            setShippingCost(cost);
            setShippingEtaDate(eta_date);

            
            const shippingWithCost = { ...shippingInfo, cost, method, eta_date };
            setShowShippingModal(false);
            await handleCheckout(shippingWithCost);
        } catch (err: any) {
            console.error('Shipping calc error', err);
            setError(`Could not calculate shipping: ${err.message}`);
        }
    };

    
    useEffect(() => {
      
        if (!showShippingModal) return;

        const keyFields = [shippingInfo.city, shippingInfo.postal_code, shippingInfo.country];
        const anyFilled = keyFields.some((f) => f && f.trim().length > 0);
        if (!anyFilled) return;

        const t = setTimeout(async () => {
            try {
                const calcRes = await fetch('http://localhost:8000/api/shipping/calc', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ shipping: shippingInfo, subtotal: totalPrice })
                });
                const calcData = await calcRes.json();
                if (!calcRes.ok) {
                    
                    console.warn('Shipping calc failed', calcData);
                    return;
                }

                const method = calcData.method ?? 'Shipping';
                const cost = Number(calcData.cost ?? 0);
                const eta_date = calcData.eta_date ?? null;
                setShippingMethod(method);
                setShippingCost(cost);
                setShippingEtaDate(eta_date);
            } catch (e) {
                console.warn('Shipping auto-calc error', e);
            }
        }, 600); 

        return () => clearTimeout(t);
    }, [shippingInfo.city, shippingInfo.postal_code, shippingInfo.country, showShippingModal, totalPrice]);

    

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
                <div className="flex flex-col gap-1">
                <div className="flex justify-between text-base text-green-600">
                    <span>Shipping Estimate:</span>
                    <span className="font-semibold">{shippingCost !== null ? `$${shippingCost.toFixed(2)}` : '—'}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Method:</span>
                    <span>{shippingMethod ?? '—'}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Est. Delivery:</span>
                    <span>{shippingEtaDate ? new Date(shippingEtaDate).toLocaleDateString() : '—'}</span>
                </div>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold">
                <span>Order Total:</span>
                <span>${(totalPrice + (shippingCost ?? 0)).toFixed(2)}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full text-lg py-6" onClick={() => openShippingAndCheckout()} disabled={isActionLoading}>
                {isActionLoading ? 'Processing...' : 'Proceed to Checkout'}
                </Button>
            </CardFooter>
        </Card>
            </div>
        </div>
            {/* Shipping modal instance */}
            <ShippingModal
                visible={showShippingModal}
                info={shippingInfo}
                setInfo={(v) => setShippingInfo(v)}
                onCancel={() => setShowShippingModal(false)}
                onSubmit={() => submitShippingAndCheckout()}
            />
        </div>
    );
}


export function ShippingModal(props: {
    visible: boolean;
    info: any;
    setInfo: (v: any) => void;
    onCancel: () => void;
    onSubmit: () => void;
}) {
    const { visible, info, setInfo, onCancel, onSubmit } = props;
    if (!visible) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Delivery Location</h3>
                <div className="space-y-2">
                    <input className="w-full p-2 border rounded" placeholder="Recipient name" value={info.recipient_name} onChange={(e) => setInfo({...info, recipient_name: e.target.value})} />
                    <input className="w-full p-2 border rounded" placeholder="Address line 1" value={info.line1} onChange={(e) => setInfo({...info, line1: e.target.value})} />
                    <input className="w-full p-2 border rounded" placeholder="Address line 2 (optional)" value={info.line2} onChange={(e) => setInfo({...info, line2: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        <input className="p-2 border rounded" placeholder="City" value={info.city} onChange={(e) => setInfo({...info, city: e.target.value})} />
                        <input className="p-2 border rounded" placeholder="State" value={info.state} onChange={(e) => setInfo({...info, state: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input className="p-2 border rounded" placeholder="Postal code" value={info.postal_code} onChange={(e) => setInfo({...info, postal_code: e.target.value})} />
                        <input className="p-2 border rounded" placeholder="Country (ISO2)" value={info.country} onChange={(e) => setInfo({...info, country: e.target.value})} />
                    </div>
                    <input className="w-full p-2 border rounded" placeholder="Phone (optional)" value={info.phone} onChange={(e) => setInfo({...info, phone: e.target.value})} />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <button className="px-4 py-2 rounded bg-gray-200" onClick={onCancel}>Cancel</button>
                    <button className="px-4 py-2 rounded bg-primary text-white" onClick={onSubmit}>Continue</button>
                </div>
            </div>
        </div>
    );
}
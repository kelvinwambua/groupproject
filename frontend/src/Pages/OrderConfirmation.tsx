import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/orders/${orderId}`);
        if (!res.ok) throw new Error('Could not load order');
        const data = await res.json();
        setOrder(data);

        // compute subtotal from items if present
        const items = data.items ?? [];
        const sub = items.reduce((acc: number, it: any) => {
          const price = parseFloat(it.price ?? it.unit_price ?? 0) || 0;
          const qty = parseInt(it.quantity ?? 0) || 0;
          return acc + price * qty;
        }, 0);
        setSubtotal(sub);

        const shipCost = parseFloat(data.shipping_cost ?? 0) || 0;
        setShippingCost(shipCost);

        // estimate delivery date based on shipping method
        const method = (data.shipping_method || '').toString().toLowerCase();
        let days = 7;
        if (method.includes('local')) days = 1;
        else if (method.includes('national')) days = 3;
        else if (method.includes('international')) days = 7;
        const est = new Date();
        est.setDate(est.getDate() + days);
        setEstimatedDelivery(est.toLocaleDateString());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Order Confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : order ? (
            <div>
              <p className="mb-4">Thank you! Your order has been placed.</p>

              {/* Order items summary */}
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="space-y-2">
                  {(order.items ?? []).map((it: any) => (
                    <div key={`${it.id}-${it.product_id}`} className="flex justify-between">
                      <div>
                        <div className="font-medium">{it.product_name ?? it.name ?? 'Product'}</div>
                        <div className="text-sm text-muted-foreground">Qty: {it.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div>${(parseFloat(it.price) || 0).toFixed(2)}</div>
                        <div className="text-sm">${(((parseFloat(it.price)||0) * (parseInt(it.quantity)||0))).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium">Shipping</h4>
                <div>Method: {order.shipping_method ?? '—'}</div>
                <div>Cost: ${shippingCost.toFixed(2)}</div>
                {estimatedDelivery && <div>Estimated delivery: {estimatedDelivery}</div>}
              </div>

              <div className="mb-4 font-semibold text-lg">
                Subtotal: ${subtotal.toFixed(2)}
                <br />
                Order Total: ${(subtotal + shippingCost).toFixed(2)}
              </div>

              {/* Shipping address display */}
              {order.shipping_address && (
                <div className="mb-4">
                  <h4 className="font-medium">Delivery Address</h4>
                  <div className="text-sm text-muted-foreground">
                    {typeof order.shipping_address === 'string' ? (() => {
                      try {
                        const s = JSON.parse(order.shipping_address);
                        return (
                          <div>
                            <div>{s.recipient_name}</div>
                            <div>{s.line1}{s.line2 ? `, ${s.line2}` : ''}</div>
                            <div>{s.city}{s.state ? `, ${s.state}` : ''} {s.postal_code}</div>
                            <div>{s.country}</div>
                            {s.phone && <div>{s.phone}</div>}
                          </div>
                        );
                      } catch (e) {
                        return <div>{order.shipping_address}</div>;
                      }
                    })() : (
                      <div>{JSON.stringify(order.shipping_address)}</div>
                    )}
                  </div>
                </div>
              )}

              <Button onClick={() => navigate('/')}>Continue Shopping</Button>
            </div>
          ) : (
            <div>
              <p>Order not found.</p>
              <Button onClick={() => navigate('/')}>Back to Home</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

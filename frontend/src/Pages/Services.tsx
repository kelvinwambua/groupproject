import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Package, ShoppingCart, Headphones, Truck, RefreshCcw, CreditCard } from "lucide-react";

export default function Services() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Our Services
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              At <strong>MyShop</strong>, we go beyond just selling products. We’re here 
              to make your entire shopping experience smooth, secure, and satisfying 
              — from browsing to delivery.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-primary" />
                Easy Online Shopping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Enjoy a seamless and user-friendly online shopping experience with 
                intuitive navigation, advanced search, and secure checkout.
              </p>
              <Badge variant="outline" className="mt-4 py-2 px-3">
                <Package className="w-4 h-4 mr-2" />
                Wide Product Selection
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Truck className="w-6 h-6 text-primary" />
                Fast & Reliable Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We partner with trusted couriers to ensure your orders arrive quickly 
                and safely — right to your doorstep.
              </p>
              <Badge variant="outline" className="mt-4 py-2 px-3">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Real-time Tracking
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Headphones className="w-6 h-6 text-primary" />
                24/7 Customer Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our friendly support team is always available to help you with 
                product inquiries, returns, and order issues.
              </p>
              <Badge variant="outline" className="mt-4 py-2 px-3">
                <CreditCard className="w-4 h-4 mr-2" />
                Secure Payment Assistance
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

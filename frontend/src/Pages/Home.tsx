import React from 'react';
import { Button } from "../Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { CheckCircle, Package, Truck, Clock, HeadphonesIcon } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center space-y-6 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Welcome to MyShop
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your one-stop shop for amazing products at unbeatable prices.
          </p>
          <Button size="lg" asChild className="text-lg px-8 py-3">
            <a href="/shop">Start Shopping</a>
          </Button>
        </header>

        <section className="mb-12">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">About Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At <strong>MyShop</strong>, we believe shopping should be easy,
                affordable, and fun. Explore a wide variety of products ranging from
                electronics to fashion and home essentials—all in one place.
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <Package className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle className="text-xl">High-Quality Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="w-full justify-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Quality Assured
                </Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Badge className="w-12 h-12 mx-auto text-primary mb-2 rounded-full flex items-center justify-center text-lg font-bold">
                  $
                </Badge>
                <CardTitle className="text-xl">Affordable Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="w-full justify-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Best Value
                </Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Truck className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle className="text-xl">Fast Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="w-full justify-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Quick Shipping
                </Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <HeadphonesIcon className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle className="text-xl">24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="w-full justify-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Always Available
                </Badge>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
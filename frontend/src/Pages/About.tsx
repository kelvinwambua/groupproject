import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { CheckCircle, Heart, Shield, Truck, DollarSign } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              About Us
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Welcome to <strong>MyShop</strong>! We are passionate about bringing
              you the best products at the best prices. From electronics and fashion
              to home essentials, we've got something for everyone.
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To make shopping simple, affordable, and enjoyable by offering a wide
                range of quality products and outstanding customer service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Our Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <Badge variant="outline" className="flex-1 justify-start py-2 px-3">
                    <Heart className="w-4 h-4 mr-2" />
                    Customer satisfaction
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <Badge variant="outline" className="flex-1 justify-start py-2 px-3">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Affordable pricing
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <Badge variant="outline" className="flex-1 justify-start py-2 px-3">
                    <Shield className="w-4 h-4 mr-2" />
                    Quality assurance
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <Badge variant="outline" className="flex-1 justify-start py-2 px-3">
                    <Truck className="w-4 h-4 mr-2" />
                    Fast and reliable delivery
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
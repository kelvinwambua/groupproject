import React, { useEffect, useState } from 'react';
import { Button } from "../Components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { ShoppingCart, Package, Star, User, TrendingUp, Sparkles } from "lucide-react";
import { Skeleton } from "../Components/ui/skeleton";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, usersRes, categoriesRes] = await Promise.all([
          fetch('http://localhost:8000/api/products'),
          fetch('http://localhost:8000/api/users'),
          fetch('http://localhost:8000/api/categories')
        ]);
        
        const productsData = await productsRes.json();
        const usersData = await usersRes.json();
        const categoriesData = await categoriesRes.json();

        
        const usersMap = usersData.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        
        const categoriesMap = categoriesData.reduce((acc, cat) => {
          acc[cat.id] = cat;
          return acc;
        }, {});

        setProducts(productsData);
        setUsers(usersMap);
        setCategories(categoriesMap);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  console.log(products)
  return (

    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">


        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Explore Products</h2>
          
            </div>
            <Badge variant="secondary" className="px-4 py-2">
              {products.length} Products
            </Badge>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
                <p className="text-muted-foreground">Check back soon for new arrivals!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 hover:border-primary/50">
                  <div className="relative overflow-hidden bg-muted">
                    {product.image_url ? (
                      <img 
                        src={`http://localhost:8000${product.image_url}`} 
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <Package className="w-20 h-20 text-muted-foreground/30" />
                      </div>
                    )}
                    {product.stock === 0 && (
                      <Badge className="absolute top-3 right-3 bg-destructive">
                        Out of Stock
                      </Badge>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                      <Badge className="absolute top-3 right-3 bg-orange-500">
                        Only {product.stock} left
                      </Badge>
                    )}
                
                  </div>
                  
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>

                    <p>Category: {product.category?.name || "Unknown"}</p>


                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>by {users[product.created_by]?.name || 'Unknown Seller'}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          ${parseFloat(product.price).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <Package className="w-3 h-3 mr-1" />
                        ID: {product.id}
                      </Badge>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="gap-2">
                    <Button 
                      className="flex-1 gap-2" 
                      disabled={product.stock === 0}
                      variant={product.stock === 0 ? "secondary" : "default"}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {product.stock === 0 ? 'Unavailable' : 'Add to Cart'}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Star className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

   
      </div>
    </div>
  );
}
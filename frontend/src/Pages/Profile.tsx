"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, MapPin, Edit, AlertCircle, Loader2 } from "lucide-react";

interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string; // Optional (not in DB schema, but good practice)
  
  // New Nullable Fields (username and bio assumed from your previous code)
    phone_number: string | null;
    address: string | null;
}

// Helper to get initials from the user's name
const getInitials = (name: string): string => {
  if (!name) return "?";
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

const API_BASE_URL = 'http://localhost:8000/api/users';

export default function Profile() {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const userId = React.useMemo(() => localStorage.getItem('userId'), []);

  const handleEditProfile = () => {
    console.log("Edit Profile clicked!");
    // Logic for opening an edit form/dialog
  };

  React.useEffect(() => {
    if (!userId) {
      setError("Authentication required: User ID not found.");
      setIsLoading(false);
      return;
    }

    const API_URL = `${API_BASE_URL}/${userId}`;

    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
           
           throw new Error(`Failed to fetch profile (Status: ${response.status})`);
        }
        
        const data = await response.json();
        const userData: User = data as User; // Type assertion
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(`Could not load profile: ${err instanceof Error ? err.message : 'Network error.'}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId]); 
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
         <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-60" />
            </div>
          </CardHeader>
          <CardContent>
             <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto my-8" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Profile Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Define fallback text for null values
  const NOT_PROVIDED = "N/A (Click Edit to provide)";
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Profile</h1>
        <Button onClick={handleEditProfile} variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Main Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          
        </CardHeader>
        <CardContent>
            <h2 className="text-2xl font-semibold mb-1">{user.name}</h2>

          {/* Contact Information */}
          <h3 className="text-lg font-semibold mb-3">Contact & Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            
            {/* Contact Details */}
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Phone:</span>
              {/* Use Nullish Coalescing Operator (??) to display fallback text */}
              <span>{user.phone_number ?? NOT_PROVIDED}</span> 
            </div>
            
            <Separator className="col-span-full my-2" />

            {/* Address Details */}
            <div className="flex items-center space-x-2 col-span-full">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Address:</span>
              <span>
                {/* Build the address line, falling back if street is null */}
                {user.address ?? NOT_PROVIDED}
                
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Additional Sections */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Role: {user.role}</CardDescription>
          </CardHeader>
        </Card>
      </div>

    </div>
  );
}
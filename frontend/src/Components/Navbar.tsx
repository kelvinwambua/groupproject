import React, { useState, useEffect } from 'react';
import { Button } from "../Components/ui/button";
import { ModeToggle } from './mode-toggle';
import { Avatar, AvatarFallback } from "../Components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../Components/ui/dropdown-menu";
import { useLocation } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

interface NavBarProps {
  links?: { name: string; path: string; variant?: 'default' | 'secondary' | 'outline' | 'ghost' }[];
}

const defaultLinks = [
  { name: 'Home', path: '/', variant: 'ghost' as const },
  { name: 'About', path: '/about', variant: 'ghost' as const },
  { name: 'Services', path: '/services', variant: 'ghost' as const },
  { name: 'Contact', path: '/contact', variant: 'ghost' as const },
];

const NavBar: React.FC<NavBarProps> = ({ links = defaultLinks }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/session', {
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.loggedIn && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('access_token');
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/';
    }
  };
  console.log(user)
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const authLinks = [
    { name: 'Login', path: '/login', variant: 'outline' as const },
    { name: 'Sign Up', path: '/signup', variant: 'default' as const }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 w-full items-center px-4 transition-all duration-300 bg-background/80 backdrop-blur-sm border-b shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold text-primary">Brand</span>
          </a>
        </div>
        
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link, index) => {
            const isActive = currentPath === link.path;
            return (
              <div key={index} className="relative">
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  size="sm" 
                  className={`
                    transition-all duration-200 hover:bg-accent/50 
                    ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'hover:text-foreground/80'}
                  `}
                  asChild
                >
                  <a href={link.path}>{link.name}</a>
                </Button>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-4 bg-primary rounded-full" />
                )}
              </div>
            );
          })}
        </nav>
        
        <div className="flex items-center gap-2">
          <ModeToggle />
          
          {loading ? (
            <div className="w-8 h-8 animate-pulse bg-muted rounded-full"></div>
          ) : isAuthenticated && user ? (
            <>
            <Button >
              <a href="/sell-item">Sell Item</a>
            </Button>
            {
              user.role === 'admin' && (
                <>
                <Button >
                  <a href="/users">Manage Users</a>
                </Button>
                <Button>
                  <a href="/admin/add-product">Add Product</a>
                </Button>
                </>
              )
            }
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="flex flex-col items-start">
                  <div className="font-medium">{user.name || 'User'}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            authLinks.map((link, index) => (
              <Button 
                key={index} 
                variant={link.variant} 
                size="sm" 
                className="transition-all duration-200 hover:scale-105 hover:shadow-sm"
                asChild
              >
                <a href={link.path}>{link.name}</a>
              </Button>
              
            ))
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
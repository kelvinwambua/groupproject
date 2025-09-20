import React from 'react';
import { Button } from "../Components/ui/button";
import { ModeToggle } from './mode-toggle';
import { useLocation } from 'react-router-dom';

interface NavBarProps {
  links?: { name: string; path: string; variant?: 'default' | 'secondary' | 'outline' | 'ghost' }[];
}

const defaultLinks = [
  { name: 'Home', path: '/', variant: 'ghost' as const },
  { name: 'About', path: '/about', variant: 'ghost' as const },
  { name: 'Services', path: '/services', variant: 'ghost' as const },
  { name: 'Contact', path: '/contact', variant: 'ghost' as const },
  { name: 'Login', path: '/login', variant: 'outline' as const },
  { name: 'Sign Up', path: '/signup', variant: 'default' as const }
];

const NavBar: React.FC<NavBarProps> = ({ links = defaultLinks }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 w-full items-center px-4 transition-all duration-300 bg-background/80 backdrop-blur-sm border-b shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold text-primary">Brand</span>
          </a>
        </div>
        
        <nav className="hidden md:flex items-center gap-1">
          {links.slice(0, -2).map((link, index) => {
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
          {links.slice(-2).map((link, index) => (
            <Button 
              key={index} 
              variant={link.variant} 
              size="sm" 
              className="transition-all duration-200 hover:scale-105 hover:shadow-sm"
              asChild
            >
              <a href={link.path}>{link.name}</a>
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
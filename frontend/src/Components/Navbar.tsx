import React from 'react';
import { cn } from "../lib/utils";
import {
  NavigationMenu,

  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,

} from "../Components/ui/navigation-menu";

interface NavBarProps {
  links?: { name: string; path: string }[];
}

const defaultLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'Login', path: '/login' },
  { name: 'Sign Up', path: '/signup' }
];

const NavBar: React.FC<NavBarProps> = ({ links = defaultLinks }) => {
  return (
    <NavigationMenu className="max-w-full">
      <NavigationMenuList className="flex space-x-1">
        {links.map((link, index) => (
          <NavigationMenuItem key={index}>
            <NavigationMenuLink
              href={link.path}
              className={cn(
                "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
              )}
            >
              {link.name}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavBar;
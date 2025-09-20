import React from 'react';
import '../assets/Navbar.css';

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
        <nav className='navbar'>
            
                {links.map((link) => (
                    
                        <a
                            href={link.path} className='nav-links'                           
                        >
                            {link.name}
                        </a>
                    
                ))}
            
        </nav>
    );
};

export default NavBar;
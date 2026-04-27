import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.email
        ? user.email.substring(0, 2).toUpperCase()
        : '??';

    const candidateLinks = [
        { to: '/jobs', label: 'Find Jobs' },
        { to: '/my-applications', label: 'My Applications' },
        { to: '/profile', label: 'Profile' },
    ];

    const recruiterLinks = [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/recruiter/jobs', label: 'Manage Jobs' },
        { to: '/profile', label: 'Profile' },
    ];

    const links = user?.role === 'RECRUITER' ? recruiterLinks : candidateLinks;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border-light dark:border-border-dark bg-white/95 dark:bg-card-dark/95 backdrop-blur-sm px-4 lg:px-10 py-3">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-4 text-text-main-light dark:text-text-main-dark no-underline">
                    <div className="size-8 text-primary">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">TalentLens</h2>
                </Link>

                {/* Navigation Links (Desktop) */}
                <div className="hidden lg:flex flex-1 justify-end gap-8 items-center">
                    <nav className="flex items-center gap-8">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    `text-sm leading-normal transition-colors no-underline ${isActive
                                        ? 'text-primary font-bold'
                                        : 'text-text-secondary-light dark:text-text-secondary-dark font-medium hover:text-text-main-light'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Profile & Sign Out */}
                    <div className="flex items-center gap-3 pl-4 border-l border-border-light dark:border-border-dark">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {initials}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex h-9 px-4 items-center justify-center rounded-lg border border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-text-main-light dark:text-text-main-dark text-sm font-bold transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Icon */}
                <button className="lg:hidden text-text-main-light dark:text-text-main-dark">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;

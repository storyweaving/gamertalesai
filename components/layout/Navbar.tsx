
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CockpitView, ToastType } from '../../types';

const NavItem = ({ label, icon, view, activeView, setView }: { label: string, icon: React.ReactNode, view: CockpitView, activeView: CockpitView, setView: (view: CockpitView) => void }) => {
  const isActive = activeView === view;
  return (
    <button
      onClick={() => setView(view)}
      className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors duration-200 flex-shrink-0 ${
        isActive
          ? 'bg-teal-200 text-teal-800 dark:bg-teal-600 dark:text-white'
          : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const Navbar: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);
    
    const handleNavClick = (view: CockpitView) => {
        if (!state.session) {
            dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'auth' });
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Please create an account or log in to continue.', type: ToastType.Info } });
            setIsMenuOpen(false);
            return;
        }
        const newView = state.cockpitView === view ? null : view;
        dispatch({ type: 'SET_COCKPIT_VIEW', payload: newView });
        setIsMenuOpen(false);
    };

    const navItems: { label: string; icon: React.ReactNode; view: CockpitView }[] = [
        { label: 'Profile', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>, view: 'profile' },
        { label: 'Chapters', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>, view: 'chapters' },
        { label: 'Pictures', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, view: 'pictures' },
        { label: 'CC', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1H3zm2.293 4.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L6.586 10 5.293 8.707a1 1 0 010-1.414zM10 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>, view: 'commandCenter'},
        { label: 'Menu', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>, view: 'menu' },
    ];

    const getInitials = (user: typeof state.user): string => {
        if (!user) return '';
    
        const name = user.user_metadata?.name as string | undefined;
    
        if (name && name.trim()) {
            const parts = name.trim().split(/\s+/);
            if (parts.length > 1) {
                return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
            }
            return parts[0][0].toUpperCase();
        }
    
        if (user.email) {
            return user.email[0].toUpperCase();
        }
    
        return '';
    };

    const userInitials = getInitials(state.user);

  return (
    <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-4 min-w-0">
             <div className="md:hidden">
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                    aria-label="Open main menu"
                    aria-expanded={isMenuOpen}
                >
                    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
            <div className="flex-shrink-0 flex items-center space-x-2">
                <svg className="h-8 w-auto text-teal-500 dark:text-teal-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 14.4L6.34286 12L4 9.6M8.57143 18L12 6M13.7143 18L17.1429 6M17.1429 14.4L19.4857 12L17.1429 9.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:inline">GamerTalesAI.com</span>
            </div>
            <nav className="nav-scroll hidden md:flex items-center space-x-1 md:space-x-2 overflow-x-auto pb-2 -mb-2">
            {navItems.map(item => (
                <NavItem key={item.label} {...item} activeView={state.cockpitView} setView={handleNavClick} />
            ))}
            </nav>
          </div>
          <div className="flex items-center space-x-3 ml-2">
            {state.user && userInitials && (
                <div 
                    className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm select-none"
                    title={(state.user.user_metadata?.name as string) || state.user.email}
                >
                    {userInitials}
                </div>
            )}
            <button
              type="button"
              onClick={() => handleNavClick('settings')}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-white dark:focus:ring-offset-gray-800"
              aria-label="Open settings menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 md:hidden transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} id="mobile-menu">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-90" onClick={() => setIsMenuOpen(false)}></div>
            <div className="relative h-full w-64 bg-gray-800 p-4">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-white">Menu</span>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                        aria-label="Close menu"
                    >
                        <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.label}
                            onClick={() => handleNavClick(item.view)}
                            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                                state.cockpitView === item.view
                                ? 'bg-teal-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
      </div>
    </header>
  );
};

export default Navbar;

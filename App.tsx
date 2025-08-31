
import React, { useEffect, useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import MainContent from './components/layout/MainContent';
import GlassCockpit from './components/layout/GlassCockpit';
import { Toaster } from './components/ui/Toaster';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-gray-900">
    <div className="flex flex-col items-center">
      <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="mt-4 text-lg text-gray-400">Loading Your Saga...</p>
    </div>
  </div>
);

const ThemedApp = () => {
  const { state } = useAppContext();
  const [appHeight, setAppHeight] = useState('100vh');

  useEffect(() => {
    const root = window.document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const handleResize = () => {
      setAppHeight(`${window.visualViewport.height}px`);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    handleResize(); // Initial set

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);


  if (state.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{ height: appHeight }} className="flex flex-col font-sans overflow-hidden">
      <Navbar />
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden relative z-0">
        <MainContent />
        <GlassCockpit />
      </main>
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <ThemedApp />
    </AppProvider>
  );
}

export default App;
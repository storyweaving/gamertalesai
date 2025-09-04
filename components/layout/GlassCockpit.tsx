import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import GamerProfileForm from '../cockpit/MilestonesForm';
import ChapterList from '../cockpit/ChapterList';
import SettingsView from '../cockpit/MenuView';
import PicturesView from '../cockpit/PicturesView';
import CommandCenterView from '../cockpit/CommandCenterView';
import ShortTalesView from '../cockpit/ShortTalesView';
import GamerCardView from '../cockpit/GamerCardView';
import { jsPDF } from 'jspdf';
import { ToastType } from '../../types';
import Auth from '../auth/Auth';

const MainMenuView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { chapters } = state;
    const [isDownloading, setIsDownloading] = useState(false);

    const handleClose = () => {
        dispatch({ type: 'SET_COCKPIT_VIEW', payload: null });
    }

    const handleCopyEmail = () => {
        navigator.clipboard.writeText('support@gamertalesai.com');
        dispatch({ type: 'ADD_TOAST', payload: { message: 'Email copied to clipboard!', type: ToastType.Success } });
    };

    const handleDownload = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        dispatch({ type: 'ADD_TOAST', payload: { message: 'Preparing your PDF...', type: ToastType.Info } });
        
        const storyContainer = document.createElement('div');

        try {
            const doc = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                format: 'a4'
            });

            // Make the container invisible but part of the layout for robust rendering
            storyContainer.style.position = 'absolute';
            storyContainer.style.top = '0';
            storyContainer.style.left = '0';
            storyContainer.style.zIndex = '-1';
            storyContainer.style.opacity = '0.01';
            storyContainer.style.pointerEvents = 'none';
            storyContainer.style.width = `${doc.internal.pageSize.getWidth() - 80}pt`;
            storyContainer.style.fontFamily = 'Times, serif';
            storyContainer.style.fontSize = '12pt';
            storyContainer.style.lineHeight = '1.5';
            storyContainer.style.color = '#000';
            
            let fullHtmlContent = '';
            for (const [index, chapter] of chapters.entries()) {
                const title = `Chapter ${index + 1}${chapter.name ? `: ${chapter.name}` : ''}`;
                fullHtmlContent += `<h2 style="font-size: 16pt; font-family: Helvetica, sans-serif; font-weight: bold; margin-bottom: 10pt; margin-top: ${index > 0 ? '40pt' : '20pt'};">${title}</h2>`;

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = chapter.content;

                const images = tempDiv.querySelectorAll('img');
                images.forEach(img => {
                    img.style.maxWidth = '250px';
                    img.style.height = 'auto';
                    img.style.display = 'block';
                    img.style.margin = '1rem 0 1rem auto';
                    img.style.borderRadius = '0.5rem';
                    img.style.boxShadow = 'none';
                });
                
                fullHtmlContent += `<div>${tempDiv.innerHTML}</div>`;
            }
            
            storyContainer.innerHTML = fullHtmlContent;
            document.body.appendChild(storyContainer);

            // Wait for all images inside the container to fully load
            const images = Array.from(storyContainer.querySelectorAll('img'));
            const imageLoadPromises = images.map(img => new Promise((resolve, reject) => {
                if (img.complete) {
                    resolve(true);
                } else {
                    img.onload = resolve;
                    img.onerror = reject;
                }
            }));
            
            await Promise.all(imageLoadPromises);

            // Generate the PDF using a robust callback approach
            await new Promise<void>((resolve, reject) => {
                try {
                    doc.html(storyContainer, {
                        margin: [40, 40, 40, 40],
                        autoPaging: 'slice',
                        html2canvas: {
                            scale: 0.75,
                            useCORS: true,
                        },
                        callback: function(pdfDoc) {
                            try {
                                pdfDoc.save('GamerTales.pdf');
                                resolve();
                            } catch (saveError) {
                                reject(saveError);
                            }
                        }
                    });
                } catch (htmlError) {
                    reject(htmlError);
                }
            });
            
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Story downloaded as PDF.', type: ToastType.Success } });

        } catch (error: any) {
            console.error('Failed to generate PDF:', error);
            dispatch({ type: 'ADD_TOAST', payload: { message: `Could not generate PDF: ${error.message || 'An unknown error occurred.'}`, type: ToastType.Error } });
        } finally {
            if (document.body.contains(storyContainer)) {
                document.body.removeChild(storyContainer);
            }
            setIsDownloading(false);
        }
    };


    return (
        <div className="p-6 h-full flex flex-col bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
                <button onClick={handleClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="flex-grow flex flex-col">
                <ul className="space-y-4 text-gray-700 dark:text-gray-300">
                     <li className="bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <button 
                            onClick={() => dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'gamerCard' })}
                            className="w-full flex items-center justify-center space-x-2 font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-400 p-4 text-base md:p-3 md:text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 4 8H4z" /></svg>
                            <span>Build Your Gamer Card</span>
                        </button>
                    </li>
                    <li className="bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <button 
                            onClick={() => dispatch({ type: 'SET_COCKPIT_VIEW', payload: 'shortTales' })}
                            className="w-full flex items-center justify-center space-x-2 font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-400 p-4 text-base md:p-3 md:text-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            <span>Share Short Tale</span>
                        </button>
                    </li>
                    <li className="bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <button 
                            onClick={handleDownload} 
                            disabled={isDownloading}
                            className="w-full flex items-center justify-center space-x-2 font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-400 disabled:opacity-50 disabled:cursor-not-allowed p-4 text-base md:p-3 md:text-sm"
                        >
                            {isDownloading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Downloading...</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    <span>Download Story as PDF</span>
                                </>
                            )}
                        </button>
                    </li>
                    <li className="bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <button 
                            onClick={handleCopyEmail} 
                            className="w-full flex items-center justify-center space-x-2 font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-400 p-4 text-base md:p-3 md:text-sm"
                            aria-label="Copy support email to clipboard"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span>support@gamertalesai.com</span>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}

const EmptyCockpitView: React.FC = () => {
  return (
    <div className="p-6 h-full flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Glass Cockpit</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">Select an option from the navigation bar to manage your saga.</p>
    </div>
  );
};

const GlassCockpit: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { cockpitView } = state;

    const isVisibleOnMobile = !!cockpitView;

    const handleClose = () => {
        dispatch({ type: 'SET_COCKPIT_VIEW', payload: null });
    };

  const renderContent = () => {
    switch (cockpitView) {
      case 'profile':
        return <GamerProfileForm />;
      case 'chapters':
        return <ChapterList />;
      case 'pictures':
        return <PicturesView />;
      case 'commandCenter':
        return <CommandCenterView />;
      case 'settings':
        return <SettingsView />;
      case 'menu':
        return <MainMenuView />;
      case 'shortTales':
        return <ShortTalesView />;
      case 'gamerCard':
        return <GamerCardView />;
      case 'auth':
        return <Auth />;
      default:
        if (state.isLoading) return null;
        if (state.session) return <EmptyCockpitView />;
        return null;
    }
  };

  return (
      <>
        {/* Backdrop for mobile view */}
        <div
            role="button"
            tabIndex={0}
            aria-label="Close menu"
            className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 md:hidden ${isVisibleOnMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={handleClose}
            onKeyDown={(e) => e.key === 'Enter' && handleClose()}
        ></div>

        <aside className={`
            flex-shrink-0 bg-white/80 dark:bg-gray-800/70 backdrop-blur-md
            w-full max-w-sm sm:max-w-md overflow-hidden
            fixed top-0 right-0 h-full z-40
            transition-transform duration-300 ease-in-out
            ${isVisibleOnMobile ? 'translate-x-0' : 'translate-x-full'}
            md:relative md:max-w-none md:w-1/3 lg:w-1/4 md:translate-x-0 md:border-l md:border-gray-200 dark:border-gray-700
        `}>
        <div className="h-full flex flex-col">
            {/* Persistent Close Button for Mobile */}
            {isVisibleOnMobile && (
                <div className="md:hidden absolute top-14 right-3 z-50">
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full bg-black/20 dark:bg-white/20 text-white dark:text-gray-200 hover:bg-black/40 dark:hover:bg-white/40 backdrop-blur-sm"
                        aria-label="Close panel"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
            {renderContent()}
        </div>
        </aside>
    </>
  );
};

export default GlassCockpit;

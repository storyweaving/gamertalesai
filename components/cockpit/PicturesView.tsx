
import React, { useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ToastType } from '../../types';

const PicturesView: React.FC = () => {
    const { dispatch } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClose = () => {
        dispatch({ type: 'SET_COCKPIT_VIEW', payload: null });
    };

    const handleImageUpload = (file: File) => {
        if (!file.type.startsWith('image/')) {
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Please select an image file.', type: ToastType.Error } });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageSrc = e.target?.result as string;
            if (imageSrc) {
                dispatch({ type: 'REQUEST_IMAGE_INSERTION', payload: imageSrc });
                dispatch({ type: 'SET_COCKPIT_VIEW', payload: null });
            }
        };
        reader.onerror = () => {
             dispatch({ type: 'ADD_TOAST', payload: { message: 'Failed to read image file.', type: ToastType.Error } });
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
        e.target.value = '';
    };
    
    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="p-6 h-full flex flex-col bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pictures</h2>
                <button onClick={handleClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center text-center">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    aria-label="Image upload"
                />

                <div className="p-5 bg-teal-100 dark:bg-teal-900/30 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-500 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Insert an Image</h3>
                <p className="text-sm mt-1 mb-6 text-gray-500 dark:text-gray-400 max-w-xs">The image will be placed at your current cursor position in the editor.</p>

                <button
                    onClick={triggerFileSelect}
                    className="w-full max-w-xs flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    aria-label="Add a new image at cursor"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v-2a2 2 0 012-2h12a2 2 0 012 2v2m-6-4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Insert Image
                </button>
            </div>
        </div>
    );
};

export default PicturesView;
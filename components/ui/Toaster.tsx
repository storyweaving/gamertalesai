
import React, { useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ToastType } from '../../types';

const toastStyles = {
  [ToastType.Success]: 'bg-teal-500',
  [ToastType.Error]: 'bg-red-500',
  [ToastType.Info]: 'bg-sky-500',
};

const toastIcons = {
  [ToastType.Success]: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  [ToastType.Error]: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  [ToastType.Info]: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export const Toaster: React.FC = () => {
  const { state: { toasts }, dispatch } = useAppContext();

  const handleDismiss = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, [dispatch]);

  return (
    <div className="fixed bottom-5 right-5 z-[100] space-y-3 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};

interface ToastProps {
  id: number;
  message: string;
  type: ToastType;
  onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 7000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div
      className={`flex items-center text-white p-4 rounded-lg shadow-lg animate-fade-in-up ${toastStyles[type]} pointer-events-auto`}
      role="alert"
    >
      <div className="flex-shrink-0">{toastIcons[type]}</div>
      <div className="ml-3 text-sm font-medium">{message}</div>
      <button onClick={() => onDismiss(id)} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex h-8 w-8 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
        <span className="sr-only">Dismiss</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

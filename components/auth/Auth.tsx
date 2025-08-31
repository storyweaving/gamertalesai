
import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ToastType } from '../../types';

const Auth: React.FC = () => {
    const { signUp, signIn, dispatch } = useAppContext();
    const [isLogin, setIsLogin] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (isLogin) {
            try {
                const { data, error } = await signIn({ email, password });
                if (error) throw error;
                if (data.session) {
                    dispatch({ type: 'ADD_TOAST', payload: { message: `Welcome back!`, type: ToastType.Success } });
                }
            } catch (err: any) {
                // For login, Supabase errors like "Email not confirmed" are masked for better security.
                const message = 'Invalid login credentials.';
                setError(message);
                dispatch({ type: 'ADD_TOAST', payload: { message, type: ToastType.Error } });
            } finally {
                setLoading(false);
            }
        } else { // Sign Up Flow
            try {
                const { data: signUpData, error: signUpError } = await signUp({
                    email,
                    password,
                    options: { data: { name } },
                });

                if (signUpError) {
                    // Handle specific error for existing users
                    if (signUpError.message.includes('User already registered')) {
                        throw new Error('An account with this email already exists. Please log in instead.');
                    }
                    throw signUpError; // Throw other generic sign-up errors
                }

                // If signUp is successful, check if a session was created.
                // A session is null if email confirmation is required.
                if (signUpData.user && !signUpData.session) {
                    dispatch({ type: 'ADD_TOAST', payload: { message: "Account created! Please check your email to verify.", type: ToastType.Info }});
                    setIsLogin(true); // Flip to login form to encourage login after confirmation.
                } else if (signUpData.session) {
                    // This case handles auto-login if email confirmation is disabled.
                    dispatch({ type: 'ADD_TOAST', payload: { message: `Welcome ${name}! Your account is ready.`, type: ToastType.Success } });
                }

            } catch (err: any) {
                const message = err.message || 'An unexpected error occurred during sign up.';
                setError(message);
                dispatch({ type: 'ADD_TOAST', payload: { message, type: ToastType.Error } });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="p-6 h-full flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isLogin ? 'Welcome Back!' : 'Create Your Account'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {isLogin ? 'Sign in to continue your saga.' : 'Begin your epic quest today.'}
                    </p>
                </div>

                {error && (
                     <div className="p-4 text-sm text-red-200 bg-red-800/50 rounded-lg" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-800"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                        </button>
                    </div>
                </form>

                <div className="mt-2 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                        }}
                        className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300"
                    >
                        {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
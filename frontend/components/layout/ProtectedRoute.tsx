'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, accessToken, getCurrentUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have an access token
        const token = accessToken || (typeof window !== 'undefined' 
          ? localStorage.getItem('accessToken') 
          : null);

        if (!token) {
          router.push('/login');
          return;
        }

        // If authenticated in store, verify with server
        if (isAuthenticated) {
          try {
            await getCurrentUser();
            setIsAuthorized(true);
          } catch (error) {
            // Token might be invalid, redirect to login
            router.push('/login');
          }
        } else {
          // Try to get current user to verify token
          try {
            await getCurrentUser();
            setIsAuthorized(true);
          } catch (error) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, accessToken, router, getCurrentUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}




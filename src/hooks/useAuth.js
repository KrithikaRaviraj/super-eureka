import { useState, useEffect } from 'react';
import { API_URL } from '../config';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (!mounted) return;
        if (data?.authenticated && data?.user) {
          setIsLoggedIn(true);
          setUserInfo(data.user);
        } else {
          setIsLoggedIn(false);
          setUserInfo(null);
        }
      } catch (error) {
        console.error('Error loading auth session:', error);
        if (mounted) {
          setIsLoggedIn(false);
          setUserInfo(null);
        }
      }
    };

    loadAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout-any`, {
        method: 'POST',
        credentials: 'include'
      });
      setIsLoggedIn(false);
      setUserInfo(null);
    } catch (error) {
      console.error('Error during logout:', error);
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  return { isLoggedIn, userInfo, logout, setIsLoggedIn, setUserInfo };
};

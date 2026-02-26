import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadAuth = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/auth/me`, {
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
      await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/auth/logout-any`, {
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

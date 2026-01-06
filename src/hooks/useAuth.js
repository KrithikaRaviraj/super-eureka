import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    try {
      const userSession = localStorage.getItem('userSession');
      if (userSession) {
        const session = JSON.parse(userSession);
        if (Date.now() - session.loginTime < 7 * 24 * 60 * 60 * 1000) {
          setIsLoggedIn(true);
          setUserInfo(session);
        } else {
          localStorage.removeItem('userSession');
          setIsLoggedIn(false);
          setUserInfo(null);
        }
      }
    } catch (error) {
      console.error('Error reading user session:', error);
      localStorage.removeItem('userSession');
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  }, []);

  const logout = () => {
    try {
      localStorage.removeItem('userSession');
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
import React, { useEffect, createContext, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const AuthContext = createContext();

function AuthState(props) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/verifyauthexptime', {
        method: 'GET',
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (data.success && data.user) {
        setToken('authenticated');
        setRole(data.user.role || null);
        setUser(data.user);
        return data.user;
      } else {
        setToken(null);
        setRole(null);
        setUser(null);
        return null;
      }
    } catch (err) {
      setToken(null);
      setRole(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const removeToken = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    } catch (e) {
      // Ignore network errors on logout
    }
    setToken(null);
    setRole(null);
    setUser(null);
    router.push('/login');
    if (!toast.isActive('logout-toast')) {
      toast.success('Logged out successfully!', {
        toastId: 'logout-toast',
        position: 'top-left',
        autoClose: 2000,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        isAuthenticated: !!token,
        removeToken,
        setRole,
        setToken,
        setUser,
        checkAuth,
        loading,
        setLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthState;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockUsers';

interface AuthContextType {
  currentUser: UserAccount | null;
  users: UserAccount[];
  login: (email: string, password?: string) => { success: boolean; error?: string };
  switchRole: (role: UserRole) => void;
  logout: () => void;
  toggleUserStatus: (userId: string) => void;
  addUser: (userData: Omit<UserAccount, 'id' | 'createdAt'>) => UserAccount;
  updateUser: (userId: string, data: Partial<UserAccount>) => void;
  resetUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'cms_users_data';
const CURRENT_USER_KEY = 'cms_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : MOCK_USERS;
    } catch {
      return MOCK_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : MOCK_USERS[1]; // default to Receptionist (most important user in SRS)
    } catch {
      return MOCK_USERS[1];
    }
  });

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const login = (email: string, _password?: string) => {
    const trimmed = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === trimmed || u.username.toLowerCase() === trimmed);
    if (!user) {
      return { success: false, error: 'Invalid username/email or password. Please check your credentials.' };
    }
    if (user.status === 'inactive') {
      return { success: false, error: 'This account has been deactivated by administrator.' };
    }
    setCurrentUser(user);
    return { success: true };
  };

  const switchRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role && u.status === 'active');
    if (targetUser) {
      setCurrentUser(targetUser);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'inactive' : 'active';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const addUser = (userData: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const newUser: UserAccount = {
      ...userData,
      id: `USR-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = (userId: string, data: Partial<UserAccount>) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...data } : u)));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const resetUsers = () => {
    setUsers(MOCK_USERS);
    setCurrentUser(MOCK_USERS[1]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        switchRole,
        logout,
        toggleUserStatus,
        addUser,
        updateUser,
        resetUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, LoginData, SignupData, UpdateProfileData, ChangePasswordData } from "../types/auth";
import { api, authStorage } from "../services/api";

export interface PendingUpload {
  file: File;
  title: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingUpload: PendingUpload | null;
  setPendingUpload: (upload: PendingUpload | null) => void;
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<User>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authStorage.getUser());
  const [token, setToken] = useState<string | null>(() => authStorage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);

  // Initialize session and verify token on load
  useEffect(() => {
    const existingToken = authStorage.getToken();
    if (existingToken) {
      setToken(existingToken);
      api.auth
        .getCurrentUser()
        .then((fetchedUser) => {
          setUser(fetchedUser);
        })
        .catch(() => {
          // Token invalid or expired
          authStorage.clear();
          setUser(null);
          setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: LoginData): Promise<void> => {
    const response = await api.auth.login(data);
    setUser(response.user);
    setToken(response.token);
  };

  const signup = async (data: SignupData): Promise<void> => {
    const response = await api.auth.signup(data);
    setUser(response.user);
    setToken(response.token);
  };

  const logout = useCallback(() => {
    api.auth.logout();
    setUser(null);
    setToken(null);
    setPendingUpload(null);
  }, []);

  const updateProfile = async (data: UpdateProfileData): Promise<User> => {
    const updated = await api.user.updateProfile(data);
    setUser(updated);
    return updated;
  };

  const changePassword = async (data: ChangePasswordData): Promise<void> => {
    await api.user.changePassword(data);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    pendingUpload,
    setPendingUpload,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

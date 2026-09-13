import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Profile, UserRole } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TOKEN_KEY = "skillbridge_token";
const USER_KEY = "skillbridge_user";

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    fullName: string
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredUser(): Profile | null {
  try {
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser) as Profile;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

async function parseResponse(response: Response) {
  try {
    return await response.json();
  } catch {
    return {
      success: false,
      message: "Invalid server response",
    };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(getStoredUser);
  const [loading, setLoading] = useState(true);

  const saveAuth = (token: string, authenticatedUser: Profile) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const refreshProfile = async () => {
    const token = getToken();

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await parseResponse(response);

      if (!response.ok || !data.success || !data.user) {
        clearAuth();
        return;
      }

      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
    } catch {
      const storedUser = getStoredUser();

      if (storedUser) {
        setUser(storedUser);
      } else {
        clearAuth();
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshProfile();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    fullName: string
  ): Promise<{ error: string | null }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
          fullName,
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok || !data.success) {
        return {
          error: data.message || "Registration failed",
        };
      }

      if (data.token && data.user) {
        saveAuth(data.token, data.user);
      }

      return {
        error: null,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Unable to connect to the server",
      };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok || !data.success) {
        return {
          error: data.message || "Login failed",
        };
      }

      if (!data.token || !data.user) {
        return {
          error: "Login response is missing authentication data",
        };
      }

      saveAuth(data.token, data.user);

      return {
        error: null,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Unable to connect to the server",
      };
    }
  };

  const signOut = async (): Promise<void> => {
    clearAuth();
  };

  const updateProfile = async (
    updates: Partial<Profile>
  ): Promise<{ error: string | null }> => {
    const token = getToken();

    if (!token) {
      return {
        error: "Authentication required",
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await parseResponse(response);

      if (!response.ok || !data.success) {
        return {
          error: data.message || "Profile update failed",
        };
      }

      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setUser(data.user);
      }

      return {
        error: null,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Unable to connect to the server",
      };
    }
  };

  const value: AuthContextValue = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
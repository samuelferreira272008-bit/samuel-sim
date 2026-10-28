import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type AppRole = "admin" | "moderator" | "user";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  getProfile: () => Promise<Profile | null>;
  getUserRole: () => Promise<AppRole | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const getProfile = useCallback(async (): Promise<Profile | null> => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return null;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", currentUser.id)
      .single();

    return data ?? null;
  }, []);

  const getUserRole = useCallback(async (): Promise<AppRole | null> => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return null;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id)
      .single();

    return (data?.role as AppRole) ?? null;
  }, []);

  const loadUserData = useCallback(async (currentUser: User) => {
    try {
      const [profileData, roleData] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", currentUser.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", currentUser.id).single(),
      ]);
      setProfile(profileData.data ?? null);
      setRole((roleData.data?.role as AppRole) ?? null);
    } catch {
      setProfile(null);
      setRole(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadUserData(user);
  }, [user, loadUserData]);

  useEffect(() => {
    let cancelled = false;
    let initialized = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (cancelled) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Defer to avoid deadlocks; do not toggle loading after init
          setTimeout(() => {
            if (cancelled) return;
            loadUserData(newSession.user).finally(() => {
              if (!cancelled && !initialized) setLoading(false);
            });
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
          if (!initialized) setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      if (cancelled) return;
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        await loadUserData(existingSession.user);
      }
      if (!cancelled) {
        initialized = true;
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: displayName ? { display_name: displayName } : undefined,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, role, loading, signIn, signUp, signOut, getProfile, getUserRole, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

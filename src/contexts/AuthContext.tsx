import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { authService } from "@/services/authService";
import { studentService } from "@/services/studentService";
import { facultyService } from "@/services/facultyService";

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  userProfile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession().then((session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = authService.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setUserRole(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const role = await authService.getUserRole(userId);
      setUserRole(role);

      if (role === "student") {
        const studentData = await studentService.getStudentProfile(userId);
        setUserProfile(studentData);
      } else if (role === "faculty") {
        const facultyData = await facultyService.getFacultyProfile(userId);
        setUserProfile(facultyData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setUserRole(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, userRole, userProfile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

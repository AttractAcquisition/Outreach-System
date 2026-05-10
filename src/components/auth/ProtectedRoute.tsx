import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import { LoginPage } from "./LoginPage";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

import { useState, type FormEvent } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message);
    }

    setLoading(false);
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-brand grid place-items-center shadow-glow mb-4">
            <MessageSquare className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            AA Outreach Command Centre
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to continue
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 shadow-card">
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-secondary/60 border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-secondary/60 border-border"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-brand hover:opacity-90 text-primary-foreground font-semibold shadow-glow"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          Accounts are managed by your administrator.
        </p>
      </div>
    </div>
  );
}

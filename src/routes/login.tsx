import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/dashboard" });
  }, [isAuthenticated, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden" style={{ background: "var(--gradient-brand)" }}>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">Storywidget</span>
        </div>
        <div className="space-y-4 relative z-10">
          <h1 className="text-4xl font-semibold leading-tight">
            Beautiful story widgets for your website.
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Build, publish and embed Instagram-style stories anywhere. Track engagement and ship fast.
          </p>
        </div>
        <p className="text-sm text-white/60">© {new Date().getFullYear()} Storywidget Inc.</p>
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">Storywidget</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Sign in to your account</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter your credentials to access the dashboard.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            JWT auth via <code className="font-mono">localhost:3000</code>
          </p>
        </div>
      </div>
    </div>
  );
}

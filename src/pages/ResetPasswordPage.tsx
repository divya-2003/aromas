import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const validateRecoverySession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);

      const hasRecoveryType =
        hashParams.get("type") === "recovery" || searchParams.get("type") === "recovery";

      let hasValidSession = hasRecoveryType;

      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          hasValidSession = true;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        hasValidSession = true;
      }

      if (isMounted) {
        setIsValidSession(hasValidSession);
        setIsCheckingSession(false);
      }
    };

    validateRecoverySession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setIsValidSession(true);
        setIsCheckingSession(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast({ title: "Weak password", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      toast({ title: "Weak password", description: "Password must include uppercase, lowercase, and a number.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({ title: "Error", description: error.message || "Failed to reset password.", variant: "destructive" });
    } else {
      toast({ title: "Password updated!", description: "You can now sign in with your new password." });
      await supabase.auth.signOut();
      navigate("/auth");
    }

    setIsLoading(false);
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
        <Helmet>
          <title>Reset Password | Aromas</title>
          <meta name="description" content="Reset your Aromas account password securely." />
          <link rel="canonical" href="https://mobiledine-in.lovable.app/reset-password" />
        </Helmet>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground mb-2">Validating reset link...</h2>
            <p className="text-muted-foreground">Please wait a moment.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
        <Helmet>
          <title>Reset Password | Aromas</title>
          <meta name="description" content="Reset your Aromas account password securely." />
          <link rel="canonical" href="https://mobiledine-in.lovable.app/reset-password" />
        </Helmet>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground mb-2">Invalid or Expired Link</h2>
            <p className="text-muted-foreground mb-4">This password reset link is no longer valid. Please request a new one.</p>
            <Button onClick={() => navigate("/auth")} className="w-full bg-foreground text-background hover:bg-foreground/90">
              Back to Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Helmet>
        <title>Reset Password | Aromas</title>
        <meta name="description" content="Reset your Aromas account password securely." />
        <link rel="canonical" href="https://mobiledine-in.lovable.app/reset-password" />
      </Helmet>
      <div className="container py-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/auth")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="container flex flex-col items-center justify-center px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground">Aromas 🍔</h1>
            <p className="mt-2 text-muted-foreground">Set your new password</p>
          </div>

          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground mb-4">Reset Password</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">Min 8 characters with uppercase, lowercase & a number</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90" size="lg" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

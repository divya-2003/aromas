import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = "signup" | "login" | "forgot-password";

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const normalizedEmail = email.toLowerCase().trim();

    try {
      if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: `${window.location.origin}/auth?mode=reset`,
        });

        if (error) throw error;

        toast({ 
          title: "Check your email", 
          description: "We've sent you a password reset link." 
        });
        setMode("login");
      } else if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          // Use generic error message to prevent user enumeration
          toast({ 
            title: "Login failed", 
            description: "Invalid email or password. Please try again.",
            variant: "destructive"
          });
          setPassword("");
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const userName = data.user.user_metadata?.name || normalizedEmail.split("@")[0];
          login(userName, normalizedEmail);
          toast({ title: "Welcome back!", description: "You've been logged in successfully" });
          navigate("/");
        }
      } else {
        // Signup
        if (!name || !email || !password) {
          toast({ 
            title: "Missing information", 
            description: "Please fill in all fields.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        // Password validation: min 8 chars, uppercase, lowercase, and number
        if (password.length < 8) {
          toast({ 
            title: "Weak password", 
            description: "Password must be at least 8 characters long.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (!passwordRegex.test(password)) {
          toast({ 
            title: "Weak password", 
            description: "Password must include uppercase, lowercase, and a number.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });

        if (error) {
          // Handle specific error types
          let errorMessage = "Unable to create account. Please try again.";
          if (error.message?.includes("weak_password") || error.message?.includes("Password")) {
            errorMessage = "Password is too weak. Use at least 18 characters with mixed case and numbers.";
          } else if (error.message?.includes("already registered")) {
            errorMessage = "This email is already registered. Please login instead.";
          }
          
          toast({ 
            title: "Signup issue", 
            description: errorMessage,
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        toast({ title: "Account created!", description: "Please sign in to continue" });
        setMode("login");
        setPassword("");
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const getTitle = () => {
    switch (mode) {
      case "forgot-password": return "Reset Password";
      case "login": return "Welcome back!";
      default: return "Join Aromas";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "forgot-password": return "Enter your email to receive a reset link";
      case "login": return "Let's get you fed.";
      default: return "Skip the queue";
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Please wait...";
    switch (mode) {
      case "forgot-password": return "Send Reset Link";
      case "login": return "Sign In";
      default: return "Create Account";
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container py-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="container flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground">Aromas 🍔</h1>
            <p className="mt-2 text-muted-foreground">{getSubtitle()}</p>
          </div>

          {/* Form */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold text-foreground mb-4">{getTitle()}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              {mode !== "forgot-password" && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Password
                  </label>
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
                  {mode === "signup" && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Min 8 characters with uppercase, lowercase & a number
                    </p>
                  )}
                </div>
              )}

              {mode === "login" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode("forgot-password")}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {getButtonText()}
              </Button>

            </form>

            <div className="mt-6 text-center">
              {mode === "forgot-password" ? (
                <p className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="font-semibold text-primary hover:underline"
                  >
                    Back to Login
                  </button>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    className="font-semibold text-primary hover:underline"
                  >
                    {mode === "login" ? "Sign Up" : "Login"}
                  </button>
                </p>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;

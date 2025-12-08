import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { toast } from "@/hooks/use-toast";

// Helper functions for mock user storage
const getRegisteredUsers = (): Record<string, { name: string; password: string }> => {
  const users = localStorage.getItem("quickbite_users");
  return users ? JSON.parse(users) : {};
};

const saveUser = (email: string, name: string, password: string) => {
  const users = getRegisteredUsers();
  users[email.toLowerCase()] = { name, password };
  localStorage.setItem("quickbite_users", JSON.stringify(users));
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const normalizedEmail = email.toLowerCase().trim();
    const users = getRegisteredUsers();

    if (isLogin) {
      // Check if user exists
      const existingUser = users[normalizedEmail];
      
      if (!existingUser) {
        setIsLoading(false);
        toast({ 
          title: "Account not found", 
          description: "No account exists with this email. Please sign up first.",
          variant: "destructive"
        });
        setIsLogin(false); // Switch to signup mode
        return;
      }

      // Check password
      if (existingUser.password !== password) {
        setIsLoading(false);
        toast({ 
          title: "Invalid password", 
          description: "The password you entered is incorrect.",
          variant: "destructive"
        });
        return;
      }

      // Successful login
      login(existingUser.name, normalizedEmail);
      toast({ title: "Welcome back!", description: "You've been logged in successfully" });
      navigate("/");
    } else {
      // Signup flow
      if (!name || !email || !password) {
        setIsLoading(false);
        toast({ 
          title: "Missing information", 
          description: "Please fill in all fields.",
          variant: "destructive"
        });
        return;
      }

      // Check if user already exists
      if (users[normalizedEmail]) {
        setIsLoading(false);
        toast({ 
          title: "Account already exists", 
          description: "An account with this email already exists. Please sign in.",
          variant: "destructive"
        });
        setIsLogin(true); // Switch to login mode
        return;
      }

      // Password validation
      if (password.length < 6) {
        setIsLoading(false);
        toast({ 
          title: "Weak password", 
          description: "Password must be at least 6 characters long.",
          variant: "destructive"
        });
        return;
      }

      // Save new user (don't auto-login)
      saveUser(normalizedEmail, name, password);
      toast({ title: "Account created!", description: "Please sign in to continue" });
      setIsLogin(true); // Switch to login mode
      setPassword(""); // Clear password for security
    }
    
    setIsLoading(false);
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
            <h1 className="text-4xl font-bold text-foreground">QuickBite 🍔</h1>
            <p className="mt-2 text-muted-foreground">
              {isLogin ? "Welcome back! Let's get you fed." : "Join QuickBite and skip the queue"}
            </p>
          </div>

          {/* Form */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
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
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => {
                  toast({ title: "Google Auth", description: "Google authentication coming soon!" });
                }}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isLogin ? "Sign in with Google" : "Sign up with Google"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold text-primary hover:underline"
                >
                  {isLogin ? "Sign Up" : "Login"}
                </button>
              </p>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;

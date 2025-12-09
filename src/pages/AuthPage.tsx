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

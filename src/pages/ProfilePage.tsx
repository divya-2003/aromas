import { motion } from "framer-motion";
import { ArrowLeft, User, LogOut, Mail, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { userName, logout, isAuthenticated } = useApp();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  const handleLogout = () => {
    logout();
    toast({ title: "Logged out", description: "You've been logged out successfully" });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero">
        <div className="container py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="container px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md"
        >
          {/* Profile Avatar */}
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <User className="h-12 w-12 text-primary" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-foreground">{userName}</h1>
            <p className="text-muted-foreground">Student</p>
          </div>

          {/* Profile Card */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Account Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium text-foreground">{userName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{userName.toLowerCase()}@college.edu</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student Status</p>
                  <p className="font-medium text-foreground">Verified</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button with Confirmation */}
          <div className="mt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" size="lg">
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Logout from your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will need to sign in again to place orders and view your order history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;

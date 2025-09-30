import { Home, LogOut, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useNavigate, useLocation } from "react-router-dom";

export const Navbar = () => {
  const { isAuthenticated, logout, userEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleHome = () => {
    navigate("/dashboard");
  };

  const isHomePage = location.pathname === "/" || !isAuthenticated;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">E-Student</span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {userEmail}
                </span>
                {!isHomePage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleHome}
                    className="gap-2"
                  >
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">Početna</span>
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Odjavi se</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

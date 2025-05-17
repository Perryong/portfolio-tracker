
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart } from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-2" to="/">
            <span className="font-bold">Portfolio Tracker</span>
          </Link>
        </div>

        <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
          <Link to="/" className="transition-colors hover:text-foreground/80">
            Dashboard
          </Link>
          <Link to="/historical" className="transition-colors hover:text-foreground/80 flex items-center">
            <LineChart className="h-4 w-4 mr-1" />
            Historical Data
          </Link>
        </nav>

        <div className="flex items-center">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

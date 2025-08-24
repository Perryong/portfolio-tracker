import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LineChart, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/"); // Redirect to home page instead of auth page
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-2" to="/">
            <span className="font-bold">Portfolio Tracker</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          <Link to="/" className="transition-colors hover:text-foreground/80">
            Dashboard
          </Link>
          <Link to="/historical" className="transition-colors hover:text-foreground/80 flex items-center">
            <LineChart className="h-4 w-4 mr-1" />
            Historical Data
          </Link>
          <Link to="/markets" className="transition-colors hover:text-foreground/80 flex items-center">
            <LineChart className="h-4 w-4 mr-1" />
            Markets
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex-1 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="ml-4">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <nav className="flex flex-col space-y-4 mt-8">
                <Link to="/" className="text-lg font-medium transition-colors hover:text-foreground/80">
                  Dashboard
                </Link>
                <Link to="/historical" className="text-lg font-medium transition-colors hover:text-foreground/80 flex items-center">
                  <LineChart className="h-4 w-4 mr-2" />
                  Historical Data
                </Link>
                <Link to="/markets" className="text-lg font-medium transition-colors hover:text-foreground/80 flex items-center">
                  <LineChart className="h-4 w-4 mr-2" />
                  Markets
                </Link>
                {user ? (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                    <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="pt-4 border-t">
                    <Button variant="default" size="sm" onClick={() => navigate("/auth")} className="w-full">
                      Sign In
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center">
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
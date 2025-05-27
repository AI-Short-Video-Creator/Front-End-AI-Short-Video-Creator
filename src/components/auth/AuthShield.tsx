import { useUserStore } from "@/hooks/data/useAuth";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { loadUserFromLocalStorage } from "@/helpers/loadUser";
interface AuthShieldProps {
  children: React.ReactNode;
  publicRoutes?: string[];
}

const defaultPublicRoutes = ["/", "/login", "/register"];

export default function AuthShield({
  children,
  publicRoutes = defaultPublicRoutes,
}: AuthShieldProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { setUser } = useUserStore();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const isTokenValid = (token: string | null) => {
    if (!token) return false;
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.exp) return false;
      const now = Date.now() / 1000;
      return decoded.exp > now;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(undefined);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const checkAuth = () => {
      const currentPath = location.pathname;
      const isPublic = publicRoutes.includes(currentPath);

      if (token) {
        const valid = isTokenValid(token);
        setUser(loadUserFromLocalStorage());

        if (valid) {
          if (isPublic && location.pathname !== "/") {
            navigate("/", { replace: true });
            return;
          }
        } else {
          logout();
          if (!isPublic) return;
        }
      } else if (!isPublic) {
        navigate("/login", { replace: true });
        return;
      }

      setShouldRender(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return shouldRender ? <>{children}</> : null;
}

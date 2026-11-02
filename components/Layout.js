import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from './../context/AuthState';

export default function Layout({ children }) {
  const router = useRouter();
  const { token, role, loading } = useContext(AuthContext);

  useEffect(() => {
    const publicRoutes = ['/login', '/forgotpassword'];
    const adminRoutes = ['/dashboard/addteacher', '/dashboard/viewallteachers'];
    const isPublicRoute = publicRoutes.includes(router.pathname);

    if (!loading && !token && !isPublicRoute) {
      router.push("/login");
      return;
    }

    if (!loading && token && adminRoutes.includes(router.pathname)) {
      const userRole = (role || '').toLowerCase();
      if (userRole !== 'admin') {
        router.push("/");
      }
    }
  }, [router, token, role, loading]);

  return (
    <div className="h-screen relative">
      {children}
    </div>
  );
}

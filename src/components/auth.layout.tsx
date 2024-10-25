// auth.layout.tsx
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FC, PropsWithChildren, useEffect } from "react";

const AuthLayout: FC<PropsWithChildren> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session && router.isReady) {
      router.push('/');
    }
  }, [router, session])

  if (status === 'loading') {
    return <div>Loading...</div>; // Optionally, add a loading spinner or placeholder
  }

  if (!session && router.isReady) {
    return <>{children}</>;
  } else {
    return null;
  }
};

export default AuthLayout;

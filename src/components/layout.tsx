// layout.tsx
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, PropsWithChildren, useEffect } from "react";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      if (!session && status !== 'loading') {
        router.push('/auth/login');
      }
    }
  }, [router, session, status]);

  if (status === 'loading') {
    return <div>Loading...</div>; // Loading state
  }

  if (session && router.isReady) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex justify-end items-center gap-8 p-2 bg-slate-300 shadow-lg z-30">
          <Link href={'/'}>Dashboard</Link>
          <Link href={'/config'}>Configuration</Link>
          <Link href={'/registration'}>Patient Registration</Link>
          <Link href={'/treatment'}>Treatment</Link>
          <Link href={'/medical-claim'}>Medical Claim</Link>
          <Link href={'/medicines'}>Medicine Stock</Link>
          <div className="text-red-500 font-semibold cursor-pointer" onClick={() => signOut()}>Sign out</div>
        </div>
        <div className="p-2 relative flex-1">{children}</div>
      </div>
    );
  } else {
    return null;
  }
};

export default Layout;

// login.tsx
import AuthLayout from "@/components/auth.layout";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FC } from "react";

const LoginPage: FC = () => {
  return (
    <AuthLayout>
      <div className="min-h-screen bg-gray-100">
        <main className="flex justify-center items-center h-screen">
          <div className="flex flex-col gap-2">
            <div>Login:</div>
            <div>
              <button onClick={() => signIn("auth0", { redirect: false })} className="p-2 w-full bg-black hover:bg-gray-400 text-white">
                Sign in with Auth0
              </button>
            </div>
            <div>
              <Link href={'/auth/registration'} className="hover:text-red-500">Register new account</Link>
            </div>
          </div>
        </main>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
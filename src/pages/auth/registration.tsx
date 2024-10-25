import AuthLayout from "@/components/auth.layout";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import { useRef, useState } from "react";

const UserRegistrationPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = useState('');

  const registerMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage('');

      try {
        console.log("Starting registration...");
        const { status, data } = await axios.post("/api/v1/auth/register", {
          email,
          password,
        });

        console.log("Response received:", status, data);

        if (status === 200) {
          alert("Registration success");
          emailRef.current!.value = "";
          passwordRef.current!.value = "";
          setEmail("");
          setPassword("");

          router.push("/");
        }
      } catch (error) {
        console.error("Error during registration:", error);

        if (axios.isAxiosError(error)) {
          setErrorMessage(error.response?.data.error || "An unknown error occurred");
        } else {
          setErrorMessage("An unexpected error occurred");
        }
      }
    },
  });

  return (
    <AuthLayout>
      <div>
        <div>User registration</div>
        {errorMessage !== '' && <div className="text-red-500">{errorMessage}</div>}
        <div>
          <div>Email:</div>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            ref={emailRef}
            className="p-2 border-2"
          />
        </div>
        <div>
          <div>Password:</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            ref={passwordRef}
            className="p-2 border-2"
          />
        </div>
        <div>
          <button
            onClick={() => registerMutation.mutate()}
            className="p-2 w-full bg-black hover:bg-gray-400 text-white"
          >
            Register
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default UserRegistrationPage;

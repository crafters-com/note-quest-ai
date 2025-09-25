import Login from "@/components/features/auth/LoginForm/LoginForm";
import type React from "react";

const LoginPage: React.FC = () => {
  return (
    <Login
      email={""}
      password={""}
      showPassword={false}
      onSubmit={() => {}}
      onGoogleSignOn={() => {}}
    />
  );
};

export default LoginPage;
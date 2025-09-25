import SignUp from "@/components/features/auth/Signup/Signup";
import type React from "react";

const SignupPage: React.FC = () => {
  return (
    <SignUp
      fullName={""}
      email={""}
      password={""}
      confirmPassword={""}
      showPassword={false}
      showConfirmPassword={false}
      onSubmit={() => {}}
      onGoogleSignOn={() => {}}
    />
  );
};

export default SignupPage;
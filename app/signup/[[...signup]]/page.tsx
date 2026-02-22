import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0F" }}>
      <SignUp />
    </div>
  );
}
import { Suspense } from "react";
import VerificationForm from "@/components/VerificationForm";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerificationForm />
    </Suspense>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ToLoginProps {
  role: "admin"|"officer"|"citizen";
}

export default function ToLogin({ role }: ToLoginProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      
      router.refresh();
      router.push("/login");
    }
  }, [countdown, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-700">
      <div className="p-6 bg-white rounded-2xl shadow-md text-center">
        <h1 className="text-xl font-semibold mb-2 text-red-600">
          Unauthorized access
        </h1>
        <p className="text-sm">
          To access this resource, you need to login as a {role}, you'll be redirected to login in{" "}
          <span className="font-bold">{countdown}</span> seconds...
        </p>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.push("/edit");
  }, []);
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Redirecting to dashboard</h1>
        <Button size="sm" asChild>
          <Link href="/dashboard">
            <span>Go to dashboard</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

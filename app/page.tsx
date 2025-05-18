import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Link href="/auth">
        <Button>Login / Sign up</Button>
      </Link>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <header className="flex justify-between items-center py-3 px-4">
      <Link href="/" className="font-medium">
        Pulse
      </Link>
      <div className="flex gap-x-2">
        <Link href="/auth">
          <Button variant="outline">Login</Button>
        </Link>
        <Link href="/auth?mode=signup">
          <Button>Register</Button>
        </Link>
      </div>
    </header>
  );
}

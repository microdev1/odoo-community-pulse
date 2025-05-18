import { GalleryVerticalEnd } from "lucide-react";
import { AuthForm } from "@/components/auth-form";
import Link from "next/link";

export default function AuthPage({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const mode = searchParams.mode === "signup" ? "signup" : "login";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Pulse
        </Link>
        <AuthForm defaultMode={mode} />
      </div>
    </div>
  );
}

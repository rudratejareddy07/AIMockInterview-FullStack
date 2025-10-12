import { Logo } from "@/components/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
       <div className="absolute top-8 left-8">
        <Link href="/">
            <Logo />
        </Link>
       </div>
      {children}
    </div>
  );
}

"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut();
        router.push("/");
      } catch (error) {
        console.error("Error signing out:", error);
        router.push("/");
      }
    };

    performLogout();
  }, [router, signOut]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-otw-black via-gray-900 to-otw-black flex items-center justify-center p-4">
      <Card className="w-[350px] bg-white/10 backdrop-blur-md border-otw-gold/20">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-white">Logging out</CardTitle>
          <CardDescription className="text-center text-gray-300">
            Please wait while we sign you out...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-otw-gold" />
        </CardContent>
      </Card>
    </div>
  );
}

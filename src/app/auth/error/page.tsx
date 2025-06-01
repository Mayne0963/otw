'use client';

import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "You do not have permission to sign in.";
      case "Verification":
        return "The verification link is invalid or has expired.";
      case "EmailCreateAccount":
        return "Could not create your account. Please try again.";
      case "EmailSignin":
        return "Error sending the email sign in link.";
      case "CredentialsSignin":
        return "Invalid email or password.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      case "FirebaseError":
        return "Authentication service error. Please try again.";
      case "NetworkError":
        return "Network error. Please check your connection and try again.";
      case "WeakPassword":
        return "Password is too weak. Please choose a stronger password.";
      case "EmailAlreadyInUse":
        return "An account with this email already exists.";
      case "UserNotFound":
        return "No account found with this email address.";
      case "WrongPassword":
        return "Incorrect password. Please try again.";
      case "TooManyRequests":
        return "Too many failed attempts. Please try again later.";
      default:
        return "An error occurred during authentication.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-otw-black via-gray-900 to-otw-black flex items-center justify-center p-4">
      <Card className="w-[400px] bg-white/10 backdrop-blur-md border-otw-gold/20">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-400" />
          </div>
          <CardTitle className="text-2xl text-center text-white">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            {getErrorMessage(typeof error === "string" ? error : null)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <div className="flex space-x-4">
            <Link href="/signin">
              <Button className="bg-otw-gold hover:bg-otw-gold/90 text-black font-semibold">
                Try Again
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-otw-gold/20 text-white hover:bg-otw-gold/10">
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

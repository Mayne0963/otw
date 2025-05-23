"use client";

import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Icons } from "../../../components/ui/icons";
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
      case "OAuthSignin":
        return "Error in the OAuth sign in process.";
      case "OAuthCallback":
        return "Error in the OAuth callback process.";
      case "OAuthCreateAccount":
        return "Could not create OAuth provider user.";
      case "EmailCreateAccount":
        return "Could not create email provider user.";
      case "Callback":
        return "Error in the callback process.";
      case "OAuthAccountNotLinked":
        return "Email on the account already exists with different credentials.";
      case "EmailSignin":
        return "Error sending the email sign in link.";
      case "CredentialsSignin":
        return "Invalid credentials.";
      case "SessionRequired":
        return "Please sign in to access this page.";
      default:
        return "An error occurred during authentication.";
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-center">
            {getErrorMessage(typeof error === "string" ? error : null)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
          <Icons.spinner className="h-8 w-8 animate-spin" />
          <Link href="/auth/login">
            <Button>Try Again</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

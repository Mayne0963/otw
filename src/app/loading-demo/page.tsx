"use client";

import type { Metadata } from "next";
import { useState } from "react";
import { LoadingAnimation } from "../../components/ui/loading-animation";
import { LoadingOverlay } from "../../components/ui/loading-overlay";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function LoadingDemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false);

  const simulateLoading = (fullScreen = false) => {
    if (fullScreen) {
      setIsFullScreenLoading(true);
      setTimeout(() => setIsFullScreenLoading(false), 3000);
    } else {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 3000);
    }
  };

  return (
    <div className="container mx-auto py-20 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">
        OTW Loading Animations
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Small</CardTitle>
            <CardDescription>Compact loading animation</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <LoadingAnimation size="small" showText={false} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medium</CardTitle>
            <CardDescription>Standard loading animation</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <LoadingAnimation size="medium" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Large</CardTitle>
            <CardDescription>Prominent loading animation</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <LoadingAnimation size="large" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card className="relative min-h-[300px]">
          <CardHeader>
            <CardTitle>Component Loading</CardTitle>
            <CardDescription>
              Loading overlay for a specific component
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-muted-foreground">
              This content is hidden when loading
            </p>
            {isLoading && <LoadingOverlay isLoading={isLoading} />}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => simulateLoading(false)}>
              Show Component Loading
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Full Screen Loading</CardTitle>
            <CardDescription>
              Loading overlay for the entire screen
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-muted-foreground">
              Demonstrates a full-screen loading overlay
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => simulateLoading(true)}>
              Show Full Screen Loading
            </Button>
          </CardFooter>
        </Card>
      </div>

      {isFullScreenLoading && (
        <LoadingOverlay
          isLoading={isFullScreenLoading}
          fullScreen
          message="Loading your content..."
        />
      )}
    </div>
  );
}

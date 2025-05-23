"use client";

import { RewardsProvider } from "../../lib/context/RewardsContext";

export default function RewardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RewardsProvider>{children}</RewardsProvider>;
}

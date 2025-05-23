import type React from "react";
import { Providers } from "../../lib/context/Providers";

export default function RestaurantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}

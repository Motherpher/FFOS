import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FFOS — Form & Flöde Operating System",
  description: "Operational control plane for FFC, FFOS, Conducellence, UDL and future Pius integration.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "FFOS — Form & Flöde Operating System",
  description: "Operational control plane for FFC, FFOS, Conducellence, UDL and future Pius integration.",
};

const nav = [
  ["Counter", "/"],
  ["Work", "/work"],
  ["FFC", "/ffc"],
  ["Conducellence", "/conducellence"],
  ["UDL", "/udl"],
  ["Pius", "/pius"],
  ["Knowledge", "/knowledge"],
  ["System", "/system"],
] as const;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <div className="brand">
              <div className="brandMark">FF</div>
              <div>
                <strong>FFOS</strong>
                <span>Operating Environment</span>
              </div>
            </div>
            <nav>
              {nav.map(([label, href], index) => (
                <Link key={href} href={href} className="navItem">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {label}
                </Link>
              ))}
            </nav>
            <div className="sideStatus">
              <span className="dot" />
              CONTROL PLANE · BASELINE
            </div>
          </aside>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}

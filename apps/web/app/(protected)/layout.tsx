import Link from "next/link";

const nav = [
  ["Counter", "/"],
  ["Work", "/work"],
  ["ProjectHub", "/projecthub"],
  ["FFC", "/ffc"],
  ["Conducellence", "/conducellence"],
  ["UDL", "/udl"],
  ["Pius", "/pius"],
  ["Knowledge", "/knowledge"],
  ["System", "/system"],
] as const;

export default function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
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
        <div className="sideFooter">
          <div className="sideStatus"><span className="dot" />DIRECTOR · AUTHENTICATED</div>
          <form action="/api/logout" method="post"><button className="logoutButton" type="submit">Sign out</button></form>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}

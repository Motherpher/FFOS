type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") ? params.next : "/";
  const invalid = params.error === "invalid";

  return (
    <div className="loginShell">
      <section className="loginPanel">
        <p className="eyebrow">FFOS // PRIVATE CONTROL PLANE</p>
        <h1>Director access</h1>
        <p className="loginIntro">
          Authentication is required before operational state, dispatches or system rooms are exposed.
        </p>

        {invalid ? <p className="loginError">Access denied. Check credentials.</p> : null}

        <form className="loginForm" action="/api/session" method="post">
          <input type="hidden" name="next" value={next} />
          <label>
            <span>User</span>
            <input name="user" autoComplete="username" required />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button type="submit">Enter FFOS</button>
        </form>

        <p className="loginMeta">Authority class: DIRECTOR · Session: 12 hours</p>
      </section>
    </div>
  );
}

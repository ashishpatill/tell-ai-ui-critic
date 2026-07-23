import { cookies } from "next/headers";

/** Demo auth gate: cookie `tell_session=authenticated` unlocks the signed-in surface. */
export default function AccountRoute() {
  const session = cookies().get("tell_session")?.value;
  const authenticated = session === "authenticated";

  return (
    <main className="account">
      <nav className="nav">
        <a href="/">Home</a>
        <a href="/pricing">Pricing</a>
        <a href="/account">Account</a>
      </nav>
      {authenticated ? (
        <section className="cards" data-tell-auth="authenticated">
          <header className="hero" style={{ padding: "48px 24px" }}>
            <p className="pill">Signed in</p>
            <h1 style={{ fontSize: 42 }}>Welcome back, Priya ✨</h1>
            <p className="muted-a">Your workspace settings and billing live here.</p>
          </header>
          <article className="card">
            <h2>Workspace</h2>
            <p className="muted-b">Acme Analytics</p>
            <button className="button no-focus">Manage team</button>
          </article>
          <article className="card">
            <h2>Billing</h2>
            <p className="muted-c">Growth plan · renews monthly</p>
            <button className="button">Update payment</button>
          </article>
        </section>
      ) : (
        <section className="cards" data-tell-auth="anonymous">
          <header className="hero" style={{ padding: "48px 24px" }}>
            <p className="pill">Account</p>
            <h1 style={{ fontSize: 42 }}>Sign in to continue</h1>
            <p className="muted-a">
              Tell captures this anonymous gate unless a Playwright storage state supplies{" "}
              <code>tell_session=authenticated</code>.
            </p>
          </header>
          <article className="card">
            <h2>Demo login</h2>
            <p className="muted-b">Use pnpm auth:fixture to mint a disposable session cookie.</p>
            <a className="button" href="/">
              Back home
            </a>
          </article>
        </section>
      )}
    </main>
  );
}

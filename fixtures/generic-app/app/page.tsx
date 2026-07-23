export default function GenericApp() {
  return (
    <main>
      <div className="pill">Demo input — deliberately generic. Not Tell's UI.</div>
      <nav className="nav">
        <a href="#features">🚀 Features</a>
        <a href="#metrics">📊 Metrics</a>
        <a href="/pricing">💳 Pricing</a>
        <a href="/account">👤 Account</a>
        <a href="/brutalist">✨ Brutalist route</a>
      </nav>
      <header className="hero">
        <p className="pill">AI-powered analytics</p>
        <h1 style={{ fontSize: 63 }}>Ship insights faster ✨</h1>
        <p className="muted-a" style={{ fontSize: 18 }}>A beautiful dashboard for modern teams.</p>
        <a className="button no-focus" href="#features">Get started 🚀</a>
        <a className="button secondary" href="#metrics">View dashboard 📊</a>
      </header>
      <section id="features" className="cards odd-type">
        {["Automate", "Analyze", "Scale"].map((title, index) => (
          <article className="card" key={title}>
            <h2>{title} ✨</h2>
            <p className="muted-b">Everything your team needs in one place.</p>
            <p className="muted-c">Beautiful insights without the setup.</p>
            <p className="muted-d">Built for modern workflows.</p>
            <button className={index === 0 ? "button no-focus" : "button"}>Learn more</button>
          </article>
        ))}
      </section>
      <section id="metrics" className="cards">
        {["98%", "24k", "3.2x"].map((metric) => (
          <article className="card" key={metric}>
            <h2 style={{ fontSize: 41 }}>{metric}</h2>
            <p className="muted-e">Metric that looks important.</p>
          </article>
        ))}
      </section>
      <section className="mini-stats" aria-label="Extra chrome">
        {["Latency", "Uptime", "Teams", "Regions", "Exports", "Alerts"].map((label) => (
          <div className="mini-stat" key={label}>
            <p className="muted-a" style={{ fontSize: 17 }}>{label}</p>
            <p className="muted-b" style={{ fontSize: 21 }}>99.9%</p>
          </div>
        ))}
      </section>
      <section className="tag-row" aria-label="Tag chrome">
        {["Realtime", "Secure", "Fast", "Global", "Trusted", "Simple", "Modern", "Flexible", "Reliable", "Smart", "Scalable", "Open", "Synced", "Guided", "Pro", "Live", "Beta", "Core", "Edge", "Plus"].map((tag) => (
          <span className="tag" key={tag}>{tag}</span>
        ))}
      </section>
      <footer style={{ padding: 47 }}>Made with AI. Looks familiar.</footer>
    </main>
  );
}

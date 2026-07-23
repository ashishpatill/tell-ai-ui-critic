export default function PricingRoute() {
  return (
    <main className="pricing">
      <nav className="nav">
        <a href="/">Home</a>
        <a href="/pricing">Pricing</a>
        <a href="/account">Account</a>
        <a href="/brutalist">Brutalist</a>
      </nav>
      <header className="hero pricing-hero">
        <p className="pill">Plans</p>
        <h1 style={{ fontSize: 48 }}>Simple pricing ✨</h1>
        <p className="muted-a" style={{ fontSize: 17 }}>
          Pick a tier. Every AI SaaS page looks like this.
        </p>
      </header>
      <section className="cards" id="plans">
        {[
          { name: "Starter", price: "$0", cta: "Start free" },
          { name: "Growth", price: "$29", cta: "Upgrade" },
          { name: "Scale", price: "$99", cta: "Talk to sales" },
        ].map((tier, index) => (
          <article className="card pricing-card" key={tier.name}>
            <h2>{tier.name}</h2>
            <p className="muted-b" style={{ fontSize: 36 }}>
              {tier.price}
            </p>
            <p className="muted-c">Everything you need to ship faster.</p>
            <button className={index === 1 ? "button no-focus" : "button"}>{tier.cta}</button>
          </article>
        ))}
      </section>
      <footer style={{ padding: 41 }}>
        <a href="/">Back home</a>
      </footer>
    </main>
  );
}

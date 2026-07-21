import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/journey", label: "Journey" },
  { href: "/learning", label: "Learning" },
  { href: "/projects", label: "Projects" },
];

export default function SiteHeader() {
  return (
    <header className="top-nav">
      <div className="site-shell glass-card top-nav-inner">
        <Link href="/" className="brand-mark">
          <span>AL</span>
          <strong>Anthony Lab</strong>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {links.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link className="primary-btn" href="/journey">
          View Progress
        </Link>
      </div>
    </header>
  );
}

import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/learning", label: "Learning" },
  { href: "/projects", label: "Projects" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type SiteNavProps = {
  title?: string;
};

export default function SiteNav({ title = "Anthony React Lab" }: SiteNavProps) {
  return (
    <nav className="topbar card">
      <p className="brand">{title}</p>
      <div className="links">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

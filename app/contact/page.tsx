import SiteNav from "@/components/SiteNav";

export default function ContactPage() {
  return (
    <main className="shell">
      <SiteNav />

      <section className="page-card card">
        <p className="label">Contact</p>
        <h1>Get in touch</h1>
        <p>
          I am open to learning partnerships, accountability circles, and
          project feedback.
        </p>
        <p>Reach me at hello@anthonybuildlog.dev.</p>
      </section>
    </main>
  );
}

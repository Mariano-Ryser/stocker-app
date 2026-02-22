// pages/products/[slug].jsx
import { useRouter } from "next/router";
import Router from "next/router";

const productContent = {
  "business-intelligence": {
    title: "Business Intelligence",
    description: "Erhalten Sie vollständige Transparenz über Ihr Unternehmen durch strukturierte Analyse und verständliche Visualisierung Ihrer Daten. Treffen Sie fundierte Entscheidungen und steigern Sie Effizienz und Umsatz."
  },
  "analytics-reports": {
    title: "Analytics & Reports",
    description: "Erstellen Sie detaillierte Reports und Analysen, die Trends, Chancen und Risiken aufzeigen. Optimieren Sie Ihre Entscheidungen mit klaren Kennzahlen."
  },
  "automation": {
    title: "Automatisierung",
    description: "Reduzieren Sie manuelle Arbeit durch intelligente Automatisierung. Steigern Sie Effizienz, sparen Sie Zeit und verbessern Sie die Produktivität Ihrer Prozesse."
  },
  "security": {
    title: "Datensicherheit",
    description: "Schützen Sie Ihre sensiblen Daten mit modernsten Sicherheitsstandards. Zugriffskontrollen, Verschlüsselung und Compliance sorgen für maximale Sicherheit."
  }
};

export default function ProductPage() {
  const router = useRouter();
  const { slug } = router.query;

  const product = productContent[slug];

  if (!product) return <p>Produkt nicht gefunden</p>;

  return (
    <section style={{ padding: "60px 24px", maxWidth: "960px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>{product.title}</h1>
      <p style={{ fontSize: "1.125rem", lineHeight: "1.6" }}>{product.description}</p>
      <button 
        style={{ marginTop: "40px", padding: "12px 28px", borderRadius: "8px", background: "#2563eb", color: "#fff" }}
        onClick={() => Router.push("/login")}
      >
        Testversion starten
      </button>
    </section>
  );
}

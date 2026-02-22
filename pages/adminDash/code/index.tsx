import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import styles from "./EjemploPage.module.css";

/* ================= CONFIG ================= */

const FORMATOS = {
  CODE128: {
    label: "CODE 128 (Interno / ERP)",
    regex: /^.+$/,
    options: { width: 2, height: 90 },
  },
  UPC: {
    label: "UPC (USA)",
    regex: /^\d{11,12}$/,
    options: { width: 2, height: 80 },
  },
  CODE39: {
    label: "CODE 39 (Legacy)",
    regex: /^[A-Z0-9\-.\s$\/+%]+$/,
    options: { width: 2, height: 90 },
  },
};

export default function CodigoDeBarras() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const [valor, setValor] = useState("123456789012");
  const [formato, setFormato] = useState("CODE128");
  const [error, setError] = useState("");

  /* ================= LOGIC ================= */

  useEffect(() => {
    if (!svgRef.current || !valor) return;

    const config = FORMATOS[formato];

    if (!config.regex.test(valor)) {
      setError("Formato de código inválido para el tipo seleccionado");
      svgRef.current.innerHTML = "";
      return;
    }

    setError("");

    JsBarcode(svgRef.current, valor, {
      format: formato,
      lineColor: "#000",
      displayValue: true,
      fontSize: 14,
      margin: 10,
      ...config.options,
    });
  }, [valor, formato]);

  /* ================= EXPORTS ================= */

  const descargar = (blob:any, filename:any) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const descargarSVG = () => {
    const svg = svgRef.current;
    const blob = new Blob([svg.outerHTML], {
      type: "image/svg+xml;charset=utf-8",
    });
    descargar(blob, "codigo-barras.svg");
  };

  const descargarPNG = async () => {
    const canvas = await html2canvas(containerRef.current, { scale: 2 });
    canvas.toBlob((blob) => {
      descargar(blob, "codigo-barras.png");
    });
  };

  const descargarPDF = async () => {
    const canvas = await html2canvas(containerRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = 180;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 15, 30, width, height);
    pdf.save("codigo-barras.pdf");
  };

  /* ================= UI ================= */

  return (
    <div className={styles.page}>
      <h2>Barcode Generator</h2>

      <div className={styles.card}>
        <div className={styles.controls}>
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Código / SKU"
          />

          <select
            value={formato}
            onChange={(e) => setFormato(e.target.value)}
          >
            {Object.entries(FORMATOS).map(([key, cfg]) => (
              <option key={key} value={key}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div ref={containerRef} className={styles.preview}>
          <svg ref={svgRef} />
        </div>

        <div className={styles.actions}>
          <button onClick={descargarSVG}>SVG</button>
          <button onClick={descargarPNG}>PNG</button>
          <button onClick={descargarPDF}>PDF</button>
        </div>
      </div>
    </div>
  );
}

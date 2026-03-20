// dashboard/code/index.jsx
import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode"; // Esta es pequeña, podemos mantenerla
import { useBarcodeExporter } from "../../../hooks/useBarcodeExporter";
import styles from "./EjemploPage.module.css";

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
  
  const { isLoading, descargarPDF, descargarPNG } = useBarcodeExporter();

  // Efecto para generar código (jsbarcode es pequeño, ok mantenerlo)
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

  // Funciones simples - estas no pesan
  const descargar = (blob, filename) => {
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

  const handleDescargarPNG = async () => {
    if (containerRef.current) {
      await descargarPNG(containerRef.current);
    }
  };

  const handleDescargarPDF = async () => {
    if (containerRef.current) {
      await descargarPDF(containerRef.current);
    }
  };

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
          <button 
            onClick={handleDescargarPNG}
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'PNG'}
          </button>
          <button 
            onClick={handleDescargarPDF}
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'PDF'}
          </button>
        </div>
        
        {isLoading && (
          <div className={styles.loadingHint}>
            Cargando librerías de exportación...
          </div>
        )}
      </div>
    </div>
  );
}
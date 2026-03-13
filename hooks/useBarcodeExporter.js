// hooks/useBarcodeExporter.js
import { useState, useCallback } from 'react';

export const useBarcodeExporter = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfLib, setPdfLib] = useState(null);
  const [canvasLib, setCanvasLib] = useState(null);

  // Cargar librerías bajo demanda
  const loadLibraries = useCallback(async () => {
    if (pdfLib && canvasLib) return { pdfLib, canvasLib };
    
    setIsLoading(true);
    try {
      // Carga diferida de las librerías pesadas
      const [jspdfModule, html2canvasModule] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      
      setPdfLib(() => jspdfModule.default);
      setCanvasLib(() => html2canvasModule.default);
      
      return {
        pdfLib: jspdfModule.default,
        canvasLib: html2canvasModule.default
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const descargarPDF = useCallback(async (element) => {
    const { pdfLib, canvasLib } = await loadLibraries();
    
    const canvas = await canvasLib(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new pdfLib('p', 'mm', 'a4');
    const width = 180;
    const height = (canvas.height * width) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 15, 30, width, height);
    pdf.save('codigo-barras.pdf');
  }, [loadLibraries]);

  const descargarPNG = useCallback(async (element) => {
    const { canvasLib } = await loadLibraries();
    
    const canvas = await canvasLib(element, { scale: 2 });
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'codigo-barras.png';
      a.click();
      URL.revokeObjectURL(url);
    });
  }, [loadLibraries]);

  return {
    isLoading,
    descargarPDF,
    descargarPNG
  };
};
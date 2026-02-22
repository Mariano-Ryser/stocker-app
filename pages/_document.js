import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Preconnect para Google Fonts para mejorar el rendimiento */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link 
          rel="preconnect" 
          href="https://fonts.gstatic.com" 
          crossOrigin="anonymous" 
        />
        
        {/* Google Fonts - Ordenadas por prioridad */}
        {/* 1. Fuente principal que usas más */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
          key="inter-font"
        />
        
        {/* 2. Fuentes del document original */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" 
          rel="stylesheet"
          key="orbitron-font"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" 
          rel="stylesheet"
          key="inter-secondary-font"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&family=Raleway:wght@400;500;700&family=Roboto:wght@400;500;700&family=Lato:wght@400;700&family=Playfair+Display:wght@400;700&family=Open+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
          key="multi-fonts"
        />
        
        {/* Meta tags recomendados */}
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        
        {/* Favicon - Asegúrate de tenerlo */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
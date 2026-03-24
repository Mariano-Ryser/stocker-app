import React from 'react';

const Flag = ({ countryCode, size = 24, className = '', style = {} }) => {
  const FlagWrapper = ({ children }) => (
  <>
    {children}
    {/* Borde fino */}
    <rect
      x="0.25"
      y="0.25"
      width="23.5"
      height="23.5"
      fill="none"
      stroke="#3a3a3a5d"
      strokeWidth="0.5"
      vectorEffect="non-scaling-stroke"
    />
  </>
);
  const flags = {
    // 🇺🇸 Estados Unidos (Inglés)
    us: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="24" fill="#3C3B6E"/>
        <rect width="24" height="12" fill="#fff"/>
        <rect width="24" height="4" y="8" fill="#B22234"/>
        <rect width="10" height="12" fill="#3C3B6E"/>
        {[...Array(9)].map((_, i) => (
          <rect key={i} width="10" height="1" y={i * 1.5} fill="#fff"/>
        ))}
        {[...Array(6)].map((_, i) => (
          <rect key={i} width="1" height="12" x={i * 2 + 1} fill="#fff"/>
        ))}
      </svg>
    ),

 en: () => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    style={style}
  >
    {/* Fondo azul */}
    <rect width="24" height="24" fill="#012169" />

    {/* Diagonales blancas */}
    <polygon points="0,0 3,0 24,21 24,24 21,24 0,3" fill="#FFFFFF" />
    <polygon points="24,0 21,0 0,21 0,24 3,24 24,3" fill="#FFFFFF" />

    {/* Diagonales rojas */}
    <polygon points="0,0 2,0 24,22 24,24 22,24 0,2" fill="#C8102E" />
    <polygon points="24,0 22,0 0,22 0,24 2,24 24,2" fill="#C8102E" />

    {/* Cruz blanca */}
    <rect x="9" width="6" height="24" fill="#FFFFFF" />
    <rect y="9" width="24" height="6" fill="#FFFFFF" />

    {/* Cruz roja */}
    <rect x="10.5" width="3" height="24" fill="#C8102E" />
    <rect y="10.5" width="24" height="3" fill="#C8102E" />
  </svg>
),
    // 🇩🇪 Alemania (Alemán)
    de: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="8" fill="#000"/>
        <rect width="24" height="8" y="8" fill="#DD0000"/>
        <rect width="24" height="8" y="16" fill="#FFCE00"/>
      </svg>
    ),
    
    // 🇪🇸 España (Español)
es: () => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
    <rect width="24" height="9" fill="#AA151B"/>
    <rect width="24" height="12" y="7" fill="#F1BF00"/>
    <rect width="24" height="9" y="17" fill="#AA151B"/>
  </svg>
),
    
    // 🇮🇹 Italia (Italiano)
    it: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="8" height="24" fill="#009246"/>
        <rect width="8" height="24" x="8" fill="#fff"/>
        <rect width="8" height="24" x="16" fill="#CE2B37"/>
      </svg>
    ),
    
    // 🇫🇷 Francia (Francés)
    fr: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="8" height="24" fill="#002395"/>
        <rect width="8" height="24" x="8" fill="#fff"/>
        <rect width="8" height="24" x="16" fill="#ED2939"/>
      </svg>
    ),
    // tailandia (Tailandés)
th: () => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    style={style}
  >
    {/* Rojo superior */}
    <rect width="24" height="4" y="0" fill="#A51931" />
    {/* Blanco */}
    <rect width="24" height="4" y="4" fill="#FFFFFF" />
    {/* Azul central (doble altura) */}
    <rect width="24" height="8" y="8" fill="#2D2A4A" />
    {/* Blanco */}
    <rect width="24" height="4" y="16" fill="#FFFFFF" />
    {/* Rojo inferior */}
    <rect width="24" height="4" y="20" fill="#A51931" />
  </svg>
),
    
    // 🇧🇷 Brasil (Portugués)
pt: () => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    style={style}
  >
    {/* Fondo */}
    <rect x="0" y="0" width="10" height="24" fill="#006600" />
    <rect x="10" y="0" width="14" height="24" fill="#FF0000" />

    {/* Esfera armilar (simplificada y centrada correctamente) */}
    <circle cx="10" cy="12" r="4" fill="#FFD700" />
    <circle cx="10" cy="12" r="3" fill="none" stroke="#8B0000" strokeWidth="0.6" />
    <line x1="6" y1="12" x2="14" y2="12" stroke="#8B0000" strokeWidth="0.6" />
    <line x1="10" y1="8" x2="10" y2="16" stroke="#8B0000" strokeWidth="0.6" />
  </svg>
),
    
    // 🇷🇺 Rusia (Ruso)
    ru: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="8" fill="#fff"/>
        <rect width="24" height="8" y="8" fill="#0039A6"/>
        <rect width="24" height="8" y="16" fill="#D52B1E"/>
      </svg>
    ),
    
    // 🇳🇱 Países Bajos (Holandés)
    nl: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="8" fill="#AE1C28"/>
        <rect width="24" height="8" y="8" fill="#fff"/>
        <rect width="24" height="8" y="16" fill="#21468B"/>
      </svg>
    ),
    
    // 🇵🇱 Polonia (Polaco)
    pl: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="12" fill="#fff"/>
        <rect width="24" height="12" y="12" fill="#DC143C"/>
      </svg>
    ),
    
    // 🇨🇳 China (Chino)
    zh: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="24" fill="#DE2910"/>
        {/* Estrella grande */}
        <polygon 
          points="12,4 14,9 19,9 15,12 17,17 12,14 7,17 9,12 5,9 10,9" 
          fill="#FFDE00"
        />
        {/* Estrellas pequeñas */}
        <polygon 
          points="4,7 4.5,8 5.5,8 4.8,8.8 5,9.8 4,9.2 3,9.8 3.2,8.8 2.5,8 3.5,8" 
          fill="#FFDE00"
          transform="scale(0.7) translate(6, 4)"
        />
        <polygon 
          points="4,7 4.5,8 5.5,8 4.8,8.8 5,9.8 4,9.2 3,9.8 3.2,8.8 2.5,8 3.5,8" 
          fill="#FFDE00"
          transform="scale(0.7) translate(17, 2)"
        />
        <polygon 
          points="4,7 4.5,8 5.5,8 4.8,8.8 5,9.8 4,9.2 3,9.8 3.2,8.8 2.5,8 3.5,8" 
          fill="#FFDE00"
          transform="scale(0.7) translate(13, 7)"
        />
        <polygon 
          points="4,7 4.5,8 5.5,8 4.8,8.8 5,9.8 4,9.2 3,9.8 3.2,8.8 2.5,8 3.5,8" 
          fill="#FFDE00"
          transform="scale(0.7) translate(10, 7)"
        />
      </svg>
    ),
    
    // 🇯🇵 Japón (Japonés)
    ja: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
     <FlagWrapper>
        <rect width="24" height="24" fill="#fff"/>
        <circle cx="12" cy="12" r="6" fill="#BC002D"/>
     </FlagWrapper>
      </svg>
    ),
    
    // 🇰🇷 Corea del Sur (Coreano)
ko: () => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
    <rect width="24" height="24" fill="#fff"/>
    {/* Taegeuk */}


    <FlagWrapper>
      <rect width="24" height="24" fill="#fff" />
      <path
        d="M12 4a8 8 0 1 0 0 16a4 4 0 1 1 0-8a4 4 0 1 0 0-8z"
        fill="#CD2E3A"
      />
      <path
        d="M12 4a4 4 0 1 1 0 8a4 4 0 1 0 0 8a8 8 0 0 0 0-16z"
        fill="#0047A0"
      />
    </FlagWrapper>


  </svg>
),

    
    // 🇸🇦 Arabia Saudita (Árabe)
    ar: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="24" fill="#006C35"/>
        {/* Texto شهادة التوحيد (Shahada) simplificado */}
        <text 
          x="12" 
          y="14" 
          textAnchor="middle" 
          fill="#fff" 
          fontSize="10" 
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
        >
          لا إله إلا الله
        </text>
        {/* Espada */}
        <rect x="11.5" y="6" width="1" height="8" fill="#fff"/>
        <polygon points="12,4 14,6 10,6" fill="#fff"/>
      </svg>
    ),
    
    // 🇮🇱 Israel (Hebreo)
    he: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="24" fill="#fff"/>
        {/* Franjas azules */}
        <rect width="24" height="4" y="2" fill="#0038B8"/>
        <rect width="24" height="4" y="18" fill="#0038B8"/>
        {/* Estrella de David */}
        <polygon 
          points="12,8 14,11 17,11 15,14 17,17 12,15 7,17 9,14 7,11 10,11" 
          fill="#0038B8"
        />
      </svg>
    ),
    
    // 🇵🇹 Portugal (Portugués de Portugal)
    'pt-pt': () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="14" height="24" fill="#006600"/>
        <rect width="10" height="24" x="14" fill="#FF0000"/>
        {/* Escudo simplificado */}
        <circle cx="7" cy="12" r="4" fill="#FFED00"/>
        <circle cx="7" cy="12" r="3" fill="#fff"/>
        <circle cx="7" cy="12" r="2" fill="#006600"/>
        <circle cx="7" cy="12" r="1" fill="#FF0000"/>
      </svg>
    ),
    
    // 🇹🇷 Turquía (Turco)
    tr: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="24" fill="#E30A17"/>
        {/* Luna y estrella */}
        <circle cx="10" cy="12" r="6" fill="#fff"/>
        <circle cx="12" cy="12" r="5" fill="#E30A17"/>
        {/* Estrella */}
        <polygon 
          points="18,9 19,12 22,12 20,14 21,17 18,15 15,17 16,14 14,12 17,12" 
          fill="#fff"
        />
      </svg>
    ),
    
    // 🇬🇷 Grecia (Griego)
    el: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="24" fill="#0D5EAF"/>
        {/* Cruz blanca */}
        <rect x="0" y="10" width="24" height="4" fill="#fff"/>
        <rect x="10" y="0" width="4" height="24" fill="#fff"/>
        {/* Cuadrados azules alternados */}
        <rect x="0" y="0" width="10" height="10" fill="#0D5EAF"/>
        <rect x="14" y="0" width="10" height="10" fill="#0D5EAF"/>
        <rect x="0" y="14" width="10" height="10" fill="#0D5EAF"/>
        <rect x="14" y="14" width="10" height="10" fill="#0D5EAF"/>
      </svg>
    ),
    tr: () => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    style={style}
  >
    {/* Fondo rojo */}
    <rect width="24" height="24" fill="#E30A17" />

    {/* Media luna */}
    <circle cx="10" cy="12" r="6" fill="#FFFFFF" />
    <circle cx="12" cy="12" r="5" fill="#E30A17" />

    {/* Estrella */}
    <polygon
      points="16.5,12 18,15 21,15 18.5,17 19.5,20 16.5,18.2 13.5,20 14.5,17 12,15 15,15"
      fill="#FFFFFF"
    />
  </svg>
),
    
    // 🇨🇿 República Checa (Checo)
    cs: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="12" fill="#fff"/>
        <rect width="24" height="12" y="12" fill="#D7141A"/>
        {/* Triángulo azul */}
        <polygon points="0,0 12,12 0,24" fill="#11457E"/>
      </svg>
    ),
    
    // 🇭🇺 Hungría (Húngaro)
    hu: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="8" fill="#CD2A3E"/>
        <rect width="24" height="8" y="8" fill="#fff"/>
        <rect width="24" height="8" y="16" fill="#436F4D"/>
      </svg>
    ),
    
    // 🇻🇳 Vietnam (Vietnamita)
    vi: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="24" fill="#DA251D"/>
        {/* Estrella amarilla */}
        <polygon 
          points="12,4 14,9 19,9 15,12 17,17 12,14 7,17 9,12 5,9 10,9" 
          fill="#FF0"
        />
      </svg>
    ),
    
   
    // 🇸🇪 Suecia (Sueco)
    sv: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="24" fill="#006AA7"/>
        {/* Cruz amarilla */}
        <rect x="0" y="10" width="24" height="4" fill="#FECC00"/>
        <rect x="10" y="0" width="4" height="24" fill="#FECC00"/>
      </svg>
    ),
    
    // 🇳🇴 Noruega (Noruego)
    no: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="24" fill="#EF2B2D"/>
        {/* Cruz blanca con azul */}
        <rect x="0" y="10" width="24" height="4" fill="#fff"/>
        <rect x="10" y="0" width="4" height="24" fill="#fff"/>
        <rect x="0" y="11" width="24" height="2" fill="#002868"/>
        <rect x="11" y="0" width="2" height="24" fill="#002868"/>
      </svg>
    ),
    
    // 🇩🇰 Dinamarca (Danés)
    da: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="24" fill="#C60C30"/>
        {/* Cruz blanca */}
        <rect x="0" y="10" width="24" height="4" fill="#fff"/>
        <rect x="10" y="0" width="4" height="24" fill="#fff"/>
      </svg>
    ),
    hi: () => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    style={style}
  >
    {/* Franjas */}
    <rect width="24" height="8" y="0" fill="#FF9933" />
    <rect width="24" height="8" y="8" fill="#FFFFFF" />
    <rect width="24" height="8" y="16" fill="#138808" />

    {/* Ashoka Chakra */}
    <circle
      cx="12"
      cy="12"
      r="3"
      fill="none"
      stroke="#000080"
      strokeWidth="1"
    />
    <line x1="12" y1="9" x2="12" y2="15" stroke="#000080" strokeWidth="0.8" />
    <line x1="9" y1="12" x2="15" y2="12" stroke="#000080" strokeWidth="0.8" />
    <line x1="10.2" y1="10.2" x2="13.8" y2="13.8" stroke="#000080" strokeWidth="0.6" />
    <line x1="10.2" y1="13.8" x2="13.8" y2="10.2" stroke="#000080" strokeWidth="0.6" />
  </svg>
),
    // 🇫🇮 Finlandia (Finés)
    fi: () => (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
        <rect width="24" height="24" fill="#fff"/>
        {/* Cruz azul */}
        <rect x="0" y="10" width="24" height="4" fill="#003580"/>
        <rect x="10" y="0" width="4" height="24" fill="#003580"/>
      </svg>
    ),
  };
  
  const flagKey = countryCode.toLowerCase();
  const FlagComponent = flags[flagKey] || flags.us;
  
  return <FlagComponent />;
};


export default Flag;
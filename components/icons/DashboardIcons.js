import React from 'react';
// Agrega estos iconos a tu archivo de iconos
export const IconTrendingUp = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

export const IconCalendar = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export const IconDollar = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const IconPackage = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);


export const IconChart = ({ className = "", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true"
    {...props}
  >
    <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 13v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 9v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 5v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconUsers = ({ className = "", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true"
    {...props}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconBox = ({ className = "", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true"
    {...props}
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4.0a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.27 6.96L12 11l8.73-4.04" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconInvoice = ({ className = "", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 7h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

export const IconPlus = ({ className = "", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true"
    {...props}
  >
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconDocument = ({ className = "", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true"
    {...props}
  >
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
    <path d="M16 13H8" stroke="currentColor" strokeWidth="2"/>
    <path d="M16 17H8" stroke="currentColor" strokeWidth="2"/>
    <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const IconRefresh = ({ className = "", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true"
    {...props}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 16h5v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);



export const IconSettings = ({ className = "", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true"
    {...props}
  >
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const IconLogout = ({ className = "", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true"
    {...props}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconChevronRight = ({ className = "", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true"
    {...props}
  >
    <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconCheck = ({ className = "", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true"
    {...props}
  >
    <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconWarning = ({ className = "", ...props }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    aria-hidden="true"
    {...props}
  >
    <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Exportar todos los iconos como objeto por defecto también
export default {
  IconChart,
  IconUsers,
  IconBox,
  IconInvoice,
  IconPlus,
  IconDocument,
  IconRefresh,
  IconCalendar,
  IconSettings,
  IconLogout,
  IconChevronRight,
  IconCheck,
  IconWarning
};
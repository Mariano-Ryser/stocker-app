// frontend/utils/countryConfig.js
export const COUNTRY_CONFIG = {
  CH: {
    name: 'Suiza',
    currency: 'CHF',
    timezone: 'Europe/Zurich',
    dateFormat: 'DD.MM.YYYY',
    taxRate: 8.1,
    taxName: 'MWST',
    taxNameLong: 'Mehrwertsteuer',
    requiresTaxId: true,
    taxIdLabel: 'UID',
    vatLabel: 'MWST-Nr.',
    bankFields: ['bankName', 'accountHolder', 'iban', 'bic'],
    bankFieldsLabels: {
      iban: 'IBAN (21 caracteres)',
      bic: 'BIC/SWIFT'
    },
    addressFields: ['street', 'number', 'postalCode', 'city', 'country'],
    addressFormat: '{street} {number}\n{postalCode} {city}\n{country}',
    legalRequirements: {
      requiresTaxId: true,
      requiresVatId: true,
      requiresCompanyRegister: true
    },
    validateIBAN: (iban) => {
      const clean = iban.replace(/\s/g, '');
      return /^CH\d{19}$/.test(clean) && clean.length === 21;
    }
  },
  
  DE: {
    name: 'Alemania',
    currency: 'EUR',
    timezone: 'Europe/Berlin',
    dateFormat: 'DD.MM.YYYY',
    taxRate: 19,
    taxName: 'MwSt',
    taxNameLong: 'Mehrwertsteuer',
    requiresTaxId: true,
    taxIdLabel: 'Steuernummer',
    vatLabel: 'USt-IdNr.',
    bankFields: ['bankName', 'accountHolder', 'iban', 'bic'],
    bankFieldsLabels: {
      iban: 'IBAN (22 caracteres)',
      bic: 'BIC/SWIFT'
    },
    addressFields: ['street', 'number', 'postalCode', 'city', 'country'],
    addressFormat: '{street} {number}\n{postalCode} {city}\n{country}',
    legalRequirements: {
      requiresTaxId: true,
      requiresVatId: true,
      requiresCompanyRegister: true
    },
    validateIBAN: (iban) => {
      const clean = iban.replace(/\s/g, '');
      return /^DE\d{20}$/.test(clean) && clean.length === 22;
    }
  },
  
  ES: {
    name: 'España',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
    dateFormat: 'DD/MM/YYYY',
    taxRate: 21,
    taxName: 'IVA',
    taxNameLong: 'Impuesto sobre el Valor Añadido',
    requiresTaxId: true,
    taxIdLabel: 'NIF/CIF',
    vatLabel: 'NIF-IVA',
    bankFields: ['bankName', 'accountHolder', 'iban', 'bic'],
    bankFieldsLabels: {
      iban: 'IBAN (24 caracteres)',
      bic: 'BIC/SWIFT'
    },
    addressFields: ['street', 'number', 'postalCode', 'city', 'province', 'country'],
    addressFormat: '{street}, {number}\n{postalCode} {city} ({province})\n{country}',
    legalRequirements: {
      requiresTaxId: true,
      requiresVatId: true
    },
    validateIBAN: (iban) => {
      const clean = iban.replace(/\s/g, '');
      return /^ES\d{22}$/.test(clean) && clean.length === 24;
    }
  },

  AR: {
    name: 'Argentina',
    currency: 'ARS',
    timezone: 'America/Argentina/Buenos_Aires',
    dateFormat: 'DD/MM/YYYY',
    taxRate: 21,
    taxName: 'IVA',
    taxNameLong: 'Impuesto al Valor Agregado',
    requiresTaxId: true,
    taxIdLabel: 'CUIT',
    bankFields: ['bankName', 'accountHolder', 'cbu', 'alias'],
    bankFieldsLabels: {
      cbu: 'CBU (22 dígitos)',
      alias: 'Alias CBU'
    },
    addressFields: ['street', 'number', 'floor', 'apartment', 'postalCode', 'city', 'province', 'country'],
    addressFormat: '{street} {number} {floor}° {apartment}\n{postalCode} {city}, {province}\n{country}',
    legalRequirements: {
      requiresTaxId: true,
      requiresIvaCondition: true,
      requiresIngresosBrutos: true
    },
    ivaConditions: [
      { value: 'responsableInscripto', label: 'Responsable Inscripto' },
      { value: 'monotributo', label: 'Monotributista' },
      { value: 'exento', label: 'Exento' },
      { value: 'consumidorFinal', label: 'Consumidor Final' }
    ],
    validateCBU: (cbu) => {
      const clean = cbu.replace(/\s/g, '');
      return /^\d{22}$/.test(clean);
    },
    validateAlias: (alias) => {
      return /^[A-Za-z0-9]+\.[A-Za-z0-9]+\.[A-Za-z0-9]+$/.test(alias);
    }
  }
};

// Helper para obtener campos requeridos según país
export const getRequiredFieldsForCountry = (countryCode) => {
  const config = COUNTRY_CONFIG[countryCode] || COUNTRY_CONFIG.DE;
  return {
    address: config.addressFields,
    bank: config.bankFields,
    tax: Object.keys(config.legalRequirements).filter(key => config.legalRequirements[key])
  };
};

// Helper para validar según país
export const validateCountryFields = (countryCode, data) => {
  const config = COUNTRY_CONFIG[countryCode] || COUNTRY_CONFIG.DE;
  const errors = {};

  // Validar campos requeridos
  if (config.legalRequirements.requiresTaxId && !data.taxId) {
    errors.taxId = `El ${config.taxIdLabel} es obligatorio`;
  }

  if (config.legalRequirements.requiresVatId && !data.vatNumber) {
    errors.vatNumber = `El ${config.vatLabel || 'VAT ID'} es obligatorio`;
  }

  // Validaciones específicas por país
  if (countryCode === 'AR' && data.cuit) {
    const cuitRegex = /^\d{2}-\d{8}-\d$/;
    if (!cuitRegex.test(data.cuit)) {
      errors.cuit = 'El CUIT debe tener formato XX-XXXXXXXX-X';
    }
  }

  if (countryCode === 'CH' && data.iban && !config.validateIBAN(data.iban)) {
    errors.iban = 'El IBAN suizo debe tener 21 caracteres y comenzar con CH';
  }

  if (countryCode === 'DE' && data.iban && !config.validateIBAN(data.iban)) {
    errors.iban = 'El IBAN alemán debe tener 22 caracteres y comenzar con DE';
  }

  if (countryCode === 'ES' && data.iban && !config.validateIBAN(data.iban)) {
    errors.iban = 'El IBAN español debe tener 24 caracteres y comenzar con ES';
  }

  if (countryCode === 'AR' && data.cbu && !config.validateCBU(data.cbu)) {
    errors.cbu = 'El CBU debe tener 22 dígitos numéricos';
  }

  if (countryCode === 'AR' && data.alias && !config.validateAlias(data.alias)) {
    errors.alias = 'El alias debe tener formato PALABRA.PALABRA.PALABRA';
  }

  return errors;
};
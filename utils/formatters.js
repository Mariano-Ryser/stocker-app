export const formatCurrency = (decimalValue) => {
  // Si es un objeto Decimal128 (viene directamente de MongoDB)
  if (decimalValue && typeof decimalValue === 'object' && '$numberDecimal' in decimalValue) {
    return parseFloat(decimalValue.$numberDecimal).toFixed(2);
  }
  // Si ya es un string o número
  return parseFloat(decimalValue).toFixed(2);
};
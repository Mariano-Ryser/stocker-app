// services/companyCleanupService.js
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Eliminar todos los productos de una compañía
export async function deleteCompanyProducts(companyId) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/company/${companyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (error) {
    console.error('Error eliminando productos:', error);
    return { ok: false, message: error.message };
  }
}

// Eliminar todas las ventas de una compañía
export async function deleteCompanySales(companyId) {
  try {
    const res = await fetch(`${API_BASE_URL}/sales/company/${companyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (error) {
    console.error('Error eliminando ventas:', error);
    return { ok: false, message: error.message };
  }
}

// Eliminar todos los movimientos de stock de una compañía
export async function deleteCompanyStockMovements(companyId) {
  try {
    const res = await fetch(`${API_BASE_URL}/stock-movements/company/${companyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (error) {
    console.error('Error eliminando movimientos:', error);
    return { ok: false, message: error.message };
  }
}

// Eliminar todos los clientes de una compañía
export async function deleteCompanyClients(companyId) {
  try {
    const res = await fetch(`${API_BASE_URL}/clients/company/${companyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (error) {
    console.error('Error eliminando clientes:', error);
    return { ok: false, message: error.message };
  }
}

// Eliminar todos los usuarios de una compañía (excepto el CEO)
export async function deleteCompanyUsers(companyId, exceptUserId) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/company/${companyId}?except=${exceptUserId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (error) {
    console.error('Error eliminando usuarios:', error);
    return { ok: false, message: error.message };
  }
}

// Eliminar la compañía
export async function deleteCompany(companyId) {
  try {
    const res = await fetch(`${API_BASE_URL}/company/${companyId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (error) {
    console.error('Error eliminando compañía:', error);
    return { ok: false, message: error.message };
  }
}

// Eliminar TODO (función maestro)
export async function deleteEverything(companyId, exceptUserId) {
  const results = {
    products: null,
    sales: null,
    stockMovements: null,
    clients: null,
    users: null,
    company: null
  };

  try {
    // 1. Primero productos (dependencias de ventas)
    results.products = await deleteCompanyProducts(companyId);
    
    // 2. Luego ventas
    results.sales = await deleteCompanySales(companyId);
    
    // 3. Movimientos de stock
    results.stockMovements = await deleteCompanyStockMovements(companyId);
    
    // 4. Clientes
    results.clients = await deleteCompanyClients(companyId);
    
    // 5. Usuarios (excepto el actual)
    results.users = await deleteCompanyUsers(companyId, exceptUserId);
    
    // 6. Finalmente la compañía
    results.company = await deleteCompany(companyId);
    
    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Error en limpieza completa:', error);
    return {
      success: false,
      error: error.message,
      results
    };
  }
}
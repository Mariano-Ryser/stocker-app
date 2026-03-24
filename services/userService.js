// services/userService.js
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


// Función helper para obtener headers con token
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}; 
// GET all users (solo para admin/ceo)
export async function getUsers() {
  try {
    const API_URL = `${API_BASE_URL}/users`;
    // console.log('Fetching users from:', "API_URL");
  
    const res = await fetch(API_URL, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      if (res.status === 403) {
        throw new Error('No tienes permisos para ver usuarios');
      }
      
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`Error al obtener usuarios: ${res.status}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error in getUsers:', error);
    throw new Error(`Error: ${error.message}`);
  }
}
// GET user by ID
export async function getUserById(id) {
  try {
    const API_URL = `${API_BASE_URL}/users/${id}`;
    
    const res = await fetch(API_URL, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      const errorText = await res.text();
      throw new Error(`Error al obtener usuario: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw new Error(`Error: ${error.message}`);
  }
}
// UPDATE user
export async function updateUserAPI(id, userData) {
  try {
    const API_URL = `${API_BASE_URL}/users/${id}`;
    
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      if (res.status === 403) {
        throw new Error('No tienes permisos para actualizar este usuario');
      }
      
      let errorMessage = `Error ${res.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si no es JSON, usar el texto
      }
      
      throw new Error(errorMessage);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in updateUserAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}
// CHANGE user plan
export async function changeUserPlanAPI(id, plan) {
  try {
    const API_URL = `${API_BASE_URL}/users/${id}/plan`;
    
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ plan })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      if (res.status === 403) {
        throw new Error('No tienes permisos para cambiar planes');
      }
      
      let errorMessage = `Error ${res.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si no es JSON, usar el texto
      }
      
      throw new Error(errorMessage);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in changeUserPlanAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}
// CHANGE user role
export async function changeUserRoleAPI(id, role) {
  try {
    const API_URL = `${API_BASE_URL}/users/${id}/role`;
    
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      if (res.status === 403) {
        throw new Error('Solo el CEO puede cambiar roles');
      }
      
      let errorMessage = `Error ${res.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si no es JSON, usar el texto
      }
      
      throw new Error(errorMessage);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in changeUserRoleAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}
// TOGGLE user status
export async function toggleUserStatusAPI(id, isActive) {
  try {
    const API_URL = `${API_BASE_URL}/users/${id}/status`;
    
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isActive })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      if (res.status === 403) {
        throw new Error('No tienes permisos para cambiar estado');
      }
      
      let errorMessage = `Error ${res.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si no es JSON, usar el texto
      }
      
      throw new Error(errorMessage);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in toggleUserStatusAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}
// DELETE user
export async function deleteUserAPI(id) {
  try {
    const API_URL = `${API_BASE_URL}/users/${id}`;
    
    const res = await fetch(API_URL, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      if (res.status === 403) {
        throw new Error('No tienes permisos para eliminar usuarios');
      }
      
      throw new Error(`Error al eliminar usuario: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in deleteUserAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}
// UPDATE plan (ruta antigua para compatibilidad)
export async function updatePlanAPI(userId, plan) {
  try {
    const API_URL = `${API_BASE_URL}/users/update-plan`;
    
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, plan })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      let errorMessage = `Error ${res.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si no es JSON, usar el texto
      }
      
      throw new Error(errorMessage);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in updatePlanAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}
// Crear usuario en la misma empresa
export async function createCompanyUserAPI(userData) {
  try {
    const API_URL = `${API_BASE_URL}/users/company/create`;
    
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    
    // Primero intentamos parsear la respuesta como JSON
    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      // Si no es JSON, creamos un objeto de error básico
      const text = await res.text();
      data = {
        ok: false,
        message: text || 'Error desconocido'
      };
    }
    
    // Si la respuesta no es ok (2xx), NO lanzamos un Error
    // En lugar de eso, retornamos el objeto con la información de error
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return {
          ok: false,
          message: 'No autorizado',
          requiresLogin: true
        };
      }
      
      return {
        ok: false,
        message: data.message || `Error ${res.status}`,
        status: res.status,
        data: data
      };
    }
    
    // Si es exitoso, retornamos los datos
    return {
      ok: true,
      ...data
    };
    
  } catch (error) {
    console.error('Error in createCompanyUserAPI:', error);
    // Para errores de red, también retornamos un objeto en lugar de lanzar Error
    return {
      ok: false,
      message: error.message || 'Error de conexión',
      isNetworkError: true
    };
  }
}
// Obtener usuarios de la misma empresa
export async function getCompanyUsersAPI() {
  try {
    const API_URL = `${API_BASE_URL}/users/company/users`;
    // console.log('Obteniendo usuarios de empresa desde:', API_URL);
    
    const res = await fetch(API_URL, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return { ok: false, message: 'Sesión expirada' };
      }
      
      const errorText = await res.text();
      console.error('Error response:', errorText);
      
      // ✅ MANEJO ESPECIAL PARA 404 (Empresa no encontrada)
      if (res.status === 404) {
        return { 
          ok: false, 
          message: 'Empresa no encontrada',
          status: 404,
          requiresLogout: true // Indicador para cerrar sesión
        };
      }
      
      throw new Error(`Error al obtener usuarios de la empresa: ${res.status} - ${errorText}`);
    }
    
    const data = await res.json();
    // console.log('Usuarios de empresa recibidos:', data);
    return { ok: true, ...data };
  } catch (error) {
    console.error('Error in getCompanyUsersAPI:', error);
    return { ok: false, message: error.message };
  }
}
// Actualizar límite de usuarios
export async function updateUserLimitAPI(id, maxUsers) {
  try {
    const API_URL = `${API_BASE_URL}/users/${id}/limit`;
    
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ maxUsers })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      if (res.status === 403) {
        throw new Error('No tienes permisos para actualizar límites');
      }
      
      let errorMessage = `Error ${res.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si no es JSON, usar el texto
      }
      
      throw new Error(errorMessage);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in updateUserLimitAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}
//AQUI COMPLETAR.... 
// services/userService.js - Función updateCompanyAPI 
export async function updateCompanyAPI(data) {
  try {
    const API_URL = `${API_BASE_URL}/company/me`;
    
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    // Primero intentamos parsear la respuesta como JSON
    let responseData;
    try {
      responseData = await res.json();
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      // Si no es JSON, creamos un objeto de error básico
      const text = await res.text();
      responseData = {
        ok: false,
        message: text || 'Error desconocido'
      };
    }
    
    // Si la respuesta no es ok (2xx), NO lanzamos un Error inmediatamente
    // En lugar de eso, retornamos el objeto con la información de error
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return {
          ok: false,
          message: 'No autorizado',
          requiresLogin: true
        };
      }
      
      if (res.status === 403) {
        return {
          ok: false,
          message: 'No tienes permisos para actualizar la compañía',
          status: res.status
        };
      }
      
      return {
        ok: false,
        message: responseData.message || `Error ${res.status}`,
        status: res.status,
        data: responseData
      };
    }
    
    // Si es exitoso, retornamos los datos
    return {
      ok: true,
      ...responseData
    };
    
  } catch (error) {
    console.error('Error in updateCompanyAPI:', error);
    // Para errores de red, también retornamos un objeto en lugar de lanzar Error
    return {
      ok: false,
      message: error.message || 'Error de conexión',
      isNetworkError: true
    };
  }
}
// Subir logo de empresa
export async function uploadCompanyLogoAPI(id, formData) {
  try {
    const API_URL = `${API_BASE_URL}/users/${id}/logo`;

    if (!id) {
      throw new Error('ID de usuario inválido');
    }

    if (!formData || !(formData instanceof FormData)) {
      throw new Error('Datos de archivo inválidos');
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      throw new Error('No autenticado. Por favor, inicia sesión.');
    }

    // console.log('📦 Subiendo logo para usuario:', id);

    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
        // ⚠️ NO Content-Type
      },
      body: formData
    });

    const responseText = await res.text();

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (err) {
      console.error('Respuesta no JSON:', responseText);
      throw new Error('Respuesta inválida del servidor');
    }

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (res.status === 413) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB.');
      }

      throw new Error(responseData.message || `Error ${res.status}`);
    }

    return responseData;
  } catch (error) {
    console.error('❌ Error in uploadCompanyLogoAPI:', error);

    if (
      error.message.includes('Network Error') ||
      error.message.includes('Failed to fetch')
    ) {
      throw new Error('Problema de conexión con el servidor');
    }

    throw new Error(error.message || 'Error al subir el logo');
  }
}
// Eliminar logo de empresa
export async function deleteCompanyLogoAPI(id) {
  try {
    const API_URL = `${API_BASE_URL}/users/${id}/logo`;
    
    const res = await fetch(API_URL, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      let errorMessage = `Error ${res.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si no es JSON, usar el texto
      }
      
      throw new Error(errorMessage);
    }
    
    return res.json();
  } catch (error) {
    console.error('Error in deleteCompanyLogoAPI:', error);
    throw new Error(`Error: ${error.message}`);
  }
}
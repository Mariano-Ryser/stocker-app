// hooks/useProduct.js - VERSIÓN CON PAGINACIÓN REAL
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import {
  getProductsPaginated,
  createProductAPI,
  updateProductAPI,
  deleteProductImageAPI,
  deleteProductAPI,
} from "../services/productService";

export const useProduct = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1
  });
  
  // Estados para búsqueda y filtros (separados de los que se envían al backend)
  const [searchInput, setSearchInput] = useState(''); // Para el input
  const [activeSearch, setActiveSearch] = useState(''); // Para la búsqueda confirmada
  const [stockFilter, setStockFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('none');
  
  const [editingProduct, setEditingProductState] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isFetchingRef = useRef(false);

  // Función para construir query params (USA activeSearch, no searchInput)
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('limit', itemsPerPage);
    
    if (activeSearch) {
      params.append('search', activeSearch);
      params.append('searchType', 'startsWith'); // 'startsWith' para que empiece con el término
    }
    
    if (stockFilter !== 'all') {
      params.append('stockFilter', stockFilter);
    }
    
    if (sortOrder !== 'none') {
      params.append('sortBy', 'stock');
      params.append('sortOrder', sortOrder);
    }
    
    return params;
  }, [currentPage, itemsPerPage, activeSearch, stockFilter, sortOrder]);

  // Función para obtener productos paginados
  const fetchProductsPaginated = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated) {
      setProducts([]);
      setTotalProducts(0);
      setTotalInventoryValue(0);
      return;
    }

    if (isFetchingRef.current && !forceRefresh) {
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    
    try {
      const params = buildQueryParams();
      console.log('Fetching page:', currentPage, 'with search:', activeSearch);
      
      const data = await getProductsPaginated(params);
      
      setProducts(data.products || []);
      setTotalProducts(data.pagination?.total || 0);
      setTotalInventoryValue(data.totalInventoryValue || 0);
      setPaginationInfo(data.pagination || {
        total: 0,
        page: currentPage,
        limit: itemsPerPage,
        pages: 1
      });
      setTotalPages(data.pagination?.pages || 1);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [isAuthenticated, buildQueryParams, currentPage, activeSearch]);

  // Efecto para cargar productos cuando cambian: página, filtros activos, o refresh
  useEffect(() => {
    if (isAuthenticated) {
      fetchProductsPaginated();
    }
  }, [isAuthenticated, currentPage, activeSearch, stockFilter, sortOrder, refreshTrigger]);

  // ✅ Crear producto
  async function createProduct(productData) {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para crear productos');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const productToCreate = {
        artikelName: productData.artikelName.trim(),
        lagerPlatz: productData.lagerPlatz || "",
        artikelNumber: productData.artikelNumber || "",
        description: productData.description || "",
        stock: productData.stock === '' ? 0 : Number(productData.stock || 0),
        price: productData.price === '' ? 0 : Number(productData.price || 0),
      };
      
      if (productData.imagen && productData.imagen instanceof File) {
        productToCreate.imagen = productData.imagen;
      }
      
      const created = await createProductAPI(productToCreate);
      
      // Volver a la primera página después de crear
      setCurrentPage(1);
      setRefreshTrigger(prev => prev + 1);
      
      return { 
        success: true, 
        product: created.product || created 
      };
      
    } catch (err) {
      console.error('Error creating product:', err);
      const errorMessage = err.message || 'Unbekannter Fehler';
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  }

  // ✅ Actualizar producto
  async function updateProduct(productId, updatedProduct) {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para actualizar productos');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    try {
      const updated = await updateProductAPI(productId, updatedProduct);
      
      // Refrescar la página actual
      setRefreshTrigger(prev => prev + 1);
      
      return { 
        success: true, 
        product: updated.product || updated 
      };
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message);
      return { 
        success: false, 
        error: err.message 
      };
    } finally {
      setLoading(false);
    }
  }

  // ✅ Eliminar imagen
  async function deleteProductImage(id) {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para eliminar imágenes');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    try {
      const result = await deleteProductImageAPI(id);
      setRefreshTrigger(prev => prev + 1);
      return { success: true, result };
    } catch (err) {
      console.error('Error deleting product image:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  // ✅ Eliminar producto
  async function deleteProduct(id) {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para eliminar productos');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    try {
      await deleteProductAPI(id);
      
      // Si después de eliminar la página actual queda vacía (excepto página 1), retroceder
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        setRefreshTrigger(prev => prev + 1);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }

  // ✅ Setear producto para edición
  const setProductToEdit = (product) => {
    setEditingProductState({...product});
  };

  // ✅ Funciones para cambiar página
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ✅ NUEVA: Función para confirmar búsqueda (manual)
  const confirmSearch = () => {
    setActiveSearch(searchInput); // Activar la búsqueda con el término actual
    setCurrentPage(1); // Volver a primera página
  };

  // ✅ Funciones para filtros
  const setStock = (filter) => {
    setStockFilter(filter);
    setCurrentPage(1);
  };

  const setSort = (order) => {
    setSortOrder(order);
    setCurrentPage(1);
  };

  // ✅ Resetear filtros
  const resetFilters = () => {
    setSearchInput('');
    setActiveSearch(''); // Limpiar búsqueda activa
    setStockFilter('all');
    setSortOrder('none');
    setCurrentPage(1);
  };

  // ✅ Función para limpiar solo la búsqueda
  const clearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    setCurrentPage(1);
  };

  // ✅ Función para forzar refresh
  const refreshProducts = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const clearError = () => {
    setError(null);
  };

  return {
    products,
    editingProduct,
    totalProducts,
    totalInventoryValue,
    loading,
    error,
    
    // Paginación
    currentPage,
    totalPages,
    itemsPerPage,
    paginationInfo,
    goToPage,
    nextPage,
    prevPage,
    
    // Filtros y búsqueda
    searchInput,          // ← Valor del input (cambia en tiempo real)
    activeSearch,         // ← Búsqueda confirmada (la que usa el backend)
    stockFilter,
    sortOrder,
    setSearchInput,       // ← Actualiza el input
    confirmSearch,        // ← Confirma la búsqueda manualmente
    setStock,
    setSort,
    resetFilters,
    clearSearch,
    
    // Acciones
    createProduct,
    updateProduct,
    deleteProductImage,
    deleteProduct,
    setProductToEdit,
    refreshProducts,
    clearError,
    isAuthenticated
  };
};
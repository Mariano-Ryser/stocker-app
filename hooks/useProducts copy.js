// hooks/useProduct.js - VERSIÓN CORREGIDA
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import {
  getProducts,
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
  
  // NUEVO: Estado para productos en edición (separado del global)
  const [editingProduct, setEditingProductState] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // ← Asegúrate de tener esto
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated) {
      setProducts([]);
      setTotalProducts(0);
      setTotalInventoryValue(0);
      hasFetchedRef.current = false;
      return;
    }

    if (isFetchingRef.current && !forceRefresh) {
      console.log('Products: Already fetching, skipping...');
      return;
    }

    if (hasFetchedRef.current && !forceRefresh) {
      console.log('Products: Already fetched, skipping...');
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    
    try {
      console.log('Products: Fetching data...');
      const data = await getProducts();
      
      if (data && typeof data === 'object' && 'products' in data) {
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
        setTotalInventoryValue(data.totalInventoryValue || 0);
      } else {
        setProducts(data || []);
        setTotalProducts(data ? data.length : 0);
        setTotalInventoryValue(0);
      }
      
      hasFetchedRef.current = true;
      console.log('Products: Fetch completed');
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      hasFetchedRef.current = false;
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !hasFetchedRef.current) {
      console.log('Products: Initial fetch triggered');
      fetchProducts();
    }
    
    return () => {
      if (!isAuthenticated) {
        setProducts([]);
        setTotalProducts(0);
        setTotalInventoryValue(0);
        hasFetchedRef.current = false;
      }
    };
  }, [isAuthenticated, fetchProducts]);

  // ✅ Crear producto (con datos del formulario)
  async function createProduct(productData) {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para crear productos');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Creating product with data:', productData);
      
      // Validaciones
      if (!productData.artikelName || productData.artikelName.trim() === '') {
        throw new Error('Artikel Name ist erforderlich');
      }
      
      // Preparar datos
      const productToCreate = {
        artikelName: productData.artikelName.trim(),
        lagerPlatz: productData.lagerPlatz || "",
        artikelNumber: productData.artikelNumber || "",
        description: productData.description || "",
        stock: productData.stock === '' ? 0 : Number(productData.stock || 0),
        price: productData.price === '' ? 0 : Number(productData.price || 0),
      };
      
      // Agregar imagen si existe
      if (productData.imagen && productData.imagen instanceof File) {
        productToCreate.imagen = productData.imagen;
      }
      
      const created = await createProductAPI(productToCreate);
      
      // ✅ INCREMENTAR EL REFRESH TRIGGER para que infinite scroll se resetee
      setRefreshTrigger(prev => prev + 1);
      
      console.log('Product created successfully');
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
      console.log('Updating product:', updatedProduct);
      const updated = await updateProductAPI(productId, updatedProduct);
      
      // NUEVO: Actualizar la lista local inmediatamente
      setProducts(prev =>
        prev.map((p) => (p._id === updated.product?._id ? updated.product : p))
      );
      
      console.log('Product updated successfully');
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

  // ✅ Eliminar solo la imagen del producto
  async function deleteProductImage(id) {
    if (!isAuthenticated) {
      setError('Debe iniciar sesión para eliminar imágenes');
      return { success: false, error: 'No autenticado' };
    }
    
    setLoading(true);
    try {
      const result = await deleteProductImageAPI(id);
      
      // Actualizar la lista local
      setProducts(prev =>
        prev.map((p) =>
          p._id === id ? { ...p, imagen: "", publicId: "" } : p
        )
      );
      
      return { 
        success: true, 
        result 
      };
    } catch (err) {
      console.error('Error deleting product image:', err);
      setError(err.message);
      return { 
        success: false, 
        error: err.message 
      };
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
      
      // Actualizar la lista local
      setProducts(prev => prev.filter((p) => p._id !== id));
      
      return { 
        success: true 
      };
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
      return { 
        success: false, 
        error: err.message 
      };
    } finally {
      setLoading(false);
    }
  }

  // ✅ Setear producto para edición (solo datos, no estado global)
  const setProductToEdit = (product) => {
    setEditingProductState({...product});
  };

  // ✅ Función para forzar refresh
  const refreshProducts = useCallback(() => {
    console.log('Products: Manual refresh triggered');
    hasFetchedRef.current = false;
    fetchProducts(true);
  }, [fetchProducts]);

  // ✅ Función para limpiar errores
  const clearError = () => {
    setError(null);
  };

  return {
    products,           // ← Lista de productos
    editingProduct,     // ← Producto en edición (separado)
    totalProducts,
    totalInventoryValue,
    loading,
    error,
    refreshTrigger,
    setError: clearError,
    fetchProducts,
    createProduct,      // ← Ahora recibe datos directamente
    updateProduct,      // ← Ahora recibe id y datos
    deleteProductImage,
    deleteProduct,
    setProductToEdit,
    refreshProducts,
    isAuthenticated
  };
};
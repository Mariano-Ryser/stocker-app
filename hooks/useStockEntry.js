// hooks/useStockEntry.js - VERSIÓN ACTUALIZADA CON MOVIMIENTOS
import { useState, useCallback } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { getProductsPaginated } from '../services/productService';
import { createStockMovement } from '../services/stockMovementService';

export const useStockEntry = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [lastMovement, setLastMovement] = useState(null);
  const { isAuthenticated, user } = useAuth();

  // Buscar productos
  const searchProducts = useCallback(async (searchTerm) => {
    if (!isAuthenticated || !searchTerm.trim()) {
      setProducts([]);
      return;
    }

    setSearchLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', 1);
      params.append('limit', 20);
      params.append('search', searchTerm);
      params.append('searchType', 'contains');
      
      const data = await getProductsPaginated(params);
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error searching products:', err);
      setError(err.message);
      setProducts([]);
    } finally {
      setSearchLoading(false);
    }
  }, [isAuthenticated]);

  // Registrar entrada de mercancía (WAREHOUSE_IN)
  const registerWarehouseEntry = useCallback(async (data) => {
    const {
      productId,
      quantity,
      notes = '',
      supplier = null,
      referenceNumber = '',
      expirationDate = null,
      batchNumber = null
    } = data;

    if (!isAuthenticated) {
      setError('Debe iniciar sesión');
      return { success: false, error: 'No autenticado' };
    }

    if (!quantity || quantity <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return { success: false, error: 'Cantidad inválida' };
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Crear el movimiento de stock
      const movementData = {
        productId,
        movementType: 'WAREHOUSE_IN',
        quantity: parseInt(quantity),
        notes,
        supplier: supplier ? {
          name: supplier.name,
          id: supplier.id
        } : undefined,
        reference: referenceNumber ? {
          type: 'PURCHASE',
          number: referenceNumber
        } : undefined,
        expirationDate,
        batchNumber
      };

      const result = await createStockMovement(movementData);
      
      if (result.ok && result.movement) {
        // Actualizar el producto en la lista local
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p._id === productId 
              ? { ...p, stock: result.movement.newStock }
              : p
          )
        );

        setLastMovement(result.movement);
        setSuccess(
          `✅ Wareneingang registrado: +${quantity} ${result.movement.productSnapshot.artikelName}. ` +
          `Neuer Bestand: ${result.movement.newStock}`
        );
        
        return { 
          success: true, 
          movement: result.movement
        };
      } else {
        throw new Error('Error al registrar el movimiento');
      }

    } catch (err) {
      console.error('Error registering warehouse entry:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Registrar salida de mercancía (WAREHOUSE_OUT)
  const registerWarehouseOut = useCallback(async (data) => {
    const {
      productId,
      quantity,
      notes = '',
      referenceNumber = '',
      reason = ''
    } = data;

    if (!isAuthenticated) {
      setError('Debe iniciar sesión');
      return { success: false, error: 'No autenticado' };
    }

    if (!quantity || quantity <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return { success: false, error: 'Cantidad inválida' };
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const movementData = {
        productId,
        movementType: 'WAREHOUSE_OUT',
        quantity: parseInt(quantity),
        notes,
        reason,
        reference: referenceNumber ? {
          type: 'SALE',
          number: referenceNumber
        } : undefined
      };

      const result = await createStockMovement(movementData);
      
      if (result.ok && result.movement) {
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p._id === productId 
              ? { ...p, stock: result.movement.newStock }
              : p
          )
        );

        setLastMovement(result.movement);
        setSuccess(
          `✅ Warenausgang registrado: -${quantity} ${result.movement.productSnapshot.artikelName}. ` +
          `Neuer Bestand: ${result.movement.newStock}`
        );
        
        return { success: true, movement: result.movement };
      }

    } catch (err) {
      console.error('Error registering warehouse out:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Registrar ajuste manual
  const registerManualAdjustment = useCallback(async (data) => {
    const {
      productId,
      newStock,
      reason,
      notes = ''
    } = data;

    if (!isAuthenticated) {
      setError('Debe iniciar sesión');
      return { success: false, error: 'No autenticado' };
    }

    setLoading(true);
    setError(null);

    try {
      // Primero obtener el producto actual
      const product = products.find(p => p._id === productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const currentStock = product.stock || 0;
      const adjustment = newStock - currentStock;

      if (adjustment === 0) {
        throw new Error('El nuevo stock es igual al actual');
      }

      const movementData = {
        productId,
        movementType: 'MANUAL_ADJUSTMENT',
        quantity: adjustment,
        reason: reason || 'Ajuste manual de inventario',
        notes
      };

      const result = await createStockMovement(movementData);
      
      if (result.ok && result.movement) {
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p._id === productId 
              ? { ...p, stock: result.movement.newStock }
              : p
          )
        );

        setLastMovement(result.movement);
        setSuccess(
          `✅ Ajuste manual: ${adjustment > 0 ? '+' : ''}${adjustment} unidades. ` +
          `Nuevo stock: ${result.movement.newStock}`
        );
        
        return { success: true, movement: result.movement };
      }

    } catch (err) {
      console.error('Error registering manual adjustment:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, products]);

  // Limpiar mensajes
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setProducts([]);
    setError(null);
  }, []);

  return {
    products,
    loading,
    searchLoading,
    error,
    success,
    lastMovement,
    searchProducts,
    registerWarehouseEntry,
    registerWarehouseOut,
    registerManualAdjustment,
    clearMessages,
    clearSearch,
    isAuthenticated,
    user
  };
};
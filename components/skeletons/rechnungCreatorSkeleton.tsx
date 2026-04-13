// components/skeletons/rechnungCreatorSkeleton.tsx
import styles from './RechnungCreatorSkeleton.module.css';

export default function RechnungCreatorSkeleton() {
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalLarge}>
        {/* Header skeleton */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitle}>
            <div className={styles.skeletonTitle}></div>
          </div>
          <div className={styles.closeBtnSkeleton}></div>
        </div>
        
        <div className={styles.posContainer}>
          {/* Panel izquierdo - Productos skeleton */}
          <div className={styles.productsPanel}>
            <div className={styles.searchSection}>
              <div className={styles.searchWrapper}>
                <div className={styles.searchIconSkeleton}></div>
                <div className={styles.searchInputSkeleton}></div>
              </div>
            </div>
            
            <div className={styles.productsGrid}>
              {/* Tarjetas de productos skeleton */}
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className={styles.productCardSkeleton}>
                  <div className={styles.productImageSkeleton}>
                    <div className={styles.imageShimmer}></div>
                  </div>
                  <div className={styles.productInfoSkeleton}>
                    <div className={styles.productNameSkeleton}></div>
                    <div className={styles.productNumberSkeleton}></div>
                    <div className={styles.productFooterSkeleton}>
                      <div className={styles.productPriceSkeleton}></div>
                      <div className={styles.productStockSkeleton}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Panel derecho - Carrito skeleton */}
          <div className={styles.cartPanel}>
            <div className={styles.cartHeader}>
              <div className={styles.clientSection}>
                <div className={styles.labelSkeleton}></div>
                <div className={styles.inputSkeleton}></div>
              </div>
              <div className={styles.statusSection}>
                <div className={styles.labelSkeleton}></div>
                <div className={styles.selectSkeleton}></div>
              </div>
            </div>
            
            <div className={styles.cartItems}>
              <div className={styles.cartItemsHeader}>
                <div className={styles.cartTitleSkeleton}></div>
                <div className={styles.clearCartSkeleton}></div>
              </div>
              
              {/* Items del carrito skeleton */}
              <div className={styles.cartList}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className={styles.cartItemSkeleton}>
                    <div className={styles.cartItemInfoSkeleton}>
                      <div className={styles.cartItemImageSkeleton}></div>
                      <div className={styles.cartItemDetailsSkeleton}>
                        <div className={styles.cartItemNameSkeleton}></div>
                        <div className={styles.cartItemNumberSkeleton}></div>
                        <div className={styles.cartItemPriceSkeleton}></div>
                      </div>
                    </div>
                    <div className={styles.cartItemControlsSkeleton}>
                      <div className={styles.quantityControlSkeleton}>
                        <div className={styles.qtyBtnSkeleton}></div>
                        <div className={styles.qtyInputSkeleton}></div>
                        <div className={styles.qtyBtnSkeleton}></div>
                      </div>
                      <div className={styles.itemSubtotalSkeleton}></div>
                      <div className={styles.removeItemSkeleton}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.cartTotals}>
              <div className={styles.totalRowSkeleton}>
                <div className={styles.totalLabelSkeleton}></div>
                <div className={styles.totalValueSkeleton}></div>
              </div>
              <div className={styles.totalRowSkeleton}>
                <div className={styles.totalLabelSkeleton}></div>
                <div className={styles.totalValueSkeleton}></div>
              </div>
              <div className={styles.grandTotalSkeleton}>
                <div className={styles.grandTotalLabelSkeleton}></div>
                <div className={styles.grandTotalValueSkeleton}></div>
              </div>
            </div>
            
            <div className={styles.cartActions}>
              <div className={styles.btnCancelSkeleton}></div>
              <div className={styles.btnSaveSkeleton}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
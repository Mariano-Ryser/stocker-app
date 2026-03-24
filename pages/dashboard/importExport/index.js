// pages/ImportExportPage.jsx
import { useState, useEffect } from 'react';
import { useLanguage } from "../../../contexts/LanguageContext";
import ExcelImportExport from '../../../components/ui/ExcelImportExport';
import ExcelTemplateButton from '../../../components/ui/ExcelTemplate';
import { useProduct } from '../../../hooks/useProducts';
import { useSalesForImport } from '../../../hooks/useSalesForImport';
import { validateProducts } from '../../../services/bulkImportService';
import ProductLimitBadge from '../../../components/dashboard/limitProduct/ProductLimitBadge';
import styles from './ImportExportPage.module.css'; 

export default function ImportExportPage() {
  const { t } = useLanguage();
  const [dataType, setDataType] = useState('products');
  const [importResults, setImportResults] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedData, setImportedData] = useState([]);

  const {
    products,
    loading: productsLoading,
    error: productsError,
    refreshProducts,
    productLimits,
    fetchProductLimits,
    bulkImport
  } = useProduct();
  
  const {
    sales,
    loading: salesLoading,
    error: salesError,
    refreshSales
  } = useSalesForImport();

  useEffect(() => {
    fetchProductLimits();
  }, [fetchProductLimits]);

  useEffect(() => {
    if (productsError) console.error('Error loading products:', productsError);
    if (salesError) console.error('Error loading sales:', salesError);
  }, [productsError, salesError]);

  const currentData = dataType === 'sales' ? sales : products;
  const currentLoading = dataType === 'sales' ? salesLoading : productsLoading;
  const showImport = dataType === 'products';







  const handleImport = async (importedData) => {
    if (dataType === 'sales') {
      alert(t('import.notAvailable'));
      return;
    }

    try {
      console.log('=== HANDLE IMPORT START ===');
      console.log('Imported data count:', importedData.length);
      console.log('Product limits:', productLimits);
      
      // ✅ Verificar límite de espacio
      if (importedData.length > productLimits.remaining) {

         console.log('Space check failed - limits:', productLimits);
        // Usar mensaje sin variables
        const errorMessage = t('import.spaceCheckError');
        
        console.log('Space check failed:', errorMessage);
        
        setImportResults({
        type: 'error',
        dataType: 'products',
        message: t('import.spaceCheckError'),
        limits: {
          current: productLimits.current,
          max: productLimits.max,
          remaining: productLimits.remaining
        }
        });
        setShowImportModal(true);
        return;
      }
      
      setImportedData(importedData);
      
      const validation = validateProducts(importedData);
      console.log('Validation results:', validation);

      if (validation.invalid.length > 0) {
        setImportResults({
          type: 'validation',
          dataType: 'products',
          valid: validation.valid.length,
          invalid: validation.invalid.length,
          errors: validation.invalid
        });
        setShowImportModal(true);
        return;
      }

      if (validation.valid.length === 0) {
        alert(t('import.noValidProducts'));
        return;
      }

      console.log(`Importing ${validation.valid.length} valid products...`);
      
      const result = await bulkImport(validation.valid);
      console.log('Import result:', result);
      
      const importedCount = result.imported || result.success || 0;
      const totalCount = result.total || validation.valid.length;
      const failedCount = totalCount - importedCount;
      
      // ✅ Usar mensajes sin variables
      let message = '';
      let resultType = 'import';
      
      if (failedCount === 0) {
        message = t('importResult.messageSuccess');
        resultType = 'import';
      } else if (importedCount > 0) {
        message = t('importResult.messagePartial');
        resultType = 'import';
      } else {
        message = t('importResult.error');
        resultType = 'error';
      }
      
      setImportResults({
        type: resultType,
        dataType: 'products',
        success: importedCount,
        failed: failedCount,
        imported: importedCount,
        total: totalCount,
        errors: result.errors || [],
        message: message,
        limits: result.limits
      });
      
      setShowImportModal(true);

      if (importedCount > 0) {
        console.log(`Import successful for ${importedCount} products, refreshing data...`);
        setTimeout(() => {
          refreshProducts();
          fetchProductLimits();
        }, 800);
      }

    } catch (error) {
      console.error('=== IMPORT ERROR ===');
      console.error('Error details:', error);
      
      setImportResults({
        type: 'error',
        dataType: 'products',
        message: t('importResult.error')
      });
      setShowImportModal(true);
    }
  };


























  const handleImportValidOnly = async () => {
    try {
      if (!importedData?.length) return;

      const validData = importedData.filter((_, index) =>
        !importResults.errors?.some(e => e.index === index)
      );

      if (!validData.length) {
        alert(t('import.noValidProducts'));
        return;
      }

      if (validData.length > productLimits.remaining) {
        alert(t('import.spaceCheckError'));
        return;
      }

      const result = await bulkImport(validData);
      
      const importedCount = result.imported || result.success || 0;
      const totalCount = result.total || validData.length;
      const failedCount = totalCount - importedCount;

      let message = '';
      if (failedCount === 0) {
        message = t('importResult.messageSuccess');
      } else if (importedCount > 0) {
        message = t('importResult.messagePartial');
      } else {
        message = t('importResult.error');
      }

      setImportResults({
        type: 'import',
        dataType: 'products',
        success: importedCount,
        failed: failedCount,
        imported: importedCount,
        total: totalCount,
        message: message
      });

      if (importedCount > 0) {
        setTimeout(() => {
          refreshProducts();
          fetchProductLimits();
        }, 800);
      }

    } catch (error) {
      setImportResults({
        type: 'error',
        dataType: 'products',
        message: t('importResult.error')
      });
    }
  };

  const handleCloseModal = () => {
    setShowImportModal(false);
    setImportResults(null);
    setImportedData([]);
  };

  // ✅ Obtener textos según el tipo de datos
  const getSubtitle = () => {
    return dataType === 'sales' ? t('subtitleSales') : t('subtitleProducts');
  };

  const getItemsLabel = () => {
    return dataType === 'sales' ? t('stats.itemsSales') : t('stats.itemsProducts');
  };

  const getTemplateSubtitle = () => {
    return dataType === 'sales' ? t('template.subtitleSales') : t('template.subtitleProducts');
  };

  const getFormatText = () => {
    return dataType === 'sales' ? t('template.formatSales') : t('template.formatProducts');
  };

  const getCardTitle = () => {
    return dataType === 'sales' ? t('importExportCard.titleSales') : t('importExportCard.titleProducts');
  };

  const getCardSubtitle = () => {
    return dataType === 'sales' ? t('importExportCard.subtitleSales') : t('importExportCard.subtitleProducts');
  };

  const getModalSubtitle = () => {
    return dataType === 'sales' ? t('modal.subtitleSales') : t('modal.subtitleProducts');
  };

  return (
    <div className={styles.container}>
      {dataType === 'products' && productLimits?.max > 0 && (
        <div className={styles.limitContainer}>
          <ProductLimitBadge limits={productLimits} compact />
        </div>
      )}

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>{t('title')}</h1>
          <p className={styles.headerSubtitle}>
            {getSubtitle()}
          </p>
        </div>
        
        {dataType === 'products' && productLimits?.max > 0 && (
          <div className={styles.limitContainer}>
            <ProductLimitBadge limits={productLimits} compact />
          </div>
        )}
        
        {/* TYPE SELECTOR */}
        <div className={styles.typeSelector}>
          <button 
            className={`${styles.typeBtn} ${dataType === 'products' ? styles.active : ''}`}
            onClick={() => setDataType('products')}
          >
            <div className={styles.typeBtnContent}>
              <div className={styles.typeBtnIcon}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M20 7L12 3L4 7M20 7V17L12 21M20 7L12 11M12 21L4 17V7M12 21V11M4 7L12 11" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 11L20 7" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <span className={styles.typeBtnText}>{t('productLabel')}</span>
              <span className={styles.typeBtnBadge}>{t('importExport')}</span>
            </div>
          </button>
          
          <button 
            className={`${styles.typeBtn} ${dataType === 'sales' ? styles.active : ''}`}
            onClick={() => setDataType('sales')}
          >
            <div className={styles.typeBtnContent}>
              <div className={styles.typeBtnIcon}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 14L15 8M15 14L9 8" stroke="currentColor" strokeWidth="2"/>
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <span className={styles.typeBtnText}>{t('salesLabel')}</span>
              <span className={styles.typeBtnBadge}>{t('exportOnly')}</span>
            </div>
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statCardIcon}>
            {dataType === 'sales' ? (
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 14L15 8M15 14L9 8" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 7L12 3L4 7M20 7V17L12 21M20 7L12 11M12 21L4 17V7M12 21V11M4 7L12 11" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 11L20 7" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
          </div>
          <div className={styles.statCardContent}>
            <div className={styles.statCardLabel}>{getItemsLabel()}</div>
            <div className={styles.statCardValue}>
              {currentLoading ? (
                <div className={styles.loadingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                currentData.length.toLocaleString('de-DE')
              )}
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardIcon}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 15V3M12 15L8 11M12 15L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 3 4 3H20C21.1046 3 22 3.89543 22 5V18C22 19.1046 21.1046 20 20 20Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className={styles.statCardContent}>
            <div className={styles.statCardLabel}>{t('stats.status')}</div>
            <div className={`${styles.statCardStatus} ${currentLoading ? styles.loading : styles.ready}`}>
              {currentLoading ? t('stats.loading') : t('stats.ready')}
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardIcon}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.statCardContent}>
            <div className={styles.statCardLabel}>{t('stats.functions')}</div>
            <div className={styles.statCardMode}>
              {dataType === 'products' ? t('stats.importExport') : t('stats.exportOnly')}
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        {/* TEMPLATE CARD */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              {dataType === 'sales' ? (
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 18V12" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 15H15" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 13H8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 17H8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </div>
            <div className={styles.cardHeaderContent}>
              <h2 className={styles.cardTitle}>{t('template.download')}</h2>
              <p className={styles.cardSubtitle}>
                {getTemplateSubtitle()}
              </p>
            </div>
          </div>

          <div className={styles.cardContent}>
            <ExcelTemplateButton type={dataType} />

            <div className={styles.templateInfo}>
              <h3 className={styles.templateTitle}>
                <span className={styles.templateTitleIcon}>📋</span>
                {getFormatText()}
              </h3>
              {dataType === 'products' ? (
                <ul className={styles.templateList}>
                  <li className={styles.templateItem}>
                    <span className={styles.templateItemLabel}>{t('template.fields.product.articleNumber')}</span>
                    <span className={styles.templateItemHint}>{t('template.fields.product.articleNumberHint')}</span>
                  </li>
                  <li className={styles.templateItem}>
                    <span className={styles.templateItemLabel}>
                      {t('template.fields.product.name')}
                      <span className={styles.requiredBadge}>{t('template.fields.product.required')}</span>
                    </span>
                    <span className={styles.templateItemHint}>{t('template.fields.product.nameHint')}</span>
                  </li>
                  <li className={styles.templateItem}>
                    <span className={styles.templateItemLabel}>{t('template.fields.product.location')}</span>
                    <span className={styles.templateItemHint}>{t('template.fields.product.locationHint')}</span>
                  </li>
                  <li className={styles.templateItem}>
                    <span className={styles.templateItemLabel}>{t('template.fields.product.stock')}</span>
                    <span className={styles.templateItemHint}>{t('template.fields.product.stockHint')}</span>
                  </li>
                  <li className={styles.templateItem}>
                    <span className={styles.templateItemLabel}>{t('template.fields.product.price')}</span>
                    <span className={styles.templateItemHint}>{t('template.fields.product.priceHint')}</span>
                  </li>
                  <li className={styles.templateItem}>
                    <span className={styles.templateItemLabel}>{t('template.fields.product.imageUrl')}</span>
                    <span className={styles.templateItemHint}>{t('template.fields.product.imageUrlHint')}</span>
                  </li>
                </ul>
              ) : (
                <ul className={styles.templateList}>
                  <li className={styles.templateItem}>
                    <span className={styles.templateItemLabel}>{t('template.fields.sale.deliveryNote')}</span>
                    <span className={styles.templateItemHint}>{t('template.fields.sale.deliveryNoteHint')}</span>
                  </li>
                  <li className={styles.templateItem}>
                    <span className={styles.templateItemLabel}>{t('template.fields.sale.customer')}</span>
                    <span className={styles.templateItemHint}>{t('template.fields.sale.customerHint')}</span>
                  </li>
                  <li className={styles.templateItem}>
                    <span className={styles.templateItemLabel}>
                      {t('template.fields.sale.productName')}
                      <span className={styles.requiredBadge}>{t('template.fields.product.required')}</span>
                    </span>
                    <span className={styles.templateItemHint}>{t('template.fields.sale.productNameHint')}</span>
                  </li>
                  <li className={styles.templateItem}>
                    <span className={styles.templateItemLabel}>{t('template.fields.sale.quantity')}</span>
                    <span className={styles.templateItemHint}>{t('template.fields.sale.quantityHint')}</span>
                  </li>
                  <li className={styles.templateItem}>
                    <span className={styles.templateItemLabel}>{t('template.fields.sale.unitPrice')}</span>
                    <span className={styles.templateItemHint}>{t('template.fields.sale.unitPriceHint')}</span>
                  </li>
                  <li className={styles.templateItem}>
                    <span className={styles.templateItemLabel}>{t('template.fields.sale.status')}</span>
                    <span className={styles.templateItemHint}>{t('template.fields.sale.statusHint')}</span>
                  </li>
                  <li className={styles.templateItem}>
                    <span className={styles.templateItemLabel}>{t('template.fields.sale.total')}</span>
                    <span className={styles.templateItemHint}>{t('template.fields.sale.totalHint')}</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* IMPORT/EXPORT CARD */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              {dataType === 'sales' ? (
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div className={styles.cardHeaderContent}>
              <h2 className={styles.cardTitle}>
                {getCardTitle()}
              </h2>
              <p className={styles.cardSubtitle}>
                {getCardSubtitle()}
              </p>
            </div>
          </div>

          <div className={styles.cardContent}>
            <ExcelImportExport 
              data={currentData}
              onImport={handleImport}
              filename={dataType === 'products' ? 'produkte' : 'verkaufe'}
              disabled={currentLoading}
              showImport={showImport}
              showExport={true}
              type={dataType}
            />

            <div className={styles.actionsInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoItemIcon}>📄</span>
                <span className={styles.infoItemText}>{t('actions.supported')}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoItemIcon}>⚡</span>
                <span className={styles.infoItemText}>{t('actions.maxRecords')}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoItemIcon}>🔄</span>
                <span className={styles.infoItemText}>
                  {dataType === 'products' ? t('actions.sameFormat') : t('actions.exportFormat')}
                </span>
              </div>
              {dataType === 'sales' && (
                <div className={styles.infoItem}>
                  <span className={styles.infoItemIcon}>📊</span>
                  <span className={styles.infoItemText}>{t('actions.salesDetails')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showImportModal && importResults && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderContent}>
                <h2 className={styles.modalTitle}>
                  {importResults.type === 'validation' ? t('modal.validation') :
                   importResults.type === 'import' ? t('modal.importComplete') :
                   t('modal.error')}
                </h2>
                <p className={styles.modalSubtitle}>
                  {getModalSubtitle()}
                </p>
              </div>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className={styles.modalContent}>
              {importResults.type === 'validation' && (
                <>
                  <div className={styles.validationSummary}>
                    <div className={`${styles.validationBox} ${styles.success}`}>
                      <div className={styles.validationCount}>{importResults.valid}</div>
                      <div className={styles.validationLabel}>{t('validation.valid')}</div>
                    </div>
                    <div className={`${styles.validationBox} ${styles.error}`}>
                      <div className={styles.validationCount}>{importResults.invalid}</div>
                      <div className={styles.validationLabel}>{t('validation.invalid')}</div>
                    </div>
                  </div>

                  {importResults.errors?.length > 0 && (
                    <div className={styles.errorListContainer}>
                      <div className={styles.errorListHeader}>
                        <h4>{t('validation.errorDetails')}</h4>
                        <span className={styles.errorCount}>({importResults.errors.length} {t('validation.errors')})</span>
                      </div>
                      <div className={styles.errorList}>
                        {importResults.errors.slice(0, 8).map((e, i) => (
                          <div key={i} className={styles.errorItem}>
                            <div className={styles.errorItemHeader}>
                              <span className={styles.errorRow}>
                                {t('validation.row')} {e.row || e.index + 2}
                              </span>
                              {e.lieferschein && (
                                <span className={styles.errorLieferschein}>{e.lieferschein}</span>
                              )}
                            </div>
                            <div className={styles.errorMessages}>
                              {e.errors.map((msg, j) => (
                                <div key={j} className={styles.errorMessage}>
                                  <span className={styles.errorBullet}>•</span>
                                  {msg}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.modalActions}>
                    <button 
                      className={`${styles.btn} ${styles.btnPrimary}`}
                      onClick={handleImportValidOnly}
                      disabled={!importResults.valid}
                    >
                      <span className={styles.btnIcon}>✓</span>
                      {t('modal.importValidOnly')}
                    </button>
                    <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleCloseModal}>
                      {t('modal.cancel')}
                    </button>
                  </div>
                </>
              )}

              {importResults.type === 'import' && (
                <>
                  <div className={`${styles.importResult} ${importResults.failed > 0 ? styles.warning : styles.success}`}>
                    <div className={styles.importResultIcon}>
                      {importResults.failed > 0 ? '⚠️' : '✅'}
                    </div>
                    <div className={styles.importResultContent}>
                      <h3>
                        {importResults.failed > 0 ? t('importResult.warning') : t('importResult.success')}
                      </h3>
                      <p className={styles.importResultMessage}>
                        {importResults.message}
                      </p>
                      
                      <div className={styles.importStats}>
                        <div className={styles.importStat}>
                          <span className={styles.importStatLabel}>{t('importResult.statsTotal')}</span>
                          <span className={styles.importStatValue}>{importResults.total}</span>
                        </div>
                        <div className={`${styles.importStat} ${styles.success}`}>
                          <span className={styles.importStatLabel}>{t('importResult.statsSuccess')}</span>
                          <span className={styles.importStatValue}>{importResults.success || importResults.imported}</span>
                        </div>
                        {importResults.failed > 0 && (
                          <div className={`${styles.importStat} ${styles.failed}`}>
                            <span className={styles.importStatLabel}>{t('importResult.statsFailed')}</span>
                            <span className={styles.importStatValue}>{importResults.failed}</span>
                          </div>
                        )}
                      </div>
                      
                      {importResults.errors && importResults.errors.length > 0 && (
                        <div className={styles.importErrors}>
                          <p className={styles.importErrorsTitle}>{t('validation.errorsList')}</p>
                          <ul className={styles.importErrorsList}>
                            {importResults.errors.slice(0, 3).map((error, index) => (
                              <li key={index} className={styles.importErrorItem}>{error}</li>
                            ))}
                          </ul>
                          {importResults.errors.length > 3 && (
                            <p className={styles.importErrorsMore}>
                              {t('importResult.moreErrors')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`${styles.modalActions} ${styles.center}`}>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleCloseModal}>
                      {t('modal.done')}
                    </button>
                  </div>
                </>
              )}

              {importResults.type === 'error' && (
                      <>
                        <div className={`${styles.importResult} ${styles.error}`}>
                          <div className={styles.importResultIcon}>❌</div>
                          <div className={styles.importResultContent}>
                            <h3>{t('importResult.error')}</h3>
                            <p>{importResults.message}</p>
                            {importResults.limits && (
                              <div className={styles.limitInfo}>
                                <p className={styles.limitInfoText}>
                                  {t('import.spaceCheckErrorWithLimit', { 
                                    current: importResults.limits.current,
                                    max: importResults.limits.max
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={`${styles.modalActions} ${styles.center}`}>
                          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleCloseModal}>
                            {t('modal.close')}
                          </button>
                        </div>
                      </>
                    )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
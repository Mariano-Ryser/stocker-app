import { useState, useEffect } from 'react';
import ExcelImportExport from '../../../components/ui/ExcelImportExport';
import ExcelTemplateButton from '../../../components/ui/ExcelTemplate';
import { useProduct } from '../../../hooks/useProducts';
import { useSalesForImport } from '../../../hooks/useSalesForImport';
import { useBulkImport } from '../../../services/bulkImportService';
import styles from './ImportExportPage.module.css';



export default function ImportExportPage() {
  // Estados para selección de tipo
  const [dataType, setDataType] = useState('products');
  const [importResults, setImportResults] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedData, setImportedData] = useState([]);


  // Estados para productos
  const {
    products,
    loading: productsLoading,
    error: productsError,
    refreshProducts
  } = useProduct();
  
  // Estados para facturas
  const {
    sales,
    loading: salesLoading,
    error: salesError,
    refreshSales
  } = useSalesForImport();
  
  const { 
    bulkImportProducts, 
    validateProducts 
  } = useBulkImport();

  useEffect(() => {
    if (productsError) console.error('Error loading products:', productsError);
    if (salesError) console.error('Error loading sales:', salesError);
  }, [productsError, salesError]);

  const currentData = dataType === 'sales' ? sales : products;
  const currentLoading = dataType === 'sales' ? salesLoading : productsLoading;
  const dataTypeLabel = dataType === 'sales' ? 'Verkäufe' : 'Produkte';
  const showImport = dataType === 'products';

  const handleImport = async (importedData) => {
    if (dataType === 'sales') {
      alert('Import für Verkäufe ist nicht verfügbar. Nur Export möglich.');
      return;
    }

    try {
      console.log('=== HANDLE IMPORT START ===');
      console.log('Imported data count:', importedData.length);
      
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
        alert('Keine gültigen Produkte zum Importieren gefunden.');
        return;
      }

      console.log(`Importing ${validation.valid.length} valid products...`);
      
      const result = await bulkImportProducts(validation.valid);
      console.log('Import result:', result);
      
      const importedCount = result.imported || result.success || 0;
      const totalCount = result.total || validation.valid.length;
      const failedCount = totalCount - importedCount;
      
      setImportResults({
        type: 'import',
        dataType: 'products',
        success: importedCount,
        failed: failedCount,
        imported: importedCount,
        total: totalCount,
        errors: result.errors || [],
        message: result.message || `${importedCount} von ${totalCount} Produkten erfolgreich importiert`
      });
      
      setShowImportModal(true);

      if (importedCount > 0) {
        console.log(`Import successful for ${importedCount} products, refreshing data...`);
        setTimeout(() => {
          refreshProducts();
        }, 800);
      }

    } catch (error) {
      console.error('=== IMPORT ERROR ===');
      console.error('Error details:', error);
      
      setImportResults({
        type: 'error',
        dataType: 'products',
        message: error.message || 'Unbekannter Fehler beim Import'
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
        alert('Keine gültigen Produkte zum Importieren');
        return;
      }

      const result = await bulkImportProducts(validData);
      
      const importedCount = result.imported || result.success || 0;
      const totalCount = result.total || validData.length;
      const failedCount = totalCount - importedCount;

      setImportResults({
        type: 'import',
        dataType: 'products',
        success: importedCount,
        failed: failedCount,
        imported: importedCount,
        total: totalCount,
        message: result.message || `${importedCount} von ${totalCount} Produkten erfolgreich importiert`
      });

      if (importedCount > 0) {
        setTimeout(() => {
          refreshProducts();
        }, 800);
      }

    } catch (error) {
      setImportResults({
        type: 'error',
        dataType: 'products',
        message: error.message
      });
    }
  };

  const handleCloseModal = () => {
    setShowImportModal(false);
    setImportResults(null);
    setImportedData([]);
  };

  return (
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.headerTitle}>Excel Import & Export</h1>
            <p className={styles.headerSubtitle}>
              Verwalten Sie {dataTypeLabel} effizient – {dataType === 'sales' ? 'Exportieren Sie Verkaufsdaten' : 'Importieren und exportieren Sie Produktdaten'}
            </p>
          </div>
          
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
                <span className={styles.typeBtnText}>Produkte</span>
                <span className={styles.typeBtnBadge}>Import/Export</span>
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
                <span className={styles.typeBtnText}>Verkäufe</span>
                <span className={styles.typeBtnBadge}>Nur Export</span>
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
              <div className={styles.statCardLabel}>{dataTypeLabel}</div>
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
              <div className={styles.statCardLabel}>Status</div>
              <div className={`${styles.statCardStatus} ${currentLoading ? styles.loading : styles.ready}`}>
                {currentLoading ? 'Lädt...' : 'Bereit'}
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
              <div className={styles.statCardLabel}>Funktionen</div>
              <div className={styles.statCardMode}>
                {dataType === 'products' ? 'Import & Export' : 'Nur Export'}
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
                <h2 className={styles.cardTitle}>Vorlage herunterladen</h2>
                <p className={styles.cardSubtitle}>
                  {dataType === 'sales' 
                    ? 'Exportvorlage für Verkaufsdaten' 
                    : 'Importvorlage für konsistente Produktdaten'}
                </p>
              </div>
            </div>

            <div className={styles.cardContent}>
              <ExcelTemplateButton type={dataType} />

              <div className={styles.templateInfo}>
                <h3 className={styles.templateTitle}>
                  <span className={styles.templateTitleIcon}>📋</span>
                  Format für {dataTypeLabel}:
                </h3>
                {dataType === 'products' ? (
                  <ul className={styles.templateList}>
                    <li className={styles.templateItem}>
                      <span className={styles.templateItemLabel}>Artikelnummer</span>
                      <span className={styles.templateItemHint}>eindeutig (optional)</span>
                    </li>
                    <li className={styles.templateItem}>
                      <span className={styles.templateItemLabel}>
                        Artikelname
                        <span className={styles.requiredBadge}>Pflicht</span>
                      </span>
                      <span className={styles.templateItemHint}>Produktbezeichnung</span>
                    </li>
                    <li className={styles.templateItem}>
                      <span className={styles.templateItemLabel}>Lagerplatz</span>
                      <span className={styles.templateItemHint}>z.B. A-01</span>
                    </li>
                    <li className={styles.templateItem}>
                      <span className={styles.templateItemLabel}>Lagerbestand</span>
                      <span className={styles.templateItemHint}>Zahl ≥ 0</span>
                    </li>
                    <li className={styles.templateItem}>
                      <span className={styles.templateItemLabel}>Preis (CHF)</span>
                      <span className={styles.templateItemHint}>ohne Währungssymbol</span>
                    </li>
                    <li className={styles.templateItem}>
                      <span className={styles.templateItemLabel}>Bild-URL</span>
                      <span className={styles.templateItemHint}>Link zum Produktbild</span>
                    </li>
                    <li className={styles.templateItem}>
                      <span className={styles.templateItemLabel}>Gelöscht</span>
                      <span className={styles.templateItemHint}>Ja/Nein</span>
                    </li>
                  </ul>
                ) : (
                  <ul className={styles.templateList}>
                    <li className={styles.templateItem}>
                      <span className={styles.templateItemLabel}>Lieferschein Nr.</span>
                      <span className={styles.templateItemHint}>eindeutige Nummer</span>
                    </li>
                    <li className={styles.templateItem}>
                      <span className={styles.templateItemLabel}>Kunde</span>
                      <span className={styles.templateItemHint}>Name des Kunden</span>
                    </li>
                    <li className={styles.templateItem}>
                      <span className={styles.templateItemLabel}>
                        Artikelname
                        <span className={styles.requiredBadge}>Pflicht</span>
                      </span>
                      <span className={styles.templateItemHint}>verkauftes Produkt</span>
                    </li>
                    <li className={styles.templateItem}>
                      <span className={styles.templateItemLabel}>Menge</span>
                      <span className={styles.templateItemHint}>verkaufte Anzahl</span>
                    </li>
                    <li className={styles.templateItem}>
                      <span className={styles.templateItemLabel}>Einzelpreis (CHF)</span>
                      <span className={styles.templateItemHint}>Preis pro Einheit</span>
                    </li>
                    <li className={styles.templateItem}>
                      <span className={styles.templateItemLabel}>Status</span>
                      <span className={styles.templateItemHint}>pending/paid/cancelled</span>
                    </li>
                    <li className={styles.templateItem}>
                      <span className={styles.templateItemLabel}>Total (CHF)</span>
                      <span className={styles.templateItemHint}>Gesamtbetrag</span>
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
                  {dataType === 'sales' ? 'Export' : 'Import & Export'}
                </h2>
                <p className={styles.cardSubtitle}>
                  {dataType === 'sales' 
                    ? 'Verkaufsdaten exportieren' 
                    : 'Daten austauschen und verwalten'}
                </p>
              </div>
            </div>

            <div className={styles.cardContent}>
              <ExcelImportExport 
                data={currentData}
                onImport={handleImport}
                filename={dataTypeLabel}
                disabled={currentLoading}
                showImport={showImport}
                showExport={true}
                type={dataType}
              />

              <div className={styles.actionsInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoItemIcon}>📄</span>
                  <span className={styles.infoItemText}>Unterstützt: .xlsx, .xls, .csv</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoItemIcon}>⚡</span>
                  <span className={styles.infoItemText}>Bis zu 10.000 Datensätze</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoItemIcon}>🔄</span>
                  <span className={styles.infoItemText}>
                    {dataType === 'products' 
                      ? 'Gleiches Format für Import/Export' 
                      : 'Exportformat kompatibel mit Excel'}
                  </span>
                </div>
                {dataType === 'sales' && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoItemIcon}>📊</span>
                    <span className={styles.infoItemText}>Enthält alle Verkaufsdetails</span>
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
                    {importResults.type === 'validation' ? 'Validierungsergebnis' :
                     importResults.type === 'import' ? 'Import abgeschlossen' :
                     'Fehler'}
                  </h2>
                  <p className={styles.modalSubtitle}>
                    {importResults.dataType === 'sales' ? 'Verkäufe' : 'Produkte'}
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
                        <div className={styles.validationLabel}>Gültig</div>
                      </div>
                      <div className={`${styles.validationBox} ${styles.error}`}>
                        <div className={styles.validationCount}>{importResults.invalid}</div>
                        <div className={styles.validationLabel}>Ungültig</div>
                      </div>
                    </div>

                    {importResults.errors.length > 0 && (
                      <div className={styles.errorListContainer}>
                        <div className={styles.errorListHeader}>
                          <h4>Fehlerdetails</h4>
                          <span className={styles.errorCount}>({importResults.errors.length} Fehler)</span>
                        </div>
                        <div className={styles.errorList}>
                          {importResults.errors.slice(0, 8).map((e, i) => (
                            <div key={i} className={styles.errorItem}>
                              <div className={styles.errorItemHeader}>
                                <span className={styles.errorRow}>Zeile {e.row || e.index + 2}</span>
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
                        Nur gültige importieren
                      </button>
                      <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleCloseModal}>
                        Abbrechen
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
                          {importResults.failed > 0 ? 'Import mit Warnungen' : 'Erfolgreich importiert'}
                        </h3>
                        <p className={styles.importResultMessage}>
                          {importResults.message || `${importResults.imported || importResults.success} von ${importResults.total || (importResults.success + importResults.failed)} Produkten erfolgreich importiert`}
                        </p>
                        
                        {/* Mostrar estadísticas detalladas */}
                        <div className={styles.importStats}>
                          <div className={styles.importStat}>
                            <span className={styles.importStatLabel}>Insgesamt:</span>
                            <span className={styles.importStatValue}>{importResults.total || (importResults.success + importResults.failed)}</span>
                          </div>
                          <div className={`${styles.importStat} ${styles.success}`}>
                            <span className={styles.importStatLabel}>Erfolgreich:</span>
                            <span className={styles.importStatValue}>{importResults.imported || importResults.success}</span>
                          </div>
                          {importResults.failed > 0 && (
                            <div className={`${styles.importStat} ${styles.failed}`}>
                              <span className={styles.importStatLabel}>Fehlgeschlagen:</span>
                              <span className={styles.importStatValue}>{importResults.failed}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Mostrar errores si los hay */}
                        {importResults.errors && importResults.errors.length > 0 && (
                          <div className={styles.importErrors}>
                            <p className={styles.importErrorsTitle}>Fehlerdetails:</p>
                            <ul className={styles.importErrorsList}>
                              {importResults.errors.slice(0, 3).map((error, index) => (
                                <li key={index} className={styles.importErrorItem}>{error}</li>
                              ))}
                            </ul>
                            {importResults.errors.length > 3 && (
                              <p className={styles.importErrorsMore}>
                                ... und {importResults.errors.length - 3} weitere Fehler
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`${styles.modalActions} ${styles.center}`}>
                      <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleCloseModal}>
                        Fertig
                      </button>
                    </div>
                  </>
                )}

                {importResults.type === 'error' && (
                  <>
                    <div className={`${styles.importResult} ${styles.error}`}>
                      <div className={styles.importResultIcon}>❌</div>
                      <div className={styles.importResultContent}>
                        <h3>Fehler beim Import</h3>
                        <p>{importResults.message}</p>
                      </div>
                    </div>

                    <div className={`${styles.modalActions} ${styles.center}`}>
                      <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleCloseModal}>
                        Schliessen
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
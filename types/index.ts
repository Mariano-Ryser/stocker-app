// ============================================
// TIPOS COMPARTIDOS PARA TODO EL PROYECTO
// ============================================

// ============ USER ============
export interface User {
  _id: string;
  email: string;
  password?: string; // Solo para crear/actualizar
  name: string;
  role: 'user' | 'admin' | 'ceo';
  plan: 'basic' | 'medium' | 'pro' | 'premium'; // Agregué premium por si acaso
  company: string;
  companyId: string | null;
  maxUsers: number;
  createdUsers: number;
  isActive: boolean;
  createdBy: string | null;
  createdAt?: string;
  updatedAt?: string;
  
  // Métodos (si usas clases en el frontend)
  comparePassword?: (candidatePassword: string) => Promise<boolean>;
}

// ============ CLIENT ============
export interface Client {
  _id: string;
  name: string;
  vorname: string;
  email?: string;
  adresse?: string;
  phone?: string;
  deleted: boolean;
  
  // Relaciones
  user: string; // User ID
  companyId: string; // User ID (empresa)
  
  // Random client
  isRandomClient: boolean;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// ============ PRODUCT ============
export interface Product {
  _id: string;
  artikelName: string;
  lagerPlatz?: string;
  artikelNumber?: string;
  description?: string;
  publicId: string;
  imagen?: string;
  stock: number;
  price: number;
  
  // Productos con vencimiento
  hasExpiration: boolean;
  expirationDate?: string; // Date en string (ISO)
  batchNumber?: string;
  productionDate?: string; // Date en string (ISO)
  
  // Tracking de productos perecederos
  daysBeforeExpiration?: number;
  expirationStatus: 'good' | 'warning' | 'expired' | 'unknown';
  
  deleted: boolean;
  
  // Relaciones
  user: string; // User ID
  companyId: string; // User ID (empresa)
  userName?: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// ============ SALE ITEM ============
export interface SaleItem {
  _id?: string;
  product: string; // Product ID
  artikelName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

// ============ SALE ============
export interface Sale {
  _id: string;
  client: string; // Client ID
  clientSnapshot: Record<string, any>;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  lieferschein?: string;
  
  // Relaciones
  user: string; // User ID
  companyId: string; // User ID (empresa)
  userName?: string;
  
  // Metadata
  meta: {
    hasRandomClient?: boolean;
    paymentMethod?: string;
    notes?: string;
    [key: string]: any;
  };
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// ============ RESPONSE TYPES ============
export interface ApiResponse<T = any> {
  ok: boolean;
  message?: string;
  data?: T;
}

// Para paginación
export interface PaginatedResponse<T> {
  ok: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ============ DASHBOARD STATS ============
export interface SalesStats {
  paidCount: number;
  cancelledCount: number;
  pendingCount: number;
  totalUmsatz: number;
  durchschnitt: number;
  totalAllSales: number;
  [key: string]: any;
}

export interface ClientsStats {
  total: number;
  newThisMonth?: number;
  [key: string]: any;
}

export interface ProductsStats {
  total: number;
  totalInventoryValue: number;
  lowStockCount?: number;
  expiredCount?: number;
  [key: string]: any;
}

export interface DashboardStats {
  produkte: number;
  kunden: number;
  verkäufe: number;
  umsatz: number;
  durchschnitt: number;
  cancelledCount: number;
  pendingCount: number;
}

// ============ FORM TYPES ============
export interface ClientFormData {
  name: string;
  vorname: string;
  email?: string;
  adresse?: string;
  phone?: string;
}

export interface ProductFormData {
  artikelName: string;
  lagerPlatz?: string;
  artikelNumber?: string;
  description?: string;
  stock: number | string;
  price: number | string;
  imagen?: File | null;
  
  // Productos con vencimiento
  hasExpiration?: boolean;
  expirationDate?: string;
  batchNumber?: string;
  productionDate?: string;
  daysBeforeExpiration?: number;
}

export interface SaleFormData {
  client: string;
  items: Array<{
    product: string;
    quantity: number;
    unitPrice: number;
  }>;
  tax?: number;
  status?: 'pending' | 'paid' | 'cancelled';
  lieferschein?: string;
  meta?: Record<string, any>;
}

// ============ AUTH TYPES ============
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  company: string;
  role?: 'user' | 'admin' | 'ceo';
  plan?: 'basic' | 'medium' | 'pro';
}

// ============ CONTEXT TYPES ============
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<ApiResponse>;
  register: (data: RegisterData) => Promise<ApiResponse>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<ApiResponse>;
}

export interface DashboardContextType {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  refreshAllData: (refreshFunctions?: Array<() => Promise<any>>) => Promise<void>;
}

// ============ HOOK RETURN TYPES ============
export interface UseProductsReturn {
  product: ProductFormData;
  products: Product[];
  totalProducts: number;
  totalInventoryValue: number;
  loading: boolean;
  error: string | null;
  fetchProducts: (forceRefresh?: boolean) => Promise<void>;
  refreshProducts: () => void;
  createProduct: (e: React.FormEvent) => Promise<ApiResponse>;
  updateProduct: (e: React.FormEvent, product: Product) => Promise<ApiResponse>;
  deleteProduct: (id: string) => Promise<ApiResponse>;
  deleteProductImage: (id: string) => Promise<ApiResponse>;
  setProductToEdit: (product: Product) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setError: (error: string | null) => void;
  isAuthenticated: boolean;
}

export interface UseClientsReturn {
  clients: Client[];
  clientsStats: ClientsStats;
  loading: boolean;
  error: string | null;
  fetchClients: (forceRefresh?: boolean) => Promise<void>;
  fetchClientsStats: () => Promise<void>;
  refreshClients: () => void;
  createClient: (client: ClientFormData) => Promise<ApiResponse<{ client: Client }>>;
  editClient: (id: string, clientData: ClientFormData) => Promise<ApiResponse<{ client: Client }>>;
  deleteClient: (id: string) => Promise<ApiResponse>;
  setError: (error: string | null) => void;
  isAuthenticated: boolean;
}

export interface UseSalesReturn {
  sales: Sale[];
  salesStats: SalesStats;
  loading: boolean;
  error: string | null;
  fetchSales: (forceRefresh?: boolean) => Promise<void>;
  refreshSales: () => void;
  createSale: (payload: SaleFormData) => Promise<ApiResponse<{ sale: Sale }>>;
  updateSale: (id: string, payload: Partial<SaleFormData>) => Promise<ApiResponse<{ sale: Sale }>>;
  deleteSale: (id: string) => Promise<ApiResponse>;
  isAuthenticated: boolean;
}

// ============ COMPONENT PROPS ============
export interface QuickStatsProps {
  compact?: boolean;
  sales?: Sale[];
  loading?: boolean;
}

export interface SalesChartProps {
  sales?: Sale[];
  loading?: boolean;
}

// ============ UTILITY TYPES ============
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type Nullable<T> = { [K in keyof T]: T[K] | null };
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;


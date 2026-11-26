import type { PaymentMethod, UserRole } from "@wellspring/shared";
import type { CustomerType } from "@/lib/sales";

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId: string | null;
  branchName: string;
}

export interface ProductRecord {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  cost: number;
  stock: number;
  reorderPoint: number;
  batch: string;
  expiry: string;
  prescription: boolean;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface SaleLineRecord extends CartLine {
  productName: string;
  sku: string;
  unitPrice: number;
  lineTotal: number;
}

export interface SaleRecord {
  id: string;
  receiptNumber: string;
  createdAt: string;
  cashier: string;
  customerType: CustomerType;
  paymentMethod: PaymentMethod;
  items: SaleLineRecord[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  cashTendered?: number;
  change?: number;
  paymentReference?: string;
  offline: boolean;
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  supplier: string;
  createdAt: string;
  expectedDate: string;
  status: "DRAFT" | "SENT" | "RECEIVED";
  total: number;
  items: Array<{ productId: string; productName: string; quantity: number; unitCost: number }>;
}

export interface AdminUserRecord extends DemoUser {
  active: boolean;
  lastLogin: string;
}

export interface OfflineOperation {
  id: string;
  label: string;
  createdAt: string;
  sale: SaleRecord;
}

export interface StockMovementRecord {
  id: string;
  productId: string;
  productName: string;
  type: "SALE" | "RECEIPT" | "ADJUSTMENT";
  quantity: number;
  balance: number;
  reason: string;
  actor: string;
  createdAt: string;
}

export interface AuditRecord {
  id: string;
  action: string;
  detail: string;
  actor: string;
  createdAt: string;
}

export interface CheckoutInput {
  lines: CartLine[];
  customerType: CustomerType;
  paymentMethod: PaymentMethod;
  cashTendered?: number;
  paymentReference?: string;
  prescriptionConfirmed: boolean;
}

export interface PurchaseOrderInput {
  supplier: string;
  expectedDate: string;
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface NewUserInput {
  name: string;
  email: string;
  role: UserRole;
  branchName: string;
}

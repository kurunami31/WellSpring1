import { PaymentMethod, UserRole } from "@wellspring/shared";
import type { AdminUserRecord, DemoUser, ProductRecord, PurchaseOrderRecord, SaleRecord } from "@/types/prototype";

export const DEMO_PASSWORD = "password123";
export const MAIN_BRANCH_ID = "branch-ws01";

export const DEMO_USERS: DemoUser[] = [
  { id: "u-admin", email: "admin@wellspring.ph", name: "Christopher Mercado", role: UserRole.SYSTEM_ADMIN, branchId: null, branchName: "All branches" },
  { id: "u-ho", email: "ho.manager@wellspring.ph", name: "Bianca Benaldo", role: UserRole.HEAD_OFFICE_MANAGER, branchId: null, branchName: "Head office" },
  { id: "u-manager", email: "branch1.mgr@wellspring.ph", name: "Rick Perez", role: UserRole.BRANCH_MANAGER, branchId: MAIN_BRANCH_ID, branchName: "WS01 · Davao Main" },
  { id: "u-cashier", email: "cashier1@wellspring.ph", name: "Frankie Pelayo", role: UserRole.CASHIER, branchId: MAIN_BRANCH_ID, branchName: "WS01 · Davao Main" },
  { id: "u-pharmacist", email: "pharmacist1@wellspring.ph", name: "Mave Ancog", role: UserRole.PHARMACIST, branchId: MAIN_BRANCH_ID, branchName: "WS01 · Davao Main" },
  { id: "u-inventory", email: "inventory1@wellspring.ph", name: "Mark Punto", role: UserRole.INVENTORY_STAFF, branchId: MAIN_BRANCH_ID, branchName: "WS01 · Davao Main" },
  { id: "u-purchasing", email: "purchasing1@wellspring.ph", name: "Asaph Ildefonso", role: UserRole.PURCHASING_OFFICER, branchId: MAIN_BRANCH_ID, branchName: "WS01 · Davao Main" },
  { id: "u-supervisor", email: "supervisor1@wellspring.ph", name: "Jannel Pondoyo", role: UserRole.STORE_SUPERVISOR, branchId: MAIN_BRANCH_ID, branchName: "WS01 · Davao Main" },
];

export const INITIAL_PRODUCTS: ProductRecord[] = [
  { id: "p-amox", sku: "AMOX-500", barcode: "4801234500012", name: "Amoxicillin 500 mg capsule", category: "Prescription", unit: "capsule", price: 12.5, cost: 7.8, stock: 48, reorderPoint: 40, batch: "AMX-26-014", expiry: "2027-04-30", prescription: true },
  { id: "p-para", sku: "PARA-500", barcode: "4801234500029", name: "Paracetamol 500 mg tablet", category: "OTC medicine", unit: "tablet", price: 6.5, cost: 3.75, stock: 184, reorderPoint: 50, batch: "PAR-26-091", expiry: "2027-08-31", prescription: false },
  { id: "p-vitc", sku: "VITC-500", barcode: "4801234500036", name: "Vitamin C 500 mg tablet", category: "Vitamins", unit: "tablet", price: 9.75, cost: 5.5, stock: 26, reorderPoint: 30, batch: "VTC-26-033", expiry: "2027-02-28", prescription: false },
  { id: "p-bioflu", sku: "BIOFLU", barcode: "4801234500043", name: "Bioflu tablet", category: "OTC medicine", unit: "tablet", price: 8.25, cost: 4.9, stock: 12, reorderPoint: 40, batch: "BFL-26-008", expiry: "2026-12-20", prescription: false },
  { id: "p-alcohol", sku: "ALC-70-500", barcode: "4801234500050", name: "Isopropyl alcohol 70% · 500 ml", category: "Personal care", unit: "bottle", price: 89, cost: 52, stock: 64, reorderPoint: 20, batch: "ALC-26-117", expiry: "2028-06-30", prescription: false },
  { id: "p-mask", sku: "MASK-50", barcode: "4801234500067", name: "Surgical face mask · 50 pieces", category: "Medical supplies", unit: "box", price: 149, cost: 90, stock: 8, reorderPoint: 15, batch: "MSK-26-072", expiry: "2029-01-31", prescription: false },
  { id: "p-losartan", sku: "LOSA-50", barcode: "4801234500074", name: "Losartan 50 mg tablet", category: "Prescription", unit: "tablet", price: 14.5, cost: 8.2, stock: 40, reorderPoint: 25, batch: "LOS-26-045", expiry: "2027-06-30", prescription: true },
  { id: "p-cet", sku: "CET-10", barcode: "4801234500081", name: "Cetirizine 10 mg tablet", category: "OTC medicine", unit: "tablet", price: 7.25, cost: 3.9, stock: 96, reorderPoint: 20, batch: "CET-26-063", expiry: "2027-10-31", prescription: false },
];

function daysFromNow(days: number, hour = 10): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 30, 0, 0);
  return date.toISOString();
}

export const INITIAL_SALES: SaleRecord[] = [
  { id: "s-1001", receiptNumber: "WS-2026-01001", createdAt: daysFromNow(0, 9), cashier: "Frankie Pelayo", customerType: "REGULAR", paymentMethod: PaymentMethod.CASH, items: [{ productId: "p-para", productName: "Paracetamol 500 mg tablet", sku: "PARA-500", quantity: 4, unitPrice: 6.5, lineTotal: 29.12 }], subtotal: 26, discount: 0, vat: 3.12, total: 29.12, offline: false },
  { id: "s-1002", receiptNumber: "WS-2026-01002", createdAt: daysFromNow(0, 8), cashier: "Frankie Pelayo", customerType: "SENIOR", paymentMethod: PaymentMethod.CASH, items: [{ productId: "p-losartan", productName: "Losartan 50 mg tablet", sku: "LOSA-50", quantity: 10, unitPrice: 14.5, lineTotal: 116 }], subtotal: 145, discount: 29, vat: 0, total: 116, offline: false },
  { id: "s-1003", receiptNumber: "WS-2026-01003", createdAt: daysFromNow(-1, 16), cashier: "Frankie Pelayo", customerType: "REGULAR", paymentMethod: PaymentMethod.E_WALLET, items: [{ productId: "p-alcohol", productName: "Isopropyl alcohol 70% · 500 ml", sku: "ALC-70-500", quantity: 2, unitPrice: 89, lineTotal: 199.36 }], subtotal: 178, discount: 0, vat: 21.36, total: 199.36, offline: false },
  { id: "s-1004", receiptNumber: "WS-2026-01004", createdAt: daysFromNow(-1, 13), cashier: "Frankie Pelayo", customerType: "REGULAR", paymentMethod: PaymentMethod.CARD, items: [{ productId: "p-mask", productName: "Surgical face mask · 50 pieces", sku: "MASK-50", quantity: 1, unitPrice: 149, lineTotal: 166.88 }], subtotal: 149, discount: 0, vat: 17.88, total: 166.88, offline: false },
  { id: "s-1005", receiptNumber: "WS-2026-01005", createdAt: daysFromNow(-2, 11), cashier: "Frankie Pelayo", customerType: "PWD", paymentMethod: PaymentMethod.CASH, items: [{ productId: "p-vitc", productName: "Vitamin C 500 mg tablet", sku: "VITC-500", quantity: 10, unitPrice: 9.75, lineTotal: 78 }], subtotal: 97.5, discount: 19.5, vat: 0, total: 78, offline: false },
  { id: "s-1006", receiptNumber: "WS-2026-01006", createdAt: daysFromNow(-3, 15), cashier: "Frankie Pelayo", customerType: "REGULAR", paymentMethod: PaymentMethod.CASH, items: [{ productId: "p-cet", productName: "Cetirizine 10 mg tablet", sku: "CET-10", quantity: 6, unitPrice: 7.25, lineTotal: 48.72 }], subtotal: 43.5, discount: 0, vat: 5.22, total: 48.72, offline: false },
  { id: "s-1007", receiptNumber: "WS-2026-01007", createdAt: daysFromNow(-4, 12), cashier: "Frankie Pelayo", customerType: "REGULAR", paymentMethod: PaymentMethod.E_WALLET, items: [{ productId: "p-bioflu", productName: "Bioflu tablet", sku: "BIOFLU", quantity: 5, unitPrice: 8.25, lineTotal: 46.2 }], subtotal: 41.25, discount: 0, vat: 4.95, total: 46.2, offline: false },
  { id: "s-1008", receiptNumber: "WS-2026-01008", createdAt: daysFromNow(-5, 10), cashier: "Frankie Pelayo", customerType: "REGULAR", paymentMethod: PaymentMethod.CASH, items: [{ productId: "p-para", productName: "Paracetamol 500 mg tablet", sku: "PARA-500", quantity: 8, unitPrice: 6.5, lineTotal: 58.24 }], subtotal: 52, discount: 0, vat: 6.24, total: 58.24, offline: false },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrderRecord[] = [
  { id: "po-001", poNumber: "PO-2026-0041", supplier: "Pharma Supply Inc.", createdAt: daysFromNow(-2), expectedDate: daysFromNow(3).slice(0, 10), status: "SENT", total: 23400, items: [{ productId: "p-bioflu", productName: "Bioflu tablet", quantity: 4000, unitCost: 4.9 }, { productId: "p-mask", productName: "Surgical face mask · 50 pieces", quantity: 42, unitCost: 90 }] },
  { id: "po-002", poNumber: "PO-2026-0040", supplier: "MediCore Distributors", createdAt: daysFromNow(-6), expectedDate: daysFromNow(-1).slice(0, 10), status: "RECEIVED", total: 12500, items: [{ productId: "p-vitc", productName: "Vitamin C 500 mg tablet", quantity: 2000, unitCost: 5.5 }, { productId: "p-cet", productName: "Cetirizine 10 mg tablet", quantity: 500, unitCost: 3 }] },
  { id: "po-003", poNumber: "PO-2026-0042", supplier: "Pharma Supply Inc.", createdAt: daysFromNow(0), expectedDate: daysFromNow(5).slice(0, 10), status: "DRAFT", total: 3120, items: [{ productId: "p-amox", productName: "Amoxicillin 500 mg capsule", quantity: 400, unitCost: 7.8 }] },
];

export const INITIAL_ADMIN_USERS: AdminUserRecord[] = DEMO_USERS.map((user, index) => ({
  ...user,
  active: index !== 7,
  lastLogin: daysFromNow(-(index % 4), 8 + (index % 5)),
}));

export const SUPPLIERS = ["Pharma Supply Inc.", "MediCore Distributors", "HealthPoint Trading"];

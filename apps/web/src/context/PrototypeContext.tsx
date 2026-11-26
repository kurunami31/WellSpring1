import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { BUSINESS_RULES, PaymentMethod, UserRole } from "@wellspring/shared";
import { useAuth } from "@/context/AuthContext";
import {
  INITIAL_ADMIN_USERS,
  INITIAL_PRODUCTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_SALES,
  MAIN_BRANCH_ID,
} from "@/data/demo";
import { calculateChange, calculateSaleTotals } from "@/lib/sales";
import type {
  AdminUserRecord,
  AuditRecord,
  CheckoutInput,
  NewUserInput,
  OfflineOperation,
  ProductRecord,
  PurchaseOrderInput,
  PurchaseOrderRecord,
  SaleRecord,
  StockMovementRecord,
} from "@/types/prototype";

interface PrototypeState {
  products: ProductRecord[];
  sales: SaleRecord[];
  purchaseOrders: PurchaseOrderRecord[];
  adminUsers: AdminUserRecord[];
  offlineQueue: OfflineOperation[];
  stockMovements: StockMovementRecord[];
  auditLog: AuditRecord[];
}

interface PrototypeContextValue extends PrototypeState {
  isOnline: boolean;
  lastSyncedAt: string;
  setOnline: (online: boolean) => void;
  completeSale: (input: CheckoutInput) => SaleRecord;
  adjustStock: (productId: string, actualQuantity: number, reason: string) => void;
  createPurchaseOrder: (input: PurchaseOrderInput) => PurchaseOrderRecord;
  sendPurchaseOrder: (id: string) => void;
  receivePurchaseOrder: (id: string) => void;
  addUser: (input: NewUserInput) => void;
  toggleUser: (id: string) => void;
  syncQueue: () => number;
  resetDemo: () => void;
}

const STORAGE_KEY = "wellspring-prototype-v1";
const PrototypeContext = createContext<PrototypeContextValue | undefined>(undefined);

function initialState(): PrototypeState {
  return {
    products: INITIAL_PRODUCTS.map((product) => ({ ...product })),
    sales: INITIAL_SALES.map((sale) => ({ ...sale, items: sale.items.map((item) => ({ ...item })) })),
    purchaseOrders: INITIAL_PURCHASE_ORDERS.map((order) => ({
      ...order,
      items: order.items.map((item) => ({ ...item })),
    })),
    adminUsers: INITIAL_ADMIN_USERS.map((user) => ({ ...user })),
    offlineQueue: [],
    stockMovements: [],
    auditLog: [
      {
        id: "audit-seed-1",
        action: "Purchase order received",
        detail: "PO-2026-0040 · MediCore Distributors",
        actor: "Mark Punto",
        createdAt: new Date(Date.now() - 86_400_000).toISOString(),
      },
      {
        id: "audit-seed-2",
        action: "Stock count approved",
        detail: "PARA-500 · no variance",
        actor: "Rick Perez",
        createdAt: new Date(Date.now() - 172_800_000).toISOString(),
      },
      {
        id: "audit-seed-3",
        action: "User role reviewed",
        detail: "Quarterly branch access review completed",
        actor: "Christopher Mercado",
        createdAt: new Date(Date.now() - 259_200_000).toISOString(),
      },
    ],
  };
}

function loadState(): PrototypeState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState();
    const parsed = JSON.parse(stored) as Partial<PrototypeState>;
    if (!Array.isArray(parsed.products) || !Array.isArray(parsed.sales)) return initialState();
    return { ...initialState(), ...parsed };
  } catch {
    return initialState();
  }
}

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<PrototypeState>(loadState);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => new Date().toISOString());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const actor = user?.name ?? "Demo user";

  const setOnline = useCallback((online: boolean) => {
    setIsOnline(online);
  }, []);

  const completeSale = useCallback((input: CheckoutInput): SaleRecord => {
    if (!user) throw new Error("Sign in before completing a sale.");
    if (input.lines.length === 0) throw new Error("Add at least one item before checkout.");

    const lines = input.lines.map((line) => {
      const product = state.products.find((candidate) => candidate.id === line.productId);
      if (!product) throw new Error("A product in the cart is no longer available.");
      if (!Number.isInteger(line.quantity) || line.quantity < 1) {
        throw new Error(`Enter a whole-number quantity for ${product.name}.`);
      }
      if (line.quantity > product.stock) {
        throw new Error(`Only ${product.stock} ${product.unit}(s) of ${product.name} are available.`);
      }
      return { product, quantity: line.quantity };
    });

    if (lines.some(({ product }) => product.prescription) && !input.prescriptionConfirmed) {
      throw new Error("Confirm that the pharmacist checked the prescription before payment.");
    }
    if ((input.paymentMethod === PaymentMethod.CARD || input.paymentMethod === PaymentMethod.E_WALLET) && !input.paymentReference?.trim()) {
      throw new Error("Enter the card or e-wallet authorization reference.");
    }

    const totals = calculateSaleTotals(
      lines.map(({ product, quantity }) => ({
        unitPrice: product.price,
        quantity,
        discountPerUnit: 0,
        taxRate: BUSINESS_RULES.VAT_RATE,
      })),
      input.customerType,
    );
    const change = input.paymentMethod === PaymentMethod.CASH
      ? calculateChange(input.cashTendered ?? 0, totals.total)
      : 0;

    const sequence = Math.max(
      1000,
      ...state.sales.map((sale) => Number(sale.receiptNumber.split("-").at(-1)) || 0),
    ) + 1;
    const createdAt = new Date().toISOString();
    const sale: SaleRecord = {
      id: id("sale"),
      receiptNumber: `WS-${new Date().getFullYear()}-${String(sequence).padStart(5, "0")}`,
      createdAt,
      cashier: actor,
      customerType: input.customerType,
      paymentMethod: input.paymentMethod,
      items: lines.map(({ product, quantity }) => {
        const subtotal = product.price * quantity;
        const exempt = input.customerType === "SENIOR" || input.customerType === "PWD";
        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          quantity,
          unitPrice: product.price,
          lineTotal: Math.round((exempt ? subtotal * 0.8 : subtotal * 1.12) * 100) / 100,
        };
      }),
      ...totals,
      cashTendered: input.paymentMethod === PaymentMethod.CASH ? input.cashTendered : undefined,
      change: input.paymentMethod === PaymentMethod.CASH ? change : undefined,
      paymentReference: input.paymentReference?.trim() || undefined,
      offline: !isOnline,
    };

    setState((current) => {
      const movements: StockMovementRecord[] = [];
      const products = current.products.map((product) => {
        const line = lines.find((candidate) => candidate.product.id === product.id);
        if (!line) return product;
        const balance = product.stock - line.quantity;
        movements.push({
          id: id("movement"),
          productId: product.id,
          productName: product.name,
          type: "SALE",
          quantity: -line.quantity,
          balance,
          reason: sale.receiptNumber,
          actor,
          createdAt,
        });
        return { ...product, stock: balance };
      });
      return {
        ...current,
        products,
        sales: [sale, ...current.sales],
        offlineQueue: isOnline ? current.offlineQueue : [
          {
            id: id("sync"),
            label: `${sale.receiptNumber} · ${sale.items.length} line item${sale.items.length === 1 ? "" : "s"}`,
            createdAt,
            sale,
          },
          ...current.offlineQueue,
        ],
        stockMovements: [...movements, ...current.stockMovements],
        auditLog: [{
          id: id("audit"),
          action: isOnline ? "Sale completed" : "Offline sale queued",
          detail: `${sale.receiptNumber} · ₱${sale.total.toFixed(2)}`,
          actor,
          createdAt,
        }, ...current.auditLog],
      };
    });
    return sale;
  }, [actor, isOnline, state.products, state.sales, user]);

  const adjustStock = useCallback((productId: string, actualQuantity: number, reason: string) => {
    const product = state.products.find((candidate) => candidate.id === productId);
    if (!product) throw new Error("Select a product to adjust.");
    if (!Number.isInteger(actualQuantity) || actualQuantity < 0) {
      throw new Error("Counted stock must be a whole number of zero or more.");
    }
    if (!reason.trim()) throw new Error("Select or enter a reason for the adjustment.");
    const variance = actualQuantity - product.stock;
    const createdAt = new Date().toISOString();
    setState((current) => ({
      ...current,
      products: current.products.map((item) => item.id === productId ? { ...item, stock: actualQuantity } : item),
      stockMovements: [{
        id: id("movement"),
        productId,
        productName: product.name,
        type: "ADJUSTMENT",
        quantity: variance,
        balance: actualQuantity,
        reason,
        actor,
        createdAt,
      }, ...current.stockMovements],
      auditLog: [{
        id: id("audit"),
        action: "Stock count recorded",
        detail: `${product.sku} · ${variance >= 0 ? "+" : ""}${variance} · ${reason}`,
        actor,
        createdAt,
      }, ...current.auditLog],
    }));
  }, [actor, state.products]);

  const createPurchaseOrder = useCallback((input: PurchaseOrderInput): PurchaseOrderRecord => {
    const product = state.products.find((candidate) => candidate.id === input.productId);
    if (!product) throw new Error("Select a product for the purchase order.");
    if (!input.supplier || !input.expectedDate) throw new Error("Choose a supplier and expected delivery date.");
    if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new Error("Order quantity must be at least one.");
    if (!Number.isFinite(input.unitCost) || input.unitCost <= 0) throw new Error("Unit cost must be greater than zero.");
    const sequence = Math.max(42, ...state.purchaseOrders.map((order) => Number(order.poNumber.split("-").at(-1)) || 0)) + 1;
    const order: PurchaseOrderRecord = {
      id: id("po"),
      poNumber: `PO-${new Date().getFullYear()}-${String(sequence).padStart(4, "0")}`,
      supplier: input.supplier,
      createdAt: new Date().toISOString(),
      expectedDate: input.expectedDate,
      status: "DRAFT",
      total: Math.round(input.quantity * input.unitCost * 100) / 100,
      items: [{ productId: product.id, productName: product.name, quantity: input.quantity, unitCost: input.unitCost }],
    };
    setState((current) => ({
      ...current,
      purchaseOrders: [order, ...current.purchaseOrders],
      auditLog: [{
        id: id("audit"), action: "Purchase order drafted", detail: `${order.poNumber} · ${order.supplier}`,
        actor, createdAt: order.createdAt,
      }, ...current.auditLog],
    }));
    return order;
  }, [actor, state.products, state.purchaseOrders]);

  const sendPurchaseOrder = useCallback((orderId: string) => {
    const order = state.purchaseOrders.find((candidate) => candidate.id === orderId);
    if (!order || order.status !== "DRAFT") throw new Error("Only draft orders can be sent for fulfillment.");
    setState((current) => ({
      ...current,
      purchaseOrders: current.purchaseOrders.map((item) => item.id === orderId ? { ...item, status: "SENT" } : item),
      auditLog: [{ id: id("audit"), action: "Purchase order approved", detail: order.poNumber, actor, createdAt: new Date().toISOString() }, ...current.auditLog],
    }));
  }, [actor, state.purchaseOrders]);

  const receivePurchaseOrder = useCallback((orderId: string) => {
    const order = state.purchaseOrders.find((candidate) => candidate.id === orderId);
    if (!order || order.status !== "SENT") throw new Error("Only sent orders can be received.");
    const createdAt = new Date().toISOString();
    setState((current) => {
      const movements: StockMovementRecord[] = [];
      const products = current.products.map((product) => {
        const received = order.items.find((item) => item.productId === product.id);
        if (!received) return product;
        const balance = product.stock + received.quantity;
        movements.push({
          id: id("movement"), productId: product.id, productName: product.name, type: "RECEIPT",
          quantity: received.quantity, balance, reason: order.poNumber, actor, createdAt,
        });
        return { ...product, stock: balance };
      });
      return {
        ...current,
        products,
        purchaseOrders: current.purchaseOrders.map((item) => item.id === orderId ? { ...item, status: "RECEIVED" } : item),
        stockMovements: [...movements, ...current.stockMovements],
        auditLog: [{ id: id("audit"), action: "Goods received", detail: `${order.poNumber} · stock updated`, actor, createdAt }, ...current.auditLog],
      };
    });
  }, [actor, state.purchaseOrders]);

  const addUser = useCallback((input: NewUserInput) => {
    if (!input.name.trim() || !/^\S+@\S+\.\S+$/.test(input.email)) throw new Error("Enter a name and a valid email address.");
    if (state.adminUsers.some((candidate) => candidate.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("A user with that email already exists.");
    }
    const createdAt = new Date().toISOString();
    const newUser: AdminUserRecord = {
      id: id("user"), name: input.name.trim(), email: input.email.trim(), role: input.role,
      branchId: input.role === UserRole.SYSTEM_ADMIN || input.role === UserRole.HEAD_OFFICE_MANAGER ? null : MAIN_BRANCH_ID,
      branchName: input.branchName, active: true, lastLogin: createdAt,
    };
    setState((current) => ({
      ...current,
      adminUsers: [...current.adminUsers, newUser],
      auditLog: [{ id: id("audit"), action: "User account created", detail: `${newUser.email} · ${newUser.role}`, actor, createdAt }, ...current.auditLog],
    }));
  }, [actor, state.adminUsers]);

  const toggleUser = useCallback((userId: string) => {
    if (userId === user?.id) throw new Error("You cannot deactivate your own account.");
    const account = state.adminUsers.find((candidate) => candidate.id === userId);
    if (!account) return;
    setState((current) => ({
      ...current,
      adminUsers: current.adminUsers.map((item) => item.id === userId ? { ...item, active: !item.active } : item),
      auditLog: [{
        id: id("audit"), action: account.active ? "User account deactivated" : "User account activated",
        detail: account.email, actor, createdAt: new Date().toISOString(),
      }, ...current.auditLog],
    }));
  }, [actor, state.adminUsers, user?.id]);

  const syncQueue = useCallback((): number => {
    if (!isOnline) throw new Error("Reconnect before synchronizing the offline queue.");
    const count = state.offlineQueue.length;
    if (count === 0) return 0;
    const syncedIds = new Set(state.offlineQueue.map((operation) => operation.sale.id));
    const createdAt = new Date().toISOString();
    setState((current) => ({
      ...current,
      sales: current.sales.map((sale) => syncedIds.has(sale.id) ? { ...sale, offline: false } : sale),
      offlineQueue: [],
      auditLog: [{ id: id("audit"), action: "Offline queue synchronized", detail: `${count} sale${count === 1 ? "" : "s"} uploaded without duplicates`, actor, createdAt }, ...current.auditLog],
    }));
    setLastSyncedAt(createdAt);
    return count;
  }, [actor, isOnline, state.offlineQueue]);

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(initialState());
    setIsOnline(true);
    setLastSyncedAt(new Date().toISOString());
  }, []);

  const value = useMemo(() => ({
    ...state, isOnline, lastSyncedAt, setOnline, completeSale, adjustStock, createPurchaseOrder,
    sendPurchaseOrder, receivePurchaseOrder, addUser, toggleUser, syncQueue, resetDemo,
  }), [state, isOnline, lastSyncedAt, setOnline, completeSale, adjustStock, createPurchaseOrder, sendPurchaseOrder, receivePurchaseOrder, addUser, toggleUser, syncQueue, resetDemo]);

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}

export function usePrototype() {
  const context = useContext(PrototypeContext);
  if (!context) throw new Error("usePrototype must be used within PrototypeProvider");
  return context;
}

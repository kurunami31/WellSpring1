import { useMemo, useState, type FormEvent } from "react";
import { Check, ChevronDown, ChevronUp, Plus, Send, Truck, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePrototype } from "@/context/PrototypeContext";
import { EmptyState, Metric, PageHeader, StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { SUPPLIERS } from "@/data/demo";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PurchaseOrderRecord } from "@/types/prototype";

export default function PurchasingPage() {
  const { hasPermission } = useAuth();
  const { products, purchaseOrders, createPurchaseOrder, sendPurchaseOrder, receivePurchaseOrder } = usePrototype();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [supplier, setSupplier] = useState(SUPPLIERS[0]);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("100");
  const [unitCost, setUnitCost] = useState(String(products[0]?.cost ?? 0));
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const [expectedDate, setExpectedDate] = useState(tomorrow);
  const [error, setError] = useState("");
  const canCreate = hasPermission("purchasing:create_po");
  const canApprove = hasPermission("purchasing:approve_po");
  const canReceive = hasPermission("purchasing:grn");

  const filtered = useMemo(() => statusFilter === "ALL" ? purchaseOrders : purchaseOrders.filter((order) => order.status === statusFilter), [purchaseOrders, statusFilter]);
  const outstanding = purchaseOrders.filter((order) => order.status !== "RECEIVED").reduce((sum, order) => sum + order.total, 0);
  const awaiting = purchaseOrders.filter((order) => order.status === "SENT").length;
  const drafts = purchaseOrders.filter((order) => order.status === "DRAFT").length;
  const selectedProduct = products.find((product) => product.id === productId);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const order = createPurchaseOrder({ supplier, productId, quantity: Number(quantity), unitCost: Number(unitCost), expectedDate });
      toast({ variant: "success", title: `${order.poNumber} saved as draft`, description: "A manager can now approve it for supplier fulfillment." });
      setShowForm(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create this purchase order.");
    }
  };

  const perform = (order: PurchaseOrderRecord, action: "SEND" | "RECEIVE") => {
    try {
      if (action === "SEND") {
        sendPurchaseOrder(order.id);
        toast({ variant: "success", title: `${order.poNumber} approved and sent`, description: `${order.supplier} can now fulfill the order.` });
      } else {
        receivePurchaseOrder(order.id);
        toast({ variant: "success", title: `${order.poNumber} received`, description: "Ordered quantities were added to the branch stock ledger." });
      }
    } catch (caught) {
      toast({ variant: "error", title: "Purchase order was not updated", description: caught instanceof Error ? caught.message : "Try again." });
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Supplier desk · Procurement" title="Purchasing" description="Draft a supplier order, obtain branch approval, and receive goods into the same stock ledger used by the point of sale." actions={<Button onClick={() => setShowForm(!showForm)} disabled={!canCreate}>{showForm ? <X aria-hidden="true" className="mr-2 h-4 w-4" /> : <Plus aria-hidden="true" className="mr-2 h-4 w-4" />}{showForm ? "Close draft" : "New purchase order"}</Button>} />
      {!canCreate && <p className="mb-5 border-l-4 border-[#2563a8] bg-[#e3f0fa] px-4 py-3 text-sm text-[#2563a8]">Only purchasing officers and administrators can draft orders. Your available approval and receiving actions appear on each order.</p>}
      <section className="mb-6 grid gap-5 border-y border-[#cbdce5] py-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Purchasing summary">
        <Metric label="Open order value" value={formatCurrency(outstanding)} note="Draft and sent orders" />
        <Metric label="Awaiting delivery" value={String(awaiting)} note="Sent to a supplier" />
        <Metric label="Drafts for approval" value={String(drafts)} note="Not yet sent" />
        <Metric label="Active suppliers" value={String(SUPPLIERS.length)} note="Approved supplier directory" />
      </section>

      {showForm && <section className="mb-6 border-l-4 border-[#087f8c] bg-white p-5" aria-labelledby="new-po-title">
        <p className="eyebrow">New supplier order</p><h2 id="new-po-title" className="section-title mt-1">Draft one-line purchase order</h2><p className="meta mt-1">The prototype keeps the form focused: one product per order, with an auditable approval and receipt.</p>
        <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2"><label className="field-label" htmlFor="po-supplier">Supplier</label><select id="po-supplier" className="select-input" value={supplier} onChange={(event) => setSupplier(event.target.value)}>{SUPPLIERS.map((name) => <option key={name}>{name}</option>)}</select></div>
          <div className="xl:col-span-2"><label className="field-label" htmlFor="po-product">Product</label><select id="po-product" className="select-input" value={productId} onChange={(event) => { setProductId(event.target.value); const product = products.find((item) => item.id === event.target.value); if (product) setUnitCost(String(product.cost)); }}>{products.map((product) => <option key={product.id} value={product.id}>{product.sku} · {product.name}</option>)}</select></div>
          <div><label className="field-label" htmlFor="po-date">Expected date</label><input id="po-date" className="text-input" type="date" min={tomorrow} required value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} /></div>
          <div><label className="field-label" htmlFor="po-quantity">Quantity</label><input id="po-quantity" className="text-input" type="number" min="1" step="1" required value={quantity} onChange={(event) => setQuantity(event.target.value)} /></div>
          <div><label className="field-label" htmlFor="po-cost">Unit cost (₱)</label><input id="po-cost" className="text-input" type="number" min="0.01" step="0.01" required value={unitCost} onChange={(event) => setUnitCost(event.target.value)} /></div>
          <div className="flex items-end"><p className="flex min-h-11 items-center text-sm text-[#486581]">Current stock: <strong className="ml-1 text-[#102a43]">{selectedProduct?.stock ?? 0}</strong></p></div>
          <div className="xl:col-span-2 xl:flex xl:items-end xl:justify-end"><Button type="submit">Save draft order</Button></div>
          <div className="border-t border-[#cbdce5] pt-4 md:col-span-2 xl:col-span-5"><p className="text-sm text-[#486581]">Order total: <strong className="ml-2 font-display text-xl text-[#102a43]">{formatCurrency(Number(quantity) * Number(unitCost) || 0)}</strong></p>{error && <p role="alert" className="mt-2 text-sm text-[#a12c2c]">{error}</p>}</div>
        </form>
      </section>}

      <section aria-labelledby="orders-title">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 id="orders-title" className="section-title">Purchase order register</h2><p className="meta mt-1">Select an order to inspect its line items and total.</p></div><div><label className="sr-only" htmlFor="po-filter">Filter purchase orders</label><select id="po-filter" className="select-input min-w-44" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">All order statuses</option><option value="DRAFT">Draft</option><option value="SENT">Sent</option><option value="RECEIVED">Received</option></select></div></div>
        <div className="panel divide-y divide-[#cbdce5] overflow-hidden">
          {filtered.length === 0 ? <EmptyState title="No orders in this view" description="Choose another status or draft a new supplier order." action={<Button variant="outline" onClick={() => setStatusFilter("ALL")}>Show all orders</Button>} /> : filtered.map((order) => {
            const isExpanded = expanded === order.id;
            return <article key={order.id}>
              <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
                <button type="button" onClick={() => setExpanded(isExpanded ? null : order.id)} aria-expanded={isExpanded} className="flex min-w-0 flex-1 items-start gap-3 rounded text-left">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#e5f5f1]"><Truck aria-hidden="true" className="h-4 w-4 text-[#087f8c]" /></span>
                  <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><strong className="text-sm">{order.poNumber}</strong><StatusBadge status={order.status} /></span><span className="mt-1 block text-sm text-[#486581]">{order.supplier}</span><span className="mt-1 block text-xs text-[#486581]">Expected {formatDate(order.expectedDate)} · {order.items.length} line{order.items.length === 1 ? "" : "s"}</span></span>
                </button>
                <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end"><strong className="min-w-28 text-right text-sm">{formatCurrency(order.total)}</strong><div className="flex gap-2">
                  {order.status === "DRAFT" && <Button size="sm" onClick={() => perform(order, "SEND")} disabled={!canApprove} title={!canApprove ? "Branch or head-office manager approval required" : undefined}><Send aria-hidden="true" className="mr-1.5 h-4 w-4" />Approve & send</Button>}
                  {order.status === "SENT" && <Button size="sm" onClick={() => perform(order, "RECEIVE")} disabled={!canReceive} title={!canReceive ? "Inventory staff or purchasing officer required" : undefined}><Check aria-hidden="true" className="mr-1.5 h-4 w-4" />Receive goods</Button>}
                  {order.status === "RECEIVED" && <span className="inline-flex min-h-11 items-center text-xs text-[#486581]">Stock updated</span>}
                  <button type="button" onClick={() => setExpanded(isExpanded ? null : order.id)} className="inline-flex h-11 w-11 items-center justify-center rounded hover:bg-[#e5f5f1]" aria-label={isExpanded ? `Collapse ${order.poNumber}` : `Expand ${order.poNumber}`}>{isExpanded ? <ChevronUp aria-hidden="true" className="h-4 w-4" /> : <ChevronDown aria-hidden="true" className="h-4 w-4" />}</button>
                </div></div>
              </div>
              {isExpanded && <div className="border-t border-dashed border-[#cbdce5] bg-[#f2f7fa] px-4 py-4 sm:px-16"><table className="w-full border-collapse text-sm"><thead><tr className="text-left text-xs text-[#486581]"><th className="pb-2" scope="col">Product</th><th className="pb-2 text-right" scope="col">Quantity</th><th className="pb-2 text-right" scope="col">Unit cost</th><th className="pb-2 text-right" scope="col">Line total</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.productId} className="border-t border-[#cbdce5]"><td className="py-3 pr-3 font-semibold">{item.productName}</td><td className="py-3 text-right">{item.quantity}</td><td className="py-3 text-right">{formatCurrency(item.unitCost)}</td><td className="py-3 text-right">{formatCurrency(item.quantity * item.unitCost)}</td></tr>)}</tbody></table><p className="mt-2 text-xs text-[#486581]">Created {formatDate(order.createdAt)} · Receiving adds every listed quantity to current stock once only.</p></div>}
            </article>;
          })}
        </div>
      </section>
    </div>
  );
}

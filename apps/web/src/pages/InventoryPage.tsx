import { useMemo, useState, type FormEvent } from "react";
import { ClipboardCheck, Package, Search, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePrototype } from "@/context/PrototypeContext";
import { EmptyState, Metric, PageHeader, StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { ProductRecord } from "@/types/prototype";

type StockFilter = "ALL" | "LOW" | "EXPIRING" | "OUT";

function daysUntil(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(`${date}T00:00:00`).getTime() - today.getTime()) / 86_400_000);
}

function stockStatus(product: ProductRecord): string {
  if (product.stock === 0) return "OUT OF STOCK";
  if (daysUntil(product.expiry) < 0) return "EXPIRED";
  if (daysUntil(product.expiry) <= 90) return "EXPIRING";
  if (product.stock <= product.reorderPoint) return "LOW STOCK";
  return "IN STOCK";
}

export default function InventoryPage() {
  const { hasPermission } = useAuth();
  const { products, stockMovements, adjustStock } = usePrototype();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StockFilter>("ALL");
  const [selected, setSelected] = useState<ProductRecord | null>(null);
  const [actualQuantity, setActualQuantity] = useState("");
  const [reason, setReason] = useState("Cycle count correction");
  const [error, setError] = useState("");
  const canAdjust = hasPermission("inventory:adjust") || hasPermission("inventory:count");

  const filtered = useMemo(() => products.filter((product) => {
    const term = query.trim().toLowerCase();
    const matchesQuery = !term || [product.name, product.sku, product.batch, product.category].some((value) => value.toLowerCase().includes(term));
    const status = stockStatus(product);
    const matchesFilter = filter === "ALL" || (filter === "LOW" && status === "LOW STOCK") || (filter === "EXPIRING" && ["EXPIRING", "EXPIRED"].includes(status)) || (filter === "OUT" && status === "OUT OF STOCK");
    return matchesQuery && matchesFilter;
  }), [filter, products, query]);

  const stockValue = products.reduce((sum, product) => sum + product.stock * product.cost, 0);
  const lowCount = products.filter((product) => product.stock <= product.reorderPoint).length;
  const expiringCount = products.filter((product) => daysUntil(product.expiry) <= 90).length;
  const units = products.reduce((sum, product) => sum + product.stock, 0);

  const openAdjustment = (product: ProductRecord) => {
    setSelected(product);
    setActualQuantity(String(product.stock));
    setReason("Cycle count correction");
    setError("");
  };

  const submitAdjustment = (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setError("");
    try {
      adjustStock(selected.id, Number(actualQuantity), reason);
      toast({ variant: "success", title: `${selected.sku} stock updated`, description: `The counted balance is ${actualQuantity}. An audit record and stock movement were saved.` });
      setSelected(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save this stock count.");
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Stock ledger · Batch tracking" title="Inventory" description="Review available units, reorder levels, batches, and expiry dates. Record a physical count to correct the ledger with a traceable reason." />
      <section className="mb-6 grid gap-5 border-y border-[#cbdce5] py-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Inventory summary">
        <Metric label="Units on hand" value={units.toLocaleString()} note={`${products.length} active product records`} />
        <Metric label="Stock at cost" value={formatCurrency(stockValue)} note="Current branch valuation" />
        <Metric label="At reorder point" value={String(lowCount)} note="Review for the next purchase order" />
        <Metric label="Expiry watch" value={String(expiringCount)} note="Expired or due within 90 days" />
      </section>

      {selected && <section className="mb-6 border-l-4 border-[#087f8c] bg-white p-5 shadow-[0_1px_2px_rgb(16_42_67/0.05)]" aria-labelledby="count-title">
        <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Physical stock count</p><h2 id="count-title" className="section-title mt-1">{selected.name}</h2><p className="meta mt-1">{selected.sku} · Batch {selected.batch} · System balance {selected.stock}</p></div><button type="button" onClick={() => setSelected(null)} className="inline-flex h-11 w-11 items-center justify-center rounded hover:bg-[#e5f5f1]" aria-label="Close stock count"><X aria-hidden="true" className="h-5 w-5" /></button></div>
        <form onSubmit={submitAdjustment} className="mt-5 grid items-end gap-4 md:grid-cols-[12rem_minmax(0,1fr)_auto]">
          <div><label className="field-label" htmlFor="actual-quantity">Counted units</label><input id="actual-quantity" className="text-input" type="number" min="0" step="1" required value={actualQuantity} onChange={(event) => setActualQuantity(event.target.value)} /></div>
          <div><label className="field-label" htmlFor="count-reason">Reason</label><select id="count-reason" className="select-input" value={reason} onChange={(event) => setReason(event.target.value)}><option>Cycle count correction</option><option>Damaged stock</option><option>Expired stock removed</option><option>Transfer discrepancy</option><option>Other verified variance</option></select></div>
          <Button type="submit"><ClipboardCheck aria-hidden="true" className="mr-2 h-4 w-4" />Save count</Button>
          {error && <p role="alert" className="text-sm text-[#a12c2c] md:col-span-3">{error}</p>}
          {Number(actualQuantity) !== selected.stock && <p className="text-xs text-[#486581] md:col-span-3">This will record a variance of <strong>{Number(actualQuantity) - selected.stock >= 0 ? "+" : ""}{Number(actualQuantity) - selected.stock}</strong> units. The previous balance remains in the audit trail.</p>}
        </form>
      </section>}

      <section aria-labelledby="stock-list-title">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div><h2 id="stock-list-title" className="section-title">Branch stock ledger</h2><p className="meta mt-1">Available quantity excludes committed stock.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div><label className="sr-only" htmlFor="stock-filter">Filter stock status</label><select id="stock-filter" className="select-input min-w-40" value={filter} onChange={(event) => setFilter(event.target.value as StockFilter)}><option value="ALL">All stock statuses</option><option value="LOW">Low stock</option><option value="EXPIRING">Expiry watch</option><option value="OUT">Out of stock</option></select></div>
            <div className="relative"><label className="sr-only" htmlFor="inventory-search">Search inventory</label><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#6b8299]" /><input id="inventory-search" className="text-input pl-10 sm:w-72" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Product, SKU, or batch" /></div>
          </div>
        </div>
        <div className="table-shell">
          {filtered.length === 0 ? <EmptyState title="No stock records found" description="Try a different product name or clear the status filter." action={<Button variant="outline" onClick={() => { setQuery(""); setFilter("ALL"); }}>Clear filters</Button>} /> : <table className="data-table min-w-[900px]">
            <caption className="sr-only">Current branch inventory with batch and expiry details</caption>
            <thead><tr><th scope="col">Product</th><th scope="col">Batch / expiry</th><th scope="col" className="text-right">Available</th><th scope="col" className="text-right">Reorder at</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{filtered.map((product) => {
              const days = daysUntil(product.expiry);
              return <tr key={product.id}>
                <td><p className="font-semibold text-[#102a43]">{product.name}</p><p className="mt-1 text-xs text-[#486581]">{product.sku} · {product.category}</p></td>
                <td><p>{product.batch}</p><p className={`mt-1 text-xs ${days <= 90 ? "font-semibold text-[#855b13]" : "text-[#486581]"}`}>{formatDate(product.expiry)}{days >= 0 && days <= 90 ? ` · ${days} days` : days < 0 ? " · expired" : ""}</p></td>
                <td className="text-right"><strong className="text-base text-[#102a43]">{product.stock}</strong><p className="text-xs text-[#486581]">{product.unit}{product.stock === 1 ? "" : "s"}</p></td>
                <td className="text-right">{product.reorderPoint}</td><td><StatusBadge status={stockStatus(product)} /></td>
                <td className="text-right"><Button variant="outline" size="sm" onClick={() => openAdjustment(product)} disabled={!canAdjust}>{canAdjust ? "Count / adjust" : "Read only"}</Button></td>
              </tr>;
            })}</tbody>
          </table>}
        </div>
        {!canAdjust && <p className="mt-3 text-xs text-[#486581]">Your role can review batch records but cannot change stock balances.</p>}
      </section>

      <section className="mt-8" aria-labelledby="movement-title">
        <div className="mb-4 flex items-center gap-2"><Package aria-hidden="true" className="h-5 w-5 text-[#087f8c]" /><div><h2 id="movement-title" className="section-title">Recent stock movements</h2><p className="meta mt-1">Sales, receipts, and approved count corrections in this demo session.</p></div></div>
        <div className="table-shell">{stockMovements.length === 0 ? <EmptyState title="No new movements yet" description="Complete a sale, receive a sent purchase order, or save a stock count. The movement will appear here." /> : <table className="data-table min-w-[760px]"><thead><tr><th scope="col">Date</th><th scope="col">Product</th><th scope="col">Type / reference</th><th scope="col" className="text-right">Change</th><th scope="col" className="text-right">Balance</th><th scope="col">Recorded by</th></tr></thead><tbody>{stockMovements.slice(0, 8).map((movement) => <tr key={movement.id}><td>{formatDateTime(movement.createdAt)}</td><td className="font-semibold text-[#102a43]">{movement.productName}</td><td>{movement.type}<p className="text-xs text-[#486581]">{movement.reason}</p></td><td className={`text-right font-semibold ${movement.quantity < 0 ? "text-[#a12c2c]" : "text-[#087f8c]"}`}>{movement.quantity >= 0 ? "+" : ""}{movement.quantity}</td><td className="text-right">{movement.balance}</td><td>{movement.actor}</td></tr>)}</tbody></table>}</div>
      </section>
    </div>
  );
}

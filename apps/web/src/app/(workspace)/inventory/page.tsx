import { TwoToneHeader } from "@soustools/design-system";

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-8 p-8 h-full bg-background text-foreground">
      <TwoToneHeader title="Inventory Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card text-card-foreground border border-border dark:border-border p-6 rounded-2xl hover:border-primary/50 transition-colors shadow-sm">
          <h2 className="text-xl font-bold mb-2 uppercase tracking-wide">Items</h2>
          <p className="text-muted-foreground text-sm">View and manage your master ingredient list.</p>
        </div>
        <div className="bg-card text-card-foreground border border-border dark:border-border p-6 rounded-2xl hover:border-primary/50 transition-colors shadow-sm">
          <h2 className="text-xl font-bold mb-2 uppercase tracking-wide">Orders</h2>
          <p className="text-muted-foreground text-sm">Track and create purchase orders.</p>
        </div>
        <div className="bg-card text-card-foreground border border-border dark:border-border p-6 rounded-2xl hover:border-primary/50 transition-colors shadow-sm">
          <h2 className="text-xl font-bold mb-2 uppercase tracking-wide">Vendors</h2>
          <p className="text-muted-foreground text-sm">Manage your suppliers and vendor catalog.</p>
        </div>
      </div>
    </div>
  );
}

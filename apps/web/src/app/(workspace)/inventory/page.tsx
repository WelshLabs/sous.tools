export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-8 p-8 h-full bg-background text-foreground">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-widest">Inventory</h1>
        <p className="text-muted-foreground font-medium">Manage your inventory, suppliers, and purchase orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card text-card-foreground border border-black/5 dark:border-white/10 p-6 rounded-2xl hover:border-primary/50 transition-colors shadow-sm">
          <h2 className="text-xl font-bold mb-2 uppercase tracking-wide">Items</h2>
          <p className="text-muted-foreground text-sm">View and manage your master ingredient list.</p>
        </div>
        <div className="bg-card text-card-foreground border border-black/5 dark:border-white/10 p-6 rounded-2xl hover:border-primary/50 transition-colors shadow-sm">
          <h2 className="text-xl font-bold mb-2 uppercase tracking-wide">Orders</h2>
          <p className="text-muted-foreground text-sm">Track and create purchase orders.</p>
        </div>
        <div className="bg-card text-card-foreground border border-black/5 dark:border-white/10 p-6 rounded-2xl hover:border-primary/50 transition-colors shadow-sm">
          <h2 className="text-xl font-bold mb-2 uppercase tracking-wide">Vendors</h2>
          <p className="text-muted-foreground text-sm">Manage your suppliers and vendor catalog.</p>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-8 p-8 h-full bg-zinc-950">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-widest">Inventory</h1>
        <p className="text-zinc-400 font-medium">Manage your inventory, suppliers, and purchase orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-sky-500/50 transition-colors">
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Items</h2>
          <p className="text-zinc-400 text-sm">View and manage your master ingredient list.</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-violet-500/50 transition-colors">
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Orders</h2>
          <p className="text-zinc-400 text-sm">Track and create purchase orders.</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-colors">
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Vendors</h2>
          <p className="text-zinc-400 text-sm">Manage your suppliers and vendor catalog.</p>
        </div>
      </div>
    </div>
  );
}

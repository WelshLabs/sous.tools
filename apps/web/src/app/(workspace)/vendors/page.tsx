"use client";

import { useEffect, useState } from "react";
import { Vendor } from "@soustools/api-types";
import { toast } from "sonner";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [orderMethod, setOrderMethod] = useState<"EMAIL" | "SMS" | "MANUAL">("EMAIL");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/vendors");
      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.data) {
          setVendors(payload.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch vendors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          order_method: orderMethod,
          email,
          phone,
        }),
      });
      const payload = await res.json();
      if (payload.success) {
        toast.success("Vendor added");
        setName("");
        setEmail("");
        setPhone("");
        fetchVendors();
      } else {
        toast.error(payload.error || "Failed to add vendor");
      }
    } catch (err) {
      toast.error("Failed to add vendor");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/vendors/${id}`, { method: "DELETE" });
      const payload = await res.json();
      if (payload.success) {
        toast.success("Vendor deleted");
        fetchVendors();
      } else {
        toast.error(payload.error || "Failed to delete vendor");
      }
    } catch (err) {
      toast.error("Failed to delete vendor");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Vendors</h1>
        <p className="text-gray-500 mt-2">Manage your suppliers and procurement contacts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <form onSubmit={handleAdd} className="glass-panel p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Add Vendor</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor Name</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-md p-2 text-white" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Order Method</label>
              <select value={orderMethod} onChange={e => setOrderMethod(e.target.value as any)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-md p-2 text-white">
                <option value="EMAIL">Email</option>
                <option value="SMS">Text Message</option>
                <option value="MANUAL">Manual / Phone Call</option>
              </select>
            </div>

            {orderMethod === "EMAIL" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-md p-2 text-white" />
              </div>
            )}

            {orderMethod === "SMS" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Phone Number</label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-md p-2 text-white" />
              </div>
            )}

            <button type="submit" className="w-full bg-white text-black py-2 rounded-md font-medium hover:bg-gray-200 transition-colors mt-4">
              Save Vendor
            </button>
          </form>
        </div>

        <div className="md:col-span-2">
          {loading ? (
            <div className="h-32 flex items-center justify-center text-white/50">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="glass-panel p-12 text-center text-white/50">No vendors found.</div>
          ) : (
            <div className="space-y-4">
              {vendors.map(v => (
                <div key={v.id} className="glass-panel p-6 flex justify-between items-center group">
                  <div>
                    <h3 className="text-xl font-bold">{v.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Method: {v.order_method} 
                      {v.email && ` • ${v.email}`}
                      {v.phone && ` • ${v.phone}`}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(v.id)} className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

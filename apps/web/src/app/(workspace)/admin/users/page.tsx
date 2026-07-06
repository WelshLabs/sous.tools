import React from "react";
import { TwoToneHeader } from "@soustools/design-system";

export default function AdminUsersPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full h-full">
      <div className="mb-8">
        <TwoToneHeader title="Admin Users" breadcrumb="Manage user roles and permissions." />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-sm">
                <th className="pb-3 px-4 font-medium">Name</th>
                <th className="pb-3 px-4 font-medium">Email</th>
                <th className="pb-3 px-4 font-medium">Role</th>
                <th className="pb-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50 hover:bg-accent/20">
                <td className="py-4 px-4 text-zinc-300 font-medium">Conar Welsh</td>
                <td className="py-4 px-4 text-muted-foreground">conar@soustools.com</td>
                <td className="py-4 px-4 text-muted-foreground">
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-wider">Superadmin</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="px-3 py-1.5 bg-accent hover:bg-accent text-zinc-300 rounded-lg text-sm font-semibold transition-colors border border-border">
                    Edit
                  </button>
                </td>
              </tr>
              <tr className="border-b border-border/50 hover:bg-accent/20">
                <td className="py-4 px-4 text-zinc-300 font-medium">Demo Chef</td>
                <td className="py-4 px-4 text-muted-foreground">chef@demo.com</td>
                <td className="py-4 px-4 text-muted-foreground">
                  <span className="px-2.5 py-1 rounded-md bg-accent text-muted-foreground text-xs font-semibold uppercase tracking-wider">User</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="px-3 py-1.5 bg-accent hover:bg-accent text-zinc-300 rounded-lg text-sm font-semibold transition-colors border border-border">
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

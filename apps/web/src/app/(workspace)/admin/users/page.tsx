import React from "react";
import { TwoToneHeader } from "@soustools/design-system";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto h-full w-full max-w-6xl p-8">
      <div className="mb-8">
        <TwoToneHeader
          title="Admin Users"
          breadcrumb="Manage user roles and permissions."
        />
      </div>

      <div className="bg-card border-border rounded-2xl border p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-sm">
                <th className="px-4 pb-3 font-medium">Name</th>
                <th className="px-4 pb-3 font-medium">Email</th>
                <th className="px-4 pb-3 font-medium">Role</th>
                <th className="px-4 pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-border/50 hover:bg-accent/20 border-b">
                <td className="px-4 py-4 font-medium text-zinc-300">
                  Conar Welsh
                </td>
                <td className="text-muted-foreground px-4 py-4">
                  conar@soustools.com
                </td>
                <td className="text-muted-foreground px-4 py-4">
                  <span className="rounded-md bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                    Superadmin
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="bg-accent hover:bg-accent border-border rounded-lg border px-3 py-1.5 text-sm font-semibold text-zinc-300 transition-colors">
                    Edit
                  </button>
                </td>
              </tr>
              <tr className="border-border/50 hover:bg-accent/20 border-b">
                <td className="px-4 py-4 font-medium text-zinc-300">
                  Demo Chef
                </td>
                <td className="text-muted-foreground px-4 py-4">
                  chef@demo.com
                </td>
                <td className="text-muted-foreground px-4 py-4">
                  <span className="bg-accent text-muted-foreground rounded-md px-2.5 py-1 text-xs font-semibold tracking-wider uppercase">
                    User
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="bg-accent hover:bg-accent border-border rounded-lg border px-3 py-1.5 text-sm font-semibold text-zinc-300 transition-colors">
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

import React from "react";

export default function AdminUsersPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto w-full h-full">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-black text-white uppercase tracking-widest">Admin Users</h1>
        <p className="text-zinc-400 font-medium">Manage user roles and permissions.</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-sm">
                <th className="pb-3 px-4 font-medium">Name</th>
                <th className="pb-3 px-4 font-medium">Email</th>
                <th className="pb-3 px-4 font-medium">Role</th>
                <th className="pb-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                <td className="py-4 px-4 text-zinc-300 font-medium">Conar Welsh</td>
                <td className="py-4 px-4 text-zinc-400">conar@soustools.com</td>
                <td className="py-4 px-4 text-zinc-400">
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-wider">Superadmin</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-semibold transition-colors border border-zinc-700">
                    Edit
                  </button>
                </td>
              </tr>
              <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                <td className="py-4 px-4 text-zinc-300 font-medium">Demo Chef</td>
                <td className="py-4 px-4 text-zinc-400">chef@demo.com</td>
                <td className="py-4 px-4 text-zinc-400">
                  <span className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wider">User</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-semibold transition-colors border border-zinc-700">
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

"use client";

import { useState } from "react";
import { AdminUsersView, type AdminUser } from "./AdminUsers.view";

export interface AdminUsersProps {
  initialUsers?: AdminUser[];
}

const DEFAULT_USERS: AdminUser[] = [
  {
    id: "user-1",
    name: "Conar Welsh",
    email: "conar@soustools.com",
    role: "Superadmin",
  },
  {
    id: "user-2",
    name: "Demo Chef",
    email: "chef@demo.com",
    role: "User",
  },
];

export function AdminUsersContainer({
  initialUsers = DEFAULT_USERS,
}: AdminUsersProps) {
  const [users] = useState<AdminUser[]>(initialUsers);

  return <AdminUsersView users={users} />;
}

export { AdminUsersContainer as AdminUsers };

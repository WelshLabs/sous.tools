"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function navigateToVendors() {
  revalidatePath("/inventory/vendors");
  redirect("/inventory/vendors");
}

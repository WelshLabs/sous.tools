import { z } from "zod";

export const InviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["Superadmin", "Admin", "Manager", "User"]).default("User"),
});

export type InviteUserDto = z.infer<typeof InviteUserSchema>;

export const UpdateUserRoleSchema = z.object({
  role: z.enum(["Superadmin", "Admin", "Manager", "User"]),
});

export type UpdateUserRoleDto = z.infer<typeof UpdateUserRoleSchema>;

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  code: z.string().optional(),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

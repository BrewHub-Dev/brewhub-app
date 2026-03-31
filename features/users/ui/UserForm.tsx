"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Select } from "@/components/ui/Select";
import { updateUser, type User } from "../api";
import { getBranches } from "@/features/branches/api";
import { useAuth } from "@/lib/auth-store";
import api from "@/lib/api";

interface UserFormProps {
  user: User | null;
  onClose: () => void;
}

interface UserFormData {
  emailAddress: string;
  name: string;
  lastName: string;
  username: string;
  phone: string;
  role: "ADMIN" | "SHOP_ADMIN" | "BRANCH_ADMIN" | "CLIENT";
  password?: string;
  ShopId?: string;
  BranchId?: string;
}

export default function UserForm({ user, onClose }: Readonly<UserFormProps>) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [formData, setFormData] = useState<UserFormData>({
    emailAddress: user?.emailAddress || "",
    name: user?.name || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
    phone: user?.phone || "",
    role: user?.role || "CLIENT",
    password: "",
    ShopId: user?.ShopId || currentUser?.ShopId,
    BranchId: user?.BranchId,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    enabled: formData.role === "BRANCH_ADMIN" || formData.role === "SHOP_ADMIN",
  });

  const createMutation = useMutation({
    mutationFn: (data: UserFormData) => api.post("/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<User>) => updateUser(user!._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user) {
      const updateData: Partial<User> = {
        emailAddress: formData.emailAddress,
        name: formData.name,
        lastName: formData.lastName,
        username: formData.username,
        phone: formData.phone,
        role: formData.role,
      };
      await updateMutation.mutateAsync(updateData);
    } else {
      const createData = {
        ...formData,
        ShopId: formData.role !== "ADMIN" && formData.role !== "CLIENT" ? formData.ShopId : undefined,
        BranchId: formData.role === "BRANCH_ADMIN" ? formData.BranchId : undefined,
      };
      await createMutation.mutateAsync(createData);
    }
  };

  const roleRequiresBranch = formData.role === "BRANCH_ADMIN";
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-foreground">
          {user ? "Editar Usuario" : "Crear Usuario"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="user-name" className="text-sm text-muted-foreground block mb-2 font-medium">
                Nombre *
              </label>
              <input
                id="user-name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="user-lastname" className="text-sm text-muted-foreground block mb-2 font-medium">
                Apellido *
              </label>
              <input
                id="user-lastname"
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {!user && (
            <div>
              <label htmlFor="user-username" className="text-sm text-muted-foreground block mb-2 font-medium">
                Username *
              </label>
              <input
                id="user-username"
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required={!user}
                minLength={3}
              />
            </div>
          )}

          <div>
            <label htmlFor="user-email" className="text-sm text-muted-foreground block mb-2 font-medium">
              Email *
            </label>
            <input
              id="user-email"
              type="email"
              value={formData.emailAddress}
              onChange={(e) =>
                setFormData({ ...formData, emailAddress: e.target.value })
              }
              className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {!user && (
            <div>
              <label htmlFor="user-phone" className="text-sm text-muted-foreground block mb-2 font-medium">
                Teléfono *
              </label>
              <input
                id="user-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required={!user}
                minLength={7}
              />
            </div>
          )}

          <div>
            <label htmlFor="user-role" className="text-sm text-muted-foreground block mb-2 font-medium">
              Rol *
            </label>
            <Select
              id="user-role"
              value={formData.role}
              onChange={(newRole) => {
                setFormData({
                  ...formData,
                  role: newRole as UserFormData["role"],
                  ShopId: newRole === "ADMIN" || newRole === "CLIENT" ? undefined : formData.ShopId,
                  BranchId: newRole === "BRANCH_ADMIN" ? formData.BranchId : undefined,
                });
              }}
              options={[
                { value: "CLIENT", label: "Cliente" },
                { value: "BRANCH_ADMIN", label: "Admin de Sucursal" },
                { value: "SHOP_ADMIN", label: "Admin de Tienda" },
                { value: "ADMIN", label: "Administrador" },
              ]}
            />
          </div>

          {roleRequiresBranch && (
            <div>
              <label htmlFor="user-branch" className="text-sm text-muted-foreground block mb-2 font-medium">
                Sucursal *
              </label>
              <Select
                id="user-branch"
                value={formData.BranchId || ""}
                onChange={(value) => setFormData({ ...formData, BranchId: value })}
                required
                placeholder="Seleccionar sucursal..."
                options={branches.map((branch) => ({ value: branch._id, label: branch.name }))}
              />
            </div>
          )}

          {!user && (
            <div>
              <label htmlFor="user-password" className="text-sm text-muted-foreground block mb-2 font-medium">
                Contraseña *
              </label>
              <input
                id="user-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required={!user}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo 6 caracteres
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Guardando..."
                : user
                ? "Actualizar"
                : "Crear"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 glass py-3 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

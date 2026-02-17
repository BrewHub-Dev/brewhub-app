"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
              <label className="text-sm text-muted-foreground block mb-2 font-medium">
                Nombre *
              </label>
              <input
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
              <label className="text-sm text-muted-foreground block mb-2 font-medium">
                Apellido *
              </label>
              <input
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
              <label className="text-sm text-muted-foreground block mb-2 font-medium">
                Username *
              </label>
              <input
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
            <label className="text-sm text-muted-foreground block mb-2 font-medium">
              Email *
            </label>
            <input
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
              <label className="text-sm text-muted-foreground block mb-2 font-medium">
                Teléfono *
              </label>
              <input
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
            <label className="text-sm text-muted-foreground block mb-2 font-medium">
              Rol *
            </label>
            <select
              value={formData.role}
              onChange={(e) => {
                const newRole = e.target.value as UserFormData["role"];
                setFormData({
                  ...formData,
                  role: newRole,
                  ShopId: newRole === "ADMIN" || newRole === "CLIENT" ? undefined : formData.ShopId,
                  BranchId: newRole === "BRANCH_ADMIN" ? formData.BranchId : undefined,
                });
              }}
              className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="CLIENT">Cliente</option>
              <option value="BRANCH_ADMIN">Admin de Sucursal</option>
              <option value="SHOP_ADMIN">Admin de Tienda</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          {roleRequiresBranch && (
            <div>
              <label className="text-sm text-muted-foreground block mb-2 font-medium">
                Sucursal *
              </label>
              <select
                value={formData.BranchId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, BranchId: e.target.value })
                }
                className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Seleccionar sucursal...</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!user && (
            <div>
              <label className="text-sm text-muted-foreground block mb-2 font-medium">
                Contraseña *
              </label>
              <input
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

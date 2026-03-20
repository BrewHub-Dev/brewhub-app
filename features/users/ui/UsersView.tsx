"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, deleteUser, type User } from "../api";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Pagination } from "@/components/ui/Pagination";
import UserForm from "./UserForm";

const LIMIT = 20

export default function UsersView() {
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const { data = { data: [], pagination: { total: 0, page: 1, limit: LIMIT, pages: 0, hasNext: false, hasPrev: false } }, isLoading } = useQuery({
    queryKey: ["users", page],
    queryFn: () => getUsers({ page, limit: LIMIT }),
  });

  const users = data.data;
  const pagination = data.pagination;

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra los usuarios de tu sistema
            {pagination.total > 0 && (
              <span className="ml-2 text-sm">· {pagination.total} en total</span>
            )}
          </p>
        </div>
        <PermissionGuard permission="users:create">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Crear Usuario
          </button>
        </PermissionGuard>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tienda
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sucursal
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-foreground">
                    {user.name} {user.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">{user.emailAddress}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success/20 text-success">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {user.shop?.name || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {user.branch?.name || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <PermissionGuard permission="users:edit">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-primary hover:text-primary/80 mr-4"
                    >
                      Editar
                    </button>
                  </PermissionGuard>
                  <PermissionGuard permission="users:delete">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      Eliminar
                    </button>
                  </PermissionGuard>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />

      {isFormOpen && (
        <UserForm
          user={editingUser}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

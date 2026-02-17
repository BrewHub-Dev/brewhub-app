"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBranches, deleteBranch, type Branch } from "../api";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { PermissionGuard } from "@/components/PermissionGuard";
import BranchForm from "./BranchForm";

export default function BranchesView() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta sucursal?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBranch(null);
  };

  const formatAddress = (address?: Branch["address"]) => {
    if (!address) return "";

    return [
      address.street,
      address.city,
      address.state,
      address.zip,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando sucursales...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sucursales</h1>

        <PermissionGuard permission="branches:create">
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            Crear Sucursal
          </button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div
            key={branch._id}
            className="glass rounded-2xl p-6 hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {branch.name}
                </h3>

                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full mt-2 font-medium ${
                    branch.active
                      ? "bg-success/20 text-success"
                      : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {branch.active ? "Activa" : "Inactiva"}
                </span>
              </div>
            </div>

            {/* ✅ Dirección corregida */}
            {branch.address && (
              <div className="text-sm text-muted-foreground mb-2">
                📍 {formatAddress(branch.address)}
              </div>
            )}

            {branch.phone && (
              <div className="text-sm text-muted-foreground mb-2">
                📞 {branch.phone}
              </div>
            )}

            {branch.email && (
              <div className="text-sm text-muted-foreground mb-4">
                ✉️ {branch.email}
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <PermissionGuard permission="branches:edit">
                <button
                  onClick={() => handleEdit(branch)}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Editar
                </button>
              </PermissionGuard>

              <PermissionGuard permission="branches:delete">
                <button
                  onClick={() => handleDelete(branch._id)}
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-primary-foreground py-2 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Eliminar
                </button>
              </PermissionGuard>
            </div>
          </div>
        ))}
      </div>

      {branches.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No hay sucursales registradas
        </div>
      )}

      {isFormOpen && (
        <BranchForm branch={editingBranch} onClose={handleCloseForm} />
      )}
    </div>
  );
}

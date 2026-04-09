"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBranches, deleteBranch, type Branch } from "../api";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { PermissionGuard } from "@/components/PermissionGuard";
import BranchForm from "./BranchForm";
import { Search, Edit, Trash2, Plus } from "lucide-react";


export default function BranchesView() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBranch,
    onMutate: (id: string) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
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

  const filteredBranches = branches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando sucursales...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Sucursales</h1>
          <div className="text-muted-foreground text-sm">
            Total: <span className="font-semibold">{branches.length}</span>
          </div>
        </div>
        <div className="flex gap-2 items-center w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search size={16} strokeWidth={2} />
            </span>
            <input
              type="text"
              placeholder="Buscar sucursal..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-lg border border-border bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <PermissionGuard permission="branches:create">
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition"
              title="Crear sucursal"
            >
              <Plus size={16} strokeWidth={2} /> <span className="hidden sm:inline">Crear</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBranches.map((branch) => (
          <div
            key={branch._id}
            className="bg-card border border-border rounded-xl p-5 flex flex-col shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground truncate max-w-[70%]">
                {branch.name}
              </h3>
              <span
                className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                  branch.active
                    ? "bg-success/20 text-success"
                    : "bg-destructive/20 text-destructive"
                }`}
              >
                {branch.active ? "Activa" : "Inactiva"}
              </span>
            </div>
            <div className="flex-1 space-y-1 text-sm text-muted-foreground mb-2">
              {branch.address && (
                <div>
                  <span className="font-medium">Dirección:</span> {formatAddress(branch.address)}
                </div>
              )}
              {branch.phone && (
                <div>
                  <span className="font-medium">Teléfono:</span> {branch.phone}
                </div>
              )}
              {branch.email && (
                <div>
                  <span className="font-medium">Email:</span> {branch.email}
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-2 pt-2 border-t border-border">
              <PermissionGuard permission="branches:edit">
                <button
                  onClick={() => handleEdit(branch)}
                  className="flex-1 flex items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg text-sm font-medium transition-all border border-primary/30"
                  title="Editar sucursal"
                >
                  <Edit size={16} strokeWidth={2} /> <span className="hidden sm:inline">Editar</span>
                </button>
              </PermissionGuard>
              <PermissionGuard permission="branches:delete">
                <button
                  onClick={() => handleDelete(branch._id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-destructive hover:bg-destructive/90 text-primary-foreground py-2 rounded-lg text-sm font-medium transition-all border border-destructive/30 disabled:opacity-60"
                  title="Eliminar sucursal"
                  disabled={deletingId === branch._id && deleteMutation.isPending}
                >
                  {deletingId === branch._id && deleteMutation.isPending ? (
                    <span className="animate-pulse">Eliminando...</span>
                  ) : (
                    <><Trash2 size={16} strokeWidth={2} /> <span className="hidden sm:inline">Eliminar</span></>
                  )}
                </button>
              </PermissionGuard>
            </div>
          </div>
        ))}
      </div>

      {filteredBranches.length === 0 && (
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

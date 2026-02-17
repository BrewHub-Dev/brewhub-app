"use client";

import { useAuth } from "@/lib/auth-store";
import { useEffect, useState } from "react";
import { get } from "@/lib/api";

interface Branch {
  _id: string;
  name: string;
  ShopId: string;
}

export function BranchSelector() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (user?.role !== "SHOP_ADMIN") {
    return null;
  }

  useEffect(() => {
    async function loadBranches() {
      try {
        setLoading(true);
        const data = await get<Branch[]>("/branches");
        setBranches(data || []);
        
        // Carga rama seleccionada anterior si existe
        const saved = localStorage.getItem("selectedBranchId");
        if (saved) setSelectedBranchId(saved);
      } catch (err) {
        console.error("Failed to load branches", err);
      } finally {
        setLoading(false);
      }
    }

    loadBranches();
  }, []);

  function handleSelectBranch(branchId: string) {
    setSelectedBranchId(branchId);
    if (branchId) {
      localStorage.setItem("selectedBranchId", branchId);
      window.dispatchEvent(
        new CustomEvent("branchSelected", { detail: { branchId } })
      );
    } else {
      localStorage.removeItem("selectedBranchId");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="branch-select" className="text-sm font-medium">
        Branch:
      </label>
      <select
        id="branch-select"
        value={selectedBranchId}
        onChange={(e) => handleSelectBranch(e.target.value)}
        disabled={loading}
        className="px-2 py-1 border rounded text-sm"
      >
        <option value="">-- All Branches --</option>
        {branches.map((branch) => (
          <option key={branch._id} value={branch._id}>
            {branch.name}
          </option>
        ))}
      </select>
    </div>
  );
}

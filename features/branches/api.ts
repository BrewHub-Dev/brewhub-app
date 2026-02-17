import api from "@/lib/api";

export interface Branch {
  _id: string;
  ShopId: string;
  name: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    zip?: string;
  };
  phone?: string;
  email?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function getBranches(): Promise<Branch[]> {
  const response = await api.get("/branches");
  return Array.isArray(response) ? response : [];
}

export async function getBranchById(id: string): Promise<Branch> {
  return api.get(`/branches/${id}`);
}

export async function createBranch(branch: Partial<Branch>): Promise<Branch> {
  return api.post("/branches", branch);
}

export async function updateBranch(id: string, branch: Partial<Branch>): Promise<Branch> {
  return api.patch(`/branches/${id}`, branch);
}

export async function deleteBranch(id: string): Promise<void> {
  await api.del(`/branches/${id}`);
}

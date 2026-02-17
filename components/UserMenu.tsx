"use client";

import { useAuth } from "@/lib/auth-store";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  if (!user) return null;

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="font-medium">{user.name} {user.lastName}</p>
        <p className="text-sm text-gray-600">{user.role}</p>
      </div>
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="px-3 py-1 text-sm bg-red-600 text-white rounded disabled:opacity-50"
      >
        {isLoading ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}

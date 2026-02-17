"use client";

import { useShop } from "@/features/avatar/api";
import { usePermissions } from "@/lib/hooks/usePermissions";

type Props = {
  shopId: string;
  fallback: React.ReactNode;
};

export default function ShopAvatar({ shopId, fallback }: Readonly<Props>) {
  const { can } = usePermissions();
  const hasPermission = can("shops:view");
  const { data: shop } = useShop(shopId, hasPermission);

  if (!shop?.image) return <>{fallback}</>;

  return (
    <img
      src={shop.image}
      alt={shop.name ?? "Shop Avatar"}
      width={48}
      height={48}
      className="object-cover w-12 h-12"
    />
  );
}

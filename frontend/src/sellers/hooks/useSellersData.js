import { useMemo } from "react";

import { buildSellersList } from "@/sellers/utils/sellers.helpers";

const EMPTY_LIST = [];

export const useSellersData = ({
  vehicles,
  parts,
  buildList = buildSellersList,
} = {}) => {
  const safeVehicles = Array.isArray(vehicles) ? vehicles : EMPTY_LIST;
  const safeParts = Array.isArray(parts) ? parts : EMPTY_LIST;

  return useMemo(
    () => buildList(safeVehicles, safeParts),
    [buildList, safeVehicles, safeParts]
  );
};

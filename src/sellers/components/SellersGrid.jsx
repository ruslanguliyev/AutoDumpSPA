import SellerCard from "@/sellers/components/SellerCard";

const SellersGrid = ({ sellers, onSellerClick }) => {
  const safeSellers = Array.isArray(sellers) ? sellers : [];

  if (safeSellers.length === 0) {
    return null;
  }

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {safeSellers.map((seller) => {
        if (!seller || !seller.id) return null;
        return (
          <SellerCard
            key={seller.id}
            seller={seller}
            onClick={() => onSellerClick?.(seller)}
          />
        );
      })}
    </section>
  );
};

export default SellersGrid;

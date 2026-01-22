import SellerCard from "@/sellers/components/SellerCard";

const SellersGrid = ({ sellers, onSellerClick }) => {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sellers.map((seller) => (
        <SellerCard
          key={seller.id}
          seller={seller}
          onClick={() => onSellerClick?.(seller)}
        />
      ))}
    </section>
  );
};

export default SellersGrid;

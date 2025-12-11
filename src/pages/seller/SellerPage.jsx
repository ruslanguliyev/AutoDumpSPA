import { useParams } from "react-router-dom";
import { autos } from "../../data/data";

export default function SellerPage() {
    const { sellerId } = useParams();

    const cars = autos.filter(c => c.seller?.id === sellerId);
    const seller = cars[0]?.seller;

    if (!seller) return <div>Seller not found</div>;

    return (
        <div className="seller-page">
            <h1>{seller.name}</h1>
            <p>{cars.length} vehicles listed</p>

            <div className="seller-cars-grid">
                {cars.map(car => (
                    <div key={car.id} className="seller-car-card">
                        {car.brand} {car.model}
                    </div>
                ))}
            </div>
        </div>
    );
}

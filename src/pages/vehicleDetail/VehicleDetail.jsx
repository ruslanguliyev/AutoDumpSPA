import { useParams } from "react-router-dom";
import { autos } from "@/data/data";
import { useFavoritesStore } from "@/store/favoritesStore";
import Breadcrumbs from "@/components/Breadcrumbs/Breadcrumbs";

import VehicleGallery from "@/pages/vehicleDetail/VehicleGallery";
import VehicleSpecs from "@/pages/vehicleDetail/VehicleSpecs";
import VehicleSummaryCard from "@/pages/vehicleDetail/VehicleSummaryCard";
import SellerCard from "@/pages/vehicleDetail/SellerCard";
import SafetyTipsCard from "@/pages/vehicleDetail/SafetyTipsCard";

import "./VehicleDetail.scss";


export default function VehicleDetail() {
    const { id } = useParams();
    const car = autos.find((c) => c.id == id);

    const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
    const isFavorite = useFavoritesStore((s) =>
        car ? s.isFavorited("vehicle", car.id) : false
    );

    if (!car) return <div>Not found</div>;

    // 🔁 адаптер данных
    const media = car.image.map((src, index) => ({
        id: `${car.id}-${index}`,
        src,
        alt: `${car.brand} ${car.model} image ${index + 1}`,
        type: "image",
    }));

    const currency = car?.currency ?? "EUR";
    const sellerPhone = car?.seller?.phone ?? "—";

    const safetyTips = [
        "Meet the seller in a safe public location",
        "Inspect the car thoroughly before purchase",
        "Never pay in advance without seeing the car",
        "Check all documents carefully",
    ];

    const breadcrumbs = [
        { label: "Home", to: "/" },
        { label: "Cars", to: "/search" },
        { label: `${car.brand} ${car.model}` },
    ];

    return (
        <div className="vehicle-page-wrapper">
            <div className="vehicle-grid">


                {/* ЛЕВАЯ ЧАСТЬ */}
                <div className="vehicle-left">
                    <Breadcrumbs items={breadcrumbs} />
                    
                    {/* ФОТО */}
                    {/* <div className="vehicle-gallery">
                        <img className="main-image" src={car.image[0]} alt={car.alt} />

                        <div className="thumbs">
                            {car.image.map((img, i) => (
                                <img key={i} src={img} alt={`${car.model}-${i}`} />
                            ))}
                        </div>
                    </div> */}



                    {/* КАРУСЕЛЬ */}
                    <VehicleGallery
                        items={media}
                        ariaLabel={`${car.brand} ${car.model} gallery`}
                    />

                    <VehicleSummaryCard
                        title={`${car.brand} ${car.model}`}
                        year={car.year}
                        mileage={car.mileage}
                        price={car.price}
                        currency={currency}
                        location={car.location}
                        engine={car.engine}
                        fuelType={car.fuel}
                        transmission={car.transmission}
                        isFeatured={car.isHot}
                        isVerified={Boolean(car.seller)}
                        isFavorite={isFavorite}
                        onToggleFavorite={() =>
                            toggleFavorite({
                                type: "vehicle",
                                id: car.id,
                                title: `${car.brand} ${car.model}`,
                                thumbnail: Array.isArray(car.image) ? car.image[0] : car.image,
                            })
                        }
                    />

                    <VehicleSpecs car={car} />
                </div>

                {/* ПРАВАЯ ЧАСТЬ (sticky) */}
                <div className="vehicle-right">
                    <div className="vehicle-info">
                        <SellerCard seller={car.seller} phone={sellerPhone} location={car.location} />
                        <SafetyTipsCard tips={safetyTips} />
                    </div>
                </div>
            </div>
        </div>
    );
}

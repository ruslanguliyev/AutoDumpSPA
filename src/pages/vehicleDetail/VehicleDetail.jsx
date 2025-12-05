import { useParams } from "react-router-dom";
import { autos } from "../../data/data";
import './VehicleDetail.scss'


export default function VehicleDetail() {
    const { id } = useParams();
    const car = autos.find(c => c.id == id);

    if (!car) return <div>Not found</div>;

    return (
        <div className="vehicle-page-wrapper">

            <div className="vehicle-grid">

                {/* ЛЕВАЯ КОЛОНКА — ФОТО */}
                <div className="vehicle-left">
                    <div className="vehicle-gallery">
                        <img className="main-image" src={car.image} alt={car.alt} />
                        <div className="thumbs">
                            {car.images?.map((img, i) => (
                                <img key={i} src={img} alt={`${car.model}-${i}`} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* ПРАВАЯ КОЛОНКА — sticky */}
                <div className="vehicle-right">
                    <div className="vehicle-info">
                        <h1>{car.brand} {car.model}</h1>

                        <div className="price-box">
                            <p className="price">{car.price} €</p>
                            <p className="monthly">~ {car.monthlyPayment} € / month</p>
                        </div>

                        <div className="info-block">
                            <p><strong>Пробег:</strong> {car.km} km</p>
                            <p><strong>Мощность:</strong> {car.power} PS</p>
                            <p><strong>Топливо:</strong> {car.fuel}</p>
                            <p><strong>Год:</strong> {car.year}</p>
                        </div>

                       

                    </div>
                </div>

            </div>

        </div>
    );
}


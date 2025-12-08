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

                {/* ЛЕВАЯ КОЛОНКА */}
                <div className="vehicle-left">

                    <div className="vehicle-gallery">
                        <img className="main-image" src={car.image} alt={car.alt} />
                        <div className="thumbs">
                            {car.images?.map((img, i) => (
                                <img key={i} src={img} alt={`${car.model}-${i}`} />
                            ))}
                        </div>
                    </div>

                    {/* ХАРАКТЕРИСТИКИ — ДОЛЖНЫ БЫТЬ В ЛЕВОЙ ЧАСТИ */}
                    <div className="vehicle-specs-section">
                        <h2>Характеристики</h2>

                        <div className="specs-grid">

                            <div className="spec-row">
                                <span className="spec-name">Марка:</span>
                                <span className="spec-value">{car.brand}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Модель:</span>
                                <span className="spec-value">{car.model}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Год выпуска:</span>
                                <span className="spec-value">{car.year}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Тип кузова:</span>
                                <span className="spec-value">{car.bodyType || "—"}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Цвет:</span>
                                <span className="spec-value">{car.color || "—"}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Мотор:</span>
                                <span className="spec-value">{car.engine || "—"}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Пробег:</span>
                                <span className="spec-value">{car.km} km</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Коробка передач:</span>
                                <span className="spec-value">{car.transmission || "—"}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Привод:</span>
                                <span className="spec-value">{car.drive || "—"}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Состояние:</span>
                                <span className="spec-value">{car.condition || "—"}</span>
                            </div>


                        </div>
                    </div>

                </div>

                {/* ПРАВАЯ КОЛОНКА — sticky */}
                <div className="vehicle-right">
                    <div className="vehicle-info">

                        <h2 className="car-title">{car.brand} {car.model}</h2>

                        <div className="price-box">
                            <p className="big-price">{car.price} €</p>
                            <p className="price-month">~ {car.monthlyPayment} € / month</p>
                        </div>

                        <div className="rating-bar">
                            <span className="bar green"></span>
                            <span className="bar green"></span>
                            <span className="bar green"></span>
                            <span className="bar grey"></span>
                            <span className="bar grey"></span>
                            <p className="rate-text">Fair Price</p>
                        </div>

                        <div className="info-block">
                            <p><strong>Пробег:</strong> {car.km} km</p>
                            <p><strong>Мощность:</strong> {car.power} PS</p>
                            <p><strong>Топливо:</strong> {car.fuel}</p>
                            <p><strong>Год:</strong> {car.year}</p>
                        </div>

                        <button className="contact-btn">Связаться</button>

                        <div className="action-buttons">
                            <button className="secondary-btn">В избранное</button>
                            <button className="secondary-btn">Поделиться</button>
                        </div>

                        <div className="seller-card">
                            <img className="seller-logo" src={car.sellerLogo} alt="Seller" />

                            <div className="seller-info-text">
                                <h4 className="seller-name">{car.sellerName}</h4>

                                <div className="seller-rating">
                                    ⭐ {car.sellerRating} Stars
                                    <span className="seller-count">{car.sellerVotes} Ratings</span>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );

}

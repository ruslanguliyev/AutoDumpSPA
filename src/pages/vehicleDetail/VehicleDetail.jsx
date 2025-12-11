import { useParams } from "react-router-dom";
import { autos } from "../../data/data";
import { useFavoritesStore } from "../../store/favoritesStore";
import { Link } from "react-router-dom";

import "./VehicleDetail.scss";

export default function VehicleDetail() {
    const { id } = useParams();
    const car = autos.find((c) => c.id == id);

    const { favorites, toggleFavorite } = useFavoritesStore();
    const isFavorite = favorites.includes(car.id);

    if (!car) return <div>Not found</div>;

    return (
        <div className="vehicle-page-wrapper">
            <div className="vehicle-grid">

                {/* ЛЕВАЯ ЧАСТЬ */}
                <div className="vehicle-left">

                    {/* ФОТО */}
                    <div className="vehicle-gallery">
                        <img className="main-image" src={car.image[0]} alt={car.alt} />

                        <div className="thumbs">
                            {car.image.map((img, i) => (
                                <img key={i} src={img} alt={`${car.model}-${i}`} />
                            ))}
                        </div>
                    </div>

                    {/* ХАРАКТЕРИСТИКИ */}
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
                                <span className="spec-name">Версия:</span>
                                <span className="spec-value">{car.version}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Код авто:</span>
                                <span className="spec-value">{car.code}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Год выпуска:</span>
                                <span className="spec-value">{car.year}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Мотор:</span>
                                <span className="spec-value">{car.engine}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Коробка передач:</span>
                                <span className="spec-value">{car.transmission}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Привод:</span>
                                <span className="spec-value">{car.drive}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Пробег:</span>
                                <span className="spec-value">{car.mileage} km</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Локация:</span>
                                <span className="spec-value">{car.location}</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-name">Количество владельцев:</span>
                                <span className="spec-value">{car.owners || "—"}</span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">В кредите:</span>
                                <span className="spec-value">
                                    {car.isFinanced ? "Да" : "Нет"}
                                </span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Дата публикации:</span>
                                <span className="spec-value">
                                    {car.postedAt ? new Date(car.postedAt).toLocaleDateString() : "—"}
                                </span>
                            </div>

                            <div className="spec-row">
                                <span className="spec-name">Просмотры:</span>
                                <span className="spec-value">{car.views || 0}</span>
                            </div>

                        </div>

                    </div>

                    {car.sellerNote && (
                        <div className="owner-note">
                            <h3>Комментарий владельца</h3>
                            <p>{car.sellerNote}</p>
                        </div>
                    )}
                </div>

                {/* ПРАВАЯ ЧАСТЬ (sticky) */}
                <div className="vehicle-right">
                    <div className="vehicle-info">

                        <h2 className="car-title">{car.brand} {car.model}</h2>

                        <div className="price-box">
                            <p className="big-price">{car.price} €</p>
                        </div>

                        {/* Fair Price */}
                        <div className="rating-bar">
                            <span className="bar green"></span>
                            <span className="bar green"></span>
                            <span className="bar green"></span>
                            <span className="bar grey"></span>
                            <span className="bar grey"></span>
                            <p className="rate-text">Fair Price</p>
                        </div>

                        {/* Основные данные */}
                        <div className="info-block">
                            <p><strong>Пробег:</strong> {car.mileage} km</p>
                            <p><strong>Мотор:</strong> {car.engine}</p>
                            <p><strong>Привод:</strong> {car.drive}</p>
                            <p><strong>Год:</strong> {car.year}</p>
                        </div>

                        <button className="contact-btn">Связаться</button>

                        <div className="action-buttons">

                            <button
                                className={`fav-btn ${isFavorite ? "active" : ""}`}
                                onClick={() => toggleFavorite(car.id)}
                            >
                                {isFavorite ? "В избранном" : "В избранное"}
                            </button>

                            <button className="share-btn">Поделиться</button>
                        </div>

                        {car.seller && (
                            <Link to={`/seller/${car.seller.id}`} className="seller-card-mini">
                                <div className="seller-card-left">
                                    <img src={car.seller.logo} alt={car.seller.name} className="seller-card-logo" />
                                </div>

                                <div className="seller-card-right">
                                    <h4 className="seller-card-name">{car.seller.name}</h4>
                                    <p className="seller-card-type">{car.seller.type}</p>

                                    <div className="seller-card-rating">
                                        ⭐ {car.seller.rating}
                                        <span className="seller-card-votes">({car.seller.votes})</span>
                                    </div>
                                </div>
                            </Link>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

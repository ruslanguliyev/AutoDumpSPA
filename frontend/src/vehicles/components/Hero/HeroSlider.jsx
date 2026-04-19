import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./heroSlider.scss";

// ❗️ Импорты картинок
import img1 from "@/components/Hero/HeroImg/image1.jpg";
import img2 from "@/components/Hero/HeroImg/image2.jpg";
import img3 from "@/components/Hero/HeroImg/image3.jpg";

const slides = [img1, img2, img3];

export default function HeroSlider() {
    return (
        <div className="hero-slider-wrapper mb-5">
            <Swiper
                modules={[Autoplay, Pagination, ]}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                loop
                navigation
                pagination={{ clickable: true }}
                className="hero-slider"
            >
                {slides.map((img, i) => (
                    <SwiperSlide key={i}>
                        <div className="hero-slide">
                            <img
                                src={img}
                                alt=""
                                className="hero-slide__image"
                                loading="lazy"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

import { useState, useCallback, useRef } from "react";
import styles from "./MediaCarousel.module.scss";
import FullscreenMediaViewer from "./FullscreenMediaViewer";

export default function MediaCarousel({
    items,
    ariaLabel = "Media carousel",
    showControls = true,
    showThumbnails = true,
    className,
    viewportClassName,
    mediaClassName,
    thumbnailsClassName,
    thumbButtonClassName,
    thumbImageClassName,
}) {
    // fixed (clicked) image
    const [index, setIndex] = useState(0);

    // temporary (hovered) image


    // fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false);

    const touchStartX = useRef(null);

    // what is currently shown

    const current = items[index];

    const goTo = (i) => setIndex(i);

    const prev = useCallback(() => {
        setIndex((i) => (i === 0 ? items.length - 1 : i - 1));
    }, [items.length]);

    const next = useCallback(() => {
        setIndex((i) => (i === items.length - 1 ? 0 : i + 1));
    }, [items.length]);

    // swipe support
    const onTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const onTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 50) {
            delta > 0 ? next() : prev();
        }
        touchStartX.current = null;
    };

    return (
        <section
            className={[styles.carousel, className].filter(Boolean).join(" ")}
            aria-roledescription="carousel"
            aria-label={ariaLabel}
        >
            {/* MAIN IMAGE */}
            <div
                className={[styles.viewport, viewportClassName].filter(Boolean).join(" ")}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                <img
                    src={current.src}
                    alt={current.alt}
                    className={[styles.media, mediaClassName].filter(Boolean).join(" ")}
                    onClick={() => setIsFullscreen(true)}
                />

                {showControls && (
                    <>
                        <button
                            className={styles.prev}
                            onClick={prev}
                            aria-label="Previous image"
                        >
                            ‹
                        </button>
                        <button
                            className={styles.next}
                            onClick={next}
                            aria-label="Next image"
                        >
                            ›
                        </button>
                    </>
                )}
            </div>

            {/* THUMBNAILS */}
            {showThumbnails && (
                <div className={[styles.thumbnails, thumbnailsClassName].filter(Boolean).join(" ")}>
                    {items.map((item, i) => (
                        <button
                            key={item.id}
                            className={[
                                styles.thumb,
                                i === index ? styles.thumbActive : "",
                                thumbButtonClassName,
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            onMouseEnter={() => setIndex(i)}   
                            aria-label={`Show image ${i + 1}`}
                        >
                            <img
                                src={item.src}
                                alt={item.alt}
                                className={thumbImageClassName}
                            />
                        </button>

                    ))}
                </div>
            )}

            {/* FULLSCREEN */}
            {isFullscreen && (
                <FullscreenMediaViewer
                    items={items}
                    index={index}
                    onClose={() => setIsFullscreen(false)}
                    onPrev={prev}
                    onNext={next}
                    onSelect={goTo}
                />
            )}
        </section>
    );
}

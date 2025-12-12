import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./FullscreenMediaViewer.module.scss";

export default function FullscreenMediaViewer({
    items,
    index,
    onClose,
    onPrev,
    onNext,
    onSelect,
}) {
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, onPrev, onNext]);

    return createPortal(
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.viewer} onClick={(e) => e.stopPropagation()}>

                {/* HEADER */}
                <div className={styles.header}>
                    <button className={styles.close} onClick={onClose}>✕</button>
                </div>

                {/* IMAGE */}
                <div className={styles.center}>
                    <button className={styles.prev} onClick={onPrev}>‹</button>

                    <img
                        src={items[index].src}
                        alt={items[index].alt}
                        className={styles.image}
                    />

                    <button className={styles.next} onClick={onNext}>›</button>
                </div>

                {/* THUMBNAILS */}
                <div className={styles.footer}>
                    {items.map((item, i) => (
                        <button
                            key={item.id}
                            className={`${styles.thumb} ${i === index ? styles.active : ""}`}
                            onClick={() => onSelect(i)}
                        >
                            <img src={item.src} alt={item.alt} />
                        </button>
                    ))}
                </div>

            </div>
        </div>,
        document.body
    );


}

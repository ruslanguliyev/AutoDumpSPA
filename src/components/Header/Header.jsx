import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import "./header.scss";

export default function Header() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const count = useCartStore((s) => s.items.length);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", onScroll);

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
            <nav className="header__nav">
                <div className="header__container">
                    <Link to="/" className="header__brand">
                        <img
                            className="header__logo"
                            src="/src/assets/images/autodump-logo.PNG"
                            alt="Logo"
                        />
                    </Link>

                    <button
                        className={`header__toggle ${open ? "is-open" : ""}`}
                        onClick={() => setOpen(!open)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    <div className={`header__menu ${open ? "is-open" : ""}`}>
                        <ul className="header__list">
                            <li><Link to="/" className="header__link">Home</Link></li>
                            <li><Link to="/about" className="header__link">About</Link></li>
                            <li><Link to="/autorepair" className="header__link">Auto Repair</Link></li>
                            <li><Link to="/parts" className="header__link">Parts</Link></li>
                        </ul>

                        <div className="header__auth">
                            <button className="header__btn header__btn--outline">Log in</button>
                            <button className="header__btn">Sign in</button>
                        </div>
                        <ShoppingCart />
                        {count > 0 && <span className="cart-badge">{count}</span>}
                    </div>
                </div>
            </nav>
        </header>
    );
}

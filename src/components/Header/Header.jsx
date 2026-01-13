import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Heart,
    Home,
    Info,
    Menu,
    Package,
    X,
    ShoppingCart,
    User,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import logoUrl from "@assets/images/autodump-logo.PNG";
import "./header.scss";

const useMediaQuery = (query) => {
    const getMatch = () => {
        if (typeof window === "undefined") return false;
        return window.matchMedia(query).matches;
    };

    const [matches, setMatches] = useState(getMatch);

    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = (e) => setMatches(e.matches);

        setMatches(mql.matches);
        if (typeof mql.addEventListener === "function") {
            mql.addEventListener("change", onChange);
            return () => mql.removeEventListener("change", onChange);
        }

        // Safari fallback
        mql.addListener(onChange);
        return () => mql.removeListener(onChange);
    }, [query]);

    return matches;
};

export default function Header() {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const location = useLocation();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [openPopover, setOpenPopover] = useState(null); // 'user' | 'favorites' | 'cart' | null
    const [scrolled, setScrolled] = useState(false);

    const cartItems = useCartStore((s) => s.items);
    const cartCount = cartItems.length;
    const removeFromCartAt = useCartStore((s) => s.removeFromCartAt);

    const favoriteItems = useFavoritesStore((s) => s.items);
    const removeFromFavorites = useFavoritesStore((s) => s.removeFromFavorites);

    const popoverRootRef = useRef(null);

    const cartCountLabel = useMemo(() => {
        if (cartCount <= 0) return "Cart (empty)";
        if (cartCount === 1) return "Cart (1 item)";
        return `Cart (${cartCount} items)`;
    }, [cartCount]);

    const favoritesCountLabel = useMemo(() => {
        if (!favoriteItems?.length) return "Favorites (empty)";
        if (favoriteItems.length === 1) return "Favorites (1 item)";
        return `Favorites (${favoriteItems.length} items)`;
    }, [favoriteItems]);

    const mobileMenuItems = useMemo(
        () => [
            { to: "/", label: "Home", Icon: Home },
            { to: "/about", label: "About", Icon: Info },
            { to: "/parts", label: "Parts", Icon: Package },
            { to: "/favorites", label: "Favorites", Icon: Heart },
            { to: "/cart", label: "Cart", Icon: ShoppingCart },
            { to: "/account", label: "Account", Icon: User },
        ],
        []
    );

    const cartPreview = useMemo(() => cartItems?.slice(0, 5) ?? [], [cartItems]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close the drawer when:
    // - navigating
    // - switching to desktop
    useEffect(() => {
        setIsDrawerOpen(false);
        setOpenPopover(null);
    }, [location.pathname, isMobile]);

    // ESC to close
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key !== "Escape") return;
            setIsDrawerOpen(false);
            setOpenPopover(null);
        };
        if (isDrawerOpen || openPopover) window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isDrawerOpen, openPopover]);

    // Click outside closes desktop popovers
    useEffect(() => {
        if (!openPopover) return;
        const onPointerDown = (e) => {
            const root = popoverRootRef.current;
            if (!root) return;
            if (root.contains(e.target)) return;
            setOpenPopover(null);
        };
        window.addEventListener("pointerdown", onPointerDown);
        return () => window.removeEventListener("pointerdown", onPointerDown);
    }, [openPopover]);

    // Prevent background scroll while drawer is open (mobile only)
    useEffect(() => {
        if (!isMobile || !isDrawerOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [isMobile, isDrawerOpen]);

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);
    const closePopover = () => setOpenPopover(null);
    const togglePopover = (key) => setOpenPopover((cur) => (cur === key ? null : key));

    return (
        <>
            <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
                <div className="header__container">
                    <Link to="/" className="header__brand" aria-label="Go to home">
                        <img src={logoUrl} alt="AutoDump" className="header__logo" />
                    </Link>

                    {!isMobile ? (
                        <div className="header__desktop" ref={popoverRootRef}>
                            <nav className="header__nav" aria-label="Primary navigation">
                                <Link to="/">Home</Link>
                                <Link to="/about">About</Link>
                                <Link to="/parts">Parts</Link>
                            </nav>

                            <div className="header__actions" aria-label="Header actions">
                                <div className="header__action">
                                    <button
                                        type="button"
                                        className="header__iconBtn"
                                        aria-label="Account"
                                        aria-haspopup="menu"
                                        aria-expanded={openPopover === "user"}
                                        aria-controls="popover-user"
                                        onClick={() => togglePopover("user")}
                                    >
                                <User size={22} />
                                    </button>
                                    {openPopover === "user" ? (
                                        <div id="popover-user" className="header__popover" role="menu">
                                            <Link to="/login" role="menuitem" onClick={closePopover}>
                                                Log in
                                            </Link>
                                            <Link to="/signup" role="menuitem" onClick={closePopover}>
                                                Sign in
                                            </Link>
                                        </div>
                                    ) : null}
                                </div>

                                <div className="header__action">
                                    <button
                                        type="button"
                                        className="header__iconBtn"
                                        aria-label={favoritesCountLabel}
                                        aria-haspopup="menu"
                                        aria-expanded={openPopover === "favorites"}
                                        aria-controls="popover-favorites"
                                        onClick={() => togglePopover("favorites")}
                                    >
                                        <Heart size={22} />
                                        {favoriteItems?.length ? (
                                            <span className="count-badge" aria-hidden="true">
                                                {favoriteItems.length}
                                            </span>
                                        ) : null}
                                    </button>
                                    {openPopover === "favorites" ? (
                                        <div id="popover-favorites" className="header__popover" role="menu">
                                            <div className="header__popoverTitle">Favorites</div>
                                            {favoriteItems?.length ? (
                                                <div className="header__popoverList">
                                                    {favoriteItems.slice(0, 6).map((fav) => {
                                                        const to = fav.type === "vehicle" ? `/vehicles/${fav.id}` : "/parts";
                                                        const title =
                                                            fav.title ||
                                                            (fav.type === "vehicle"
                                                                ? `Vehicle #${fav.id}`
                                                                : `Part #${fav.id}`);
                                                        return (
                                                            <div key={fav.key} className="header__listItem" role="menuitem">
                                                                <Link
                                                                    to={to}
                                                                    className="header__listLink"
                                                                    onClick={closePopover}
                                                                >
                                                                    {fav.thumbnail ? (
                                                                        <img
                                                                            src={fav.thumbnail}
                                                                            alt=""
                                                                            className="header__listThumb"
                                                                            loading="lazy"
                                                                        />
                                                                    ) : (
                                                                        <div className="header__listThumb header__listThumb--placeholder" />
                                                                    )}
                                                                    <div className="header__listMain">
                                                                        <div className="header__listTitle">{title}</div>
                                                                        <div className="header__listMeta">
                                                                            {fav.type === "vehicle" ? "Vehicle" : "Part"}
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    className="header__removeBtn"
                                                                    aria-label="Remove from favorites"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        removeFromFavorites(fav.type, fav.id);
                                                                    }}
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                    <Link to="/favorites" role="menuitem" onClick={closePopover}>
                                                        View all favorites
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="header__empty" role="note">
                                                    No favorites yet
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="header__action">
                                    <button
                                        type="button"
                                        className="header__iconBtn header__cart"
                                        aria-label={cartCountLabel}
                                        aria-haspopup="menu"
                                        aria-expanded={openPopover === "cart"}
                                        aria-controls="popover-cart"
                                        onClick={() => togglePopover("cart")}
                                    >
                                    <ShoppingCart size={22} />
                                        {cartCount > 0 ? (
                                            <span className="cart-badge" aria-hidden="true">
                                                {cartCount}
                                            </span>
                                        ) : null}
                                    </button>
                                    {openPopover === "cart" ? (
                                        <div id="popover-cart" className="header__popover" role="menu">
                                            <div className="header__popoverTitle">Cart</div>
                                            {cartItems?.length ? (
                                                <>
                                                    <div className="header__popoverList">
                                                        {cartPreview.map((item, idx) => {
                                                            const key = item?.id ?? item?._id ?? `${idx}`;
                                                            const title =
                                                                item?.title ??
                                                                item?.name ??
                                                                item?.model ??
                                                                item?.label ??
                                                                item?.partName ??
                                                                "Item";
                                                            const price = item?.price ?? item?.cost ?? null;
                                                            return (
                                                                <div key={key} className="header__listItem" role="menuitem">
                                                                    <div className="header__cartRow">
                                                                        <div className="header__cartRowTitle">{title}</div>
                                                                        {price != null ? (
                                                                            <div className="header__cartRowMeta">{price} €</div>
                                                                        ) : (
                                                                            <div className="header__cartRowMeta"> </div>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        className="header__removeBtn"
                                                                        aria-label="Remove from cart"
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            removeFromCartAt(idx);
                                                                        }}
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <Link to="/cart" role="menuitem" onClick={closePopover}>
                                                        Go to cart
                                                    </Link>
                                                </>
                                            ) : (
                                                <div className="header__empty" role="note">
                                                    Your cart is empty
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="header__mobile">
                        <button
                                type="button"
                            className="header__burger"
                                onClick={openDrawer}
                                aria-label="Open menu"
                                aria-haspopup="dialog"
                                aria-expanded={isDrawerOpen}
                                aria-controls="mobile-drawer"
                        >
                            <Menu size={26} />
                        </button>
                        </div>
                    )}
                </div>
            </header>

            {isMobile && isDrawerOpen ? (
                <div className="mobile-menu" aria-hidden={!isDrawerOpen}>
                    <button
                        type="button"
                        className="mobile-overlay"
                        onClick={closeDrawer}
                        aria-label="Close menu"
                    />

                    <aside
                        id="mobile-drawer"
                        className="mobile-drawer"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Mobile navigation"
                    >
                        <div className="mobile-drawer__header">
                            <span className="mobile-drawer__title">Menu</span>
                            <button
                                type="button"
                                className="mobile-drawer__close"
                                onClick={closeDrawer}
                                aria-label="Close menu"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <nav className="mobile-drawer__nav" aria-label="Mobile navigation links">
                            {mobileMenuItems.map(({ to, label, Icon }) => (
                                <Link key={to} to={to} onClick={closeDrawer}>
                                    <Icon size={18} />
                                    <span>{label}</span>
                            </Link>
                            ))}
                        </nav>
                    </aside>
                </div>
            ) : null}
        </>
    );
}

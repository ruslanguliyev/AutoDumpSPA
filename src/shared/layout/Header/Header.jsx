import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Home, Info, Menu, Package, Plus, X, User, Wrench } from "lucide-react";
import { useFavoritesStore } from "@/shared/store/favoritesStore";
import { useLanguageSync } from "@/shared/hooks/useLanguageSync";
import { HeaderLanguageSelector, HeaderThemeToggle } from "./HeaderUtilities";
import Button from "@/shared/ui/button";
import { useTranslation } from "react-i18next";
import logoUrl from "@/assets/images/autodump-logo.PNG";
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
    const { t } = useTranslation('common');

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [openPopover, setOpenPopover] = useState(null); // 'user' | 'favorites' | null
    const [scrolled, setScrolled] = useState(false);

    const { language, setLanguage } = useLanguageSync();

    const favoritesCount = useFavoritesStore((s) => s.items.length);
    const favoriteItems = useFavoritesStore((s) => s.items);
    const removeFromFavorites = useFavoritesStore((s) => s.removeFromFavorites);

    const popoverRootRef = useRef(null);

    const favoritesCountLabel = useMemo(() => {
        const count = favoriteItems?.length ?? 0;
        if (!count) return t('labels.favoritesEmpty');
        return t('labels.favoritesCount', { count });
    }, [favoriteItems, t]);

    const mobileMenuItems = useMemo(
        () => [
            { to: "/add", label: t('nav.addListing'), Icon: Plus },
            { to: "/", label: t('nav.home'), Icon: Home },
            { to: "/sellers", label: t('nav.sellers'), Icon: Info },
            { to: "/parts", label: t('nav.parts'), Icon: Package },
            { to: "/services", label: t('nav.services'), Icon: Wrench },
            { to: "/favorites", label: t('nav.favorites'), Icon: Heart },
            { to: "/account", label: t('nav.account'), Icon: User },
        ],
        [t]
    );

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
                    <Link to="/" className="header__brand" aria-label={t('common.goHome')}>
                        <img src={logoUrl} alt="AutoDump" className="header__logo" />
                    </Link>

                    {!isMobile ? (
                        <div className="header__desktop" ref={popoverRootRef}>
                            <nav className="header__nav" aria-label={t('labels.primaryNavigation')}>
                                <Link to="/">{t('nav.home')}</Link>
                                <Link to="/sellers">{t('nav.sellers')}</Link>
                                <Link to="/autosearch">{t('nav.cars')}</Link>
                                <Link to="/parts">{t('nav.parts')}</Link>
                                <Link to="/services">{t('nav.services')}</Link>
                            </nav>

                            <div className="header__actions" aria-label={t('labels.headerActions')}>
                                <div className="header__action">
                                    <Button
                                        asChild
                                        variant="primary"
                                        size="sm"
                                        className="h-12 px-6 rounded-xl transition-all duration-200 hover:brightness-110 hover:shadow hover:-translate-y-px group"
                                    >
                                        <Link to="/add" className="inline-flex items-center gap-2">
                                            <Plus
                                                size={18}
                                                className="shrink-0 transition-transform duration-200 group-hover:scale-105"
                                                aria-hidden
                                            />
                                            <span>{t('nav.addListing')}</span>
                                        </Link>
                                    </Button>
                                </div>
                                <HeaderLanguageSelector 
                                    value={language} 
                                    onChange={setLanguage} 
                                    onOpen={closePopover}
                                />
                                <HeaderThemeToggle />

                                <div className="header__action">
                                    <button
                                        type="button"
                                        className="header__iconBtn"
                                        aria-label={t('labels.account')}
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
                                                {t('buttons.login')}
                                            </Link>
                                            <Link to="/signup" role="menuitem" onClick={closePopover}>
                                                {t('buttons.signup')}
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
                                        {favoritesCount > 0 ? (
                                            <span className="count-badge" aria-hidden="true">
                                                {favoritesCount}
                                            </span>
                                        ) : null}
                                    </button>
                                    {openPopover === "favorites" ? (
                                        <div id="popover-favorites" className="header__popover" role="menu">
                                            <div className="header__popoverTitle">{t('labels.favorites')}</div>
                                            {favoriteItems?.length ? (
                                                <div className="header__popoverList">
                                                    {favoriteItems.slice(0, 6).map((fav) => {
                                                        const to =
                                                            fav.type === "vehicle"
                                                                ? `/vehicles/${fav.id}`
                                                                : `/parts/${fav.id}`;
                                                        const title =
                                                            fav.title ||
                                                            (fav.type === "vehicle"
                                                                ? t('labels.vehicleWithNumber', { id: fav.id })
                                                                : t('labels.partWithNumber', { id: fav.id }));
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
                                                                            {fav.type === "vehicle" ? t('labels.vehicle') : t('labels.part')}
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    className="header__removeBtn"
                                                                    aria-label={t('labels.removeFromFavorites')}
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
                                                        {t('labels.viewAllFavorites')}
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="header__empty" role="note">
                                                    {t('labels.noFavorites')}
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className="header__mobile">
                            <div className="header__mobileIndicators" aria-label={t('labels.mobileCounters')}>
                                {favoritesCount > 0 ? (
                                    <span className="header__mobileIndicator" aria-label={`${t('labels.favorites')}: ${favoritesCount}`}>
                                        <Heart size={16} />
                                        <span className="header__mobileIndicatorCount">{favoritesCount}</span>
                                    </span>
                                ) : null}
                            </div>

                            <button
                                type="button"
                                className="header__burger"
                                onClick={openDrawer}
                                aria-label={t('labels.openMenu')}
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
                        aria-label={t('labels.closeMenu')}
                    />

                    <aside
                        id="mobile-drawer"
                        className="mobile-drawer"
                        role="dialog"
                        aria-modal="true"
                        aria-label={t('labels.mobileNavigation')}
                    >
                        <div className="mobile-drawer__header">
                            <span className="mobile-drawer__title">{t('labels.menu')}</span>
                            <button
                                type="button"
                                className="mobile-drawer__close"
                                onClick={closeDrawer}
                                aria-label={t('labels.closeMenu')}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Mobile utilities (compact, no layout shift in the top header) */}
                        <div className="flex items-center gap-2 px-4 pb-2" style={{ flexWrap: 'wrap' }}>
                            <HeaderLanguageSelector 
                                value={language} 
                                onChange={setLanguage} 
                                compact 
                                onOpen={closePopover}
                            />
                            <HeaderThemeToggle />
                        </div>

                        <nav className="mobile-drawer__nav" aria-label="Mobile navigation links">
                            {mobileMenuItems.map(({ to, label, Icon }) => {
                                const badgeCount = to === "/favorites" ? favoritesCount : 0;
                                return (
                                    <Link key={to} to={to} onClick={closeDrawer}>
                                        <Icon size={18} />
                                        <span className="mobile-drawer__label">{label}</span>
                                        {badgeCount > 0 ? (
                                            <span className="mobile-drawer__badge" aria-hidden="true">
                                                {badgeCount}
                                            </span>
                                        ) : null}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>
                </div>
            ) : null}
        </>
    );
}

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Heart, Menu, Plus, User, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useFavoritesStore } from "@/shared/store/favoritesStore";
import { useLanguageSync } from "@/shared/hooks/useLanguageSync";
import { HeaderLanguageSelector, HeaderThemeToggle } from "./HeaderUtilities";
import logoUrl from "@/assets/images/autobaz-logo.svg";
import { MegaMenu } from "@/components/navigation";
import { PARTS_MEGA_MENU } from "@/domain/navigation/megaMenu.config";
import { useNavStore } from "@/shared/store/navStore";
import { SUPPORTED_LANGUAGES } from "@/i18n/config";
import { ROUTES, withLang } from "@/shared/constants/routes";
import Button from "@/shared/ui/button";

/** Below this the drawer carries the whole navigation. */
const DESKTOP_QUERY = "(max-width: 1023.98px)";

const useMediaQuery = (query) => {
    const getMatch = () => {
        if (typeof window === "undefined") return false;
        return window.matchMedia(query).matches;
    };

    const [matches, setMatches] = useState(getMatch);

    useEffect(() => {
        const mql = window.matchMedia(query);
        const sync = () => setMatches(mql.matches);

        sync();
        if (typeof mql.addEventListener === "function") {
            mql.addEventListener("change", sync);
            return () => mql.removeEventListener("change", sync);
        }

        // Safari fallback
        mql.addListener(sync);
        return () => mql.removeListener(sync);
    }, [query]);

    return matches;
};

const navLinkBase =
    "inline-flex h-11 items-center rounded-[var(--radius)] px-2.5 text-[15px] font-semibold no-underline transition bg-transparent focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

/** Strip `/:lang` so `/az/rent` matches nav target `/rent`. */
const normalizeNavPath = (pathname) => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && SUPPORTED_LANGUAGES.includes(segments[0])) {
        const rest = segments.slice(1).join("/");
        return rest ? `/${rest}` : "/";
    }
    return pathname;
};

const isNavItemActive = (pathname, to) => {
    const path = normalizeNavPath(pathname);
    const target = normalizeNavPath(to);

    if (target === ROUTES.cars) {
        if (path === ROUTES.rent || path.startsWith(`${ROUTES.rent}/`)) return false;
        return path === ROUTES.cars || path.startsWith(`${ROUTES.vehicles}/`);
    }
    if (target === ROUTES.parts) {
        return path === ROUTES.parts || path.startsWith(`${ROUTES.parts}/`);
    }
    if (target === ROUTES.rent) {
        return path === ROUTES.rent || path.startsWith(`${ROUTES.rent}/`);
    }
    return path === target || path.startsWith(`${target}/`);
};

const navLinkClass = (active) =>
    `${navLinkBase} ${active ? "text-primary-text" : "text-foreground hover:bg-foreground/5"}`;

const popoverClass =
    "absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-border bg-card py-1 shadow-[var(--shadow-card)]";

const popoverItemClass =
    "flex min-h-11 w-full items-center px-4 text-left text-[14px] text-foreground no-underline transition hover:bg-foreground/5";

export default function Header() {
    const isMobile = useMediaQuery(DESKTOP_QUERY);
    const location = useLocation();
    const { t } = useTranslation('common');

    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const logout = useAuthStore((state) => state.logout);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [openPopover, setOpenPopover] = useState(null); // 'user' | 'favorites' | 'more' | null
    const [scrolled, setScrolled] = useState(false);
    const [expandedMobileMenu, setExpandedMobileMenu] = useState(null);

    const { language, setLanguage } = useLanguageSync();

    const favoritesCount = useFavoritesStore((s) => s.items.length);
    const favoriteItems = useFavoritesStore((s) => s.items);
    const removeFromFavorites = useFavoritesStore((s) => s.removeFromFavorites);

    const popoverRootRef = useRef(null);
    const closeMegaMenu = useNavStore((s) => s.closeMegaMenu);

    const favoritesCountLabel = useMemo(() => {
        const count = favoriteItems?.length ?? 0;
        if (!count) return t('labels.favoritesEmpty');
        return t('labels.favoritesCount', { count });
    }, [favoriteItems, t]);

    /** Six destinations. Parts carries the mega-menu; the rest are plain links. */
    const navItems = useMemo(
        () => [
            { key: 'cars', to: withLang(ROUTES.cars, language), label: t('nav.cars') },
            { key: 'rent', to: withLang(ROUTES.rent, language), label: t('nav.rent') },
            { key: 'parts', to: withLang(ROUTES.parts, language), label: t('nav.parts'), megaMenu: PARTS_MEGA_MENU },
            { key: 'services', to: withLang(ROUTES.services, language), label: t('nav.auto_services') },
            { key: 'specialists', to: withLang(ROUTES.specialists, language), label: t('nav.specialists') },
            { key: 'sellers', to: withLang(ROUTES.sellers, language), label: t('nav.sellers') },
        ],
        [t, language]
    );

    // ---- Priority-plus navigation -------------------------------------------------
    // The row is as wide as the locale makes it: "Ehtiyat hissələri" and "Автоуслуги"
    // are not "Parts" and "Services". Rather than pick a breakpoint that happens to fit
    // one language, measure what fits and put the rest behind "More".
    const navRef = useRef(null);
    const measureRef = useRef(null);
    const [visibleCount, setVisibleCount] = useState(navItems.length);

    useLayoutEffect(() => {
        if (isMobile) return undefined;
        const nav = navRef.current;
        const measure = measureRef.current;
        if (!nav || !measure) return undefined;

        const GAP = 4;

        const compute = () => {
            const children = Array.from(measure.children);
            if (children.length < 2) return;
            const widths = children.map((child) => child.getBoundingClientRect().width);
            const moreWidth = widths[widths.length - 1];
            const itemWidths = widths.slice(0, -1);
            const available = nav.getBoundingClientRect().width;

            const everything = itemWidths.reduce((sum, w) => sum + w, 0) + GAP * (itemWidths.length - 1);
            if (everything <= available) {
                setVisibleCount(itemWidths.length);
                return;
            }

            let used = moreWidth;
            let count = 0;
            for (let i = 0; i < itemWidths.length; i += 1) {
                const next = used + itemWidths[i] + GAP;
                if (next > available) break;
                used = next;
                count += 1;
            }
            setVisibleCount(count);
        };

        compute();
        const observer = new ResizeObserver(compute);
        observer.observe(nav);
        return () => observer.disconnect();
    }, [isMobile, navItems, language]);

    const visibleItems = navItems.slice(0, visibleCount);
    const overflowItems = navItems.slice(visibleCount);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close everything when navigating or when crossing the breakpoint.
    useEffect(() => {
        setIsDrawerOpen(false);
        setOpenPopover(null);
        setExpandedMobileMenu(null);
        closeMegaMenu();
    }, [location.pathname, isMobile, closeMegaMenu]);

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key !== "Escape") return;
            setExpandedMobileMenu(null);
            setIsDrawerOpen(false);
            setOpenPopover(null);
        };
        if (isDrawerOpen || openPopover || expandedMobileMenu) window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isDrawerOpen, openPopover, expandedMobileMenu]);

    useEffect(() => {
        if (!openPopover) return undefined;
        const onPointerDown = (e) => {
            const root = popoverRootRef.current;
            if (!root || root.contains(e.target)) return;
            setOpenPopover(null);
        };
        window.addEventListener("pointerdown", onPointerDown);
        return () => window.removeEventListener("pointerdown", onPointerDown);
    }, [openPopover]);

    useEffect(() => {
        if (!isDrawerOpen) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [isDrawerOpen]);

    const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
    const closePopover = useCallback(() => setOpenPopover(null), []);
    const togglePopover = (key) => setOpenPopover((cur) => (cur === key ? null : key));

    const renderNavItem = (item) => {
        const active = isNavItemActive(location.pathname, item.to);
        return item.megaMenu ? (
            <MegaMenu
                key={item.key}
                config={item.megaMenu}
                labelKey="nav.parts"
                active={active}
            />
        ) : (
            <Link
                key={item.key}
                to={item.to}
                className={navLinkClass(active)}
                aria-current={active ? "page" : undefined}
            >
                {item.label}
            </Link>
        );
    };

    return (
        <>
            <header
                className={`sticky top-0 z-header bg-background transition-shadow ${
                    scrolled ? 'shadow-[var(--shadow-card)]' : ''
                }`}
            >
                <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-4 px-4">
                    <Link to={ROUTES.home} className="flex shrink-0 items-center" aria-label={t('common.goHome')}>
                        <img src={logoUrl} alt="AutoBaz" className="block h-9 w-auto" />
                    </Link>

                    {!isMobile ? (
                        <div className="flex min-w-0 flex-1 items-center gap-4" ref={popoverRootRef}>
                            <nav
                                ref={navRef}
                                className="relative min-w-0 flex-1"
                                aria-label={t('labels.primaryNavigation')}
                            >
                                <div className="flex items-center gap-1">
                                    {visibleItems.map(renderNavItem)}

                                    {overflowItems.length > 0 ? (
                                        <div className="relative">
                                            <button
                                                type="button"
                                                className={`${navLinkClass(false)} gap-1`}
                                                aria-haspopup="menu"
                                                aria-expanded={openPopover === 'more'}
                                                aria-controls="popover-more"
                                                onClick={() => togglePopover('more')}
                                            >
                                                {t('nav.more')}
                                                <ChevronDown
                                                    size={16}
                                                    strokeWidth={1.5}
                                                    aria-hidden="true"
                                                    className={openPopover === 'more' ? 'rotate-180 transition-transform' : 'transition-transform'}
                                                />
                                            </button>
                                            {openPopover === 'more' ? (
                                                <div
                                                    id="popover-more"
                                                    role="menu"
                                                    aria-label={t('labels.moreNavigation')}
                                                    className={`${popoverClass} left-0 right-auto`}
                                                >
                                                    {overflowItems.map((item) => (
                                                        <Link
                                                            key={item.key}
                                                            to={item.to}
                                                            role="menuitem"
                                                            className={popoverItemClass}
                                                            onClick={closePopover}
                                                        >
                                                            {item.label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </div>

                                {/* Off-layout copy used only to measure natural widths. */}
                                <div
                                    ref={measureRef}
                                    aria-hidden="true"
                                    className="pointer-events-none invisible absolute left-0 top-0 flex items-center gap-1 whitespace-nowrap"
                                >
                                    {navItems.map((item) => (
                                        <span key={item.key} className={`${navLinkClass(false)} ${item.megaMenu ? 'pr-7' : ''}`}>
                                            {item.label}
                                        </span>
                                    ))}
                                    <span className={`${navLinkClass(false)} pr-7`}>{t('nav.more')}</span>
                                </div>
                            </nav>

                            <div className="flex shrink-0 items-center gap-2" aria-label={t('labels.headerActions')}>
                                <HeaderLanguageSelector value={language} onChange={setLanguage} />
                                <HeaderThemeToggle />

                                <div className="relative">
                                    <Button
                                        variant="icon"
                                        aria-label={favoritesCountLabel}
                                        aria-haspopup="menu"
                                        aria-expanded={openPopover === "favorites"}
                                        aria-controls="popover-favorites"
                                        onClick={() => togglePopover("favorites")}
                                    >
                                        <Heart size={20} />
                                        {favoritesCount > 0 ? (
                                            <span
                                                aria-hidden="true"
                                                className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground"
                                            >
                                                {favoritesCount}
                                            </span>
                                        ) : null}
                                    </Button>
                                    {openPopover === "favorites" ? (
                                        <div id="popover-favorites" className={popoverClass} role="menu">
                                            <div className="px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                                                {t('labels.favorites')}
                                            </div>
                                            {favoriteItems?.length ? (
                                                <div className="max-h-[320px] overflow-y-auto">
                                                    {favoriteItems.slice(0, 6).map((fav) => {
                                                        const to =
                                                            fav.type === "vehicle" ? `/vehicles/${fav.id}` : `/parts/${fav.id}`;
                                                        const title =
                                                            fav.title ||
                                                            (fav.type === "vehicle"
                                                                ? t('labels.vehicleWithNumber', { id: fav.id })
                                                                : t('labels.partWithNumber', { id: fav.id }));
                                                        return (
                                                            <div key={fav.key} className="flex items-center gap-2 pr-2" role="menuitem">
                                                                <Link
                                                                    to={to}
                                                                    className="flex min-h-11 flex-1 items-center gap-3 px-4 text-[14px] text-foreground no-underline transition hover:bg-foreground/5"
                                                                    onClick={closePopover}
                                                                >
                                                                    {fav.thumbnail ? (
                                                                        <img
                                                                            src={fav.thumbnail}
                                                                            alt=""
                                                                            loading="lazy"
                                                                            className="h-10 w-14 shrink-0 rounded-lg object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-10 w-14 shrink-0 rounded-lg bg-card-muted" />
                                                                    )}
                                                                    <span className="min-w-0">
                                                                        <span className="block truncate">{title}</span>
                                                                        <span className="block text-[12px] text-muted-foreground">
                                                                            {fav.type === "vehicle" ? t('labels.vehicle') : t('labels.part')}
                                                                        </span>
                                                                    </span>
                                                                </Link>
                                                                <Button
                                                                    variant="icon"
                                                                    aria-label={t('labels.removeFromFavorites')}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        removeFromFavorites(fav.type, fav.id);
                                                                    }}
                                                                >
                                                                    <X size={16} />
                                                                </Button>
                                                            </div>
                                                        );
                                                    })}
                                                    <Link
                                                        to="/favorites"
                                                        role="menuitem"
                                                        className={popoverItemClass}
                                                        onClick={closePopover}
                                                    >
                                                        {t('labels.viewAllFavorites')}
                                                    </Link>
                                                </div>
                                            ) : (
                                                <div className="px-4 py-3 text-[14px] text-muted-foreground" role="note">
                                                    {t('labels.noFavorites')}
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="relative">
                                    <Button
                                        variant="icon"
                                        aria-label={t('labels.account')}
                                        aria-haspopup="menu"
                                        aria-expanded={openPopover === "user"}
                                        aria-controls="popover-user"
                                        onClick={() => togglePopover("user")}
                                    >
                                        <User size={20} />
                                    </Button>
                                    {openPopover === "user" ? (
                                        <div id="popover-user" className={popoverClass} role="menu">
                                            {isAuthenticated && user ? (
                                                <>
                                                    <div className="border-b border-border px-4 py-2 text-[12px] text-muted-foreground">
                                                        {user.fullName}
                                                    </div>
                                                    <Link to="/dashboard" role="menuitem" className={popoverItemClass} onClick={closePopover}>
                                                        {t('nav.dashboard')}
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        role="menuitem"
                                                        className={`${popoverItemClass} text-destructive`}
                                                        onClick={() => { logout(); closePopover(); }}
                                                    >
                                                        {t('buttons.logout')}
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <Link to={ROUTES.login} role="menuitem" className={popoverItemClass} onClick={closePopover}>
                                                        {t('buttons.login')}
                                                    </Link>
                                                    <Link to={ROUTES.register} role="menuitem" className={popoverItemClass} onClick={closePopover}>
                                                        {t('buttons.signup')}
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                <Button asChild>
                                    <Link to={ROUTES.add}>
                                        <Plus size={18} aria-hidden="true" />
                                        <span className="hidden xl:inline">{t('nav.addListing')}</span>
                                        <span className="xl:hidden">{t('nav.add')}</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-1 items-center justify-end gap-1">
                            <HeaderLanguageSelector value={language} onChange={setLanguage} compact />

                            <Button asChild variant="icon" aria-label={favoritesCountLabel}>
                                <Link to="/favorites" className="relative">
                                    <Heart size={20} />
                                    {favoritesCount > 0 ? (
                                        <span
                                            aria-hidden="true"
                                            className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground"
                                        >
                                            {favoritesCount}
                                        </span>
                                    ) : null}
                                </Link>
                            </Button>

                            <Button
                                variant="icon"
                                onClick={() => setIsDrawerOpen(true)}
                                aria-label={t('labels.openMenu')}
                                aria-haspopup="dialog"
                                aria-expanded={isDrawerOpen}
                                aria-controls="mobile-drawer"
                            >
                                <Menu size={22} />
                            </Button>
                        </div>
                    )}
                </div>
            </header>

            {isMobile && isDrawerOpen ? (
                <div className="fixed inset-0 z-[60]">
                    <button
                        type="button"
                        className="absolute inset-0 h-full w-full bg-foreground/40 backdrop-blur-[2px]"
                        onClick={closeDrawer}
                        aria-label={t('labels.closeMenu')}
                    />

                    <aside
                        id="mobile-drawer"
                        role="dialog"
                        aria-modal="true"
                        aria-label={t('labels.mobileNavigation')}
                        className="absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col overflow-y-auto border-l border-border bg-background"
                    >
                        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
                            <span className="text-[15px] font-semibold text-foreground">{t('labels.menu')}</span>
                            <Button variant="icon" onClick={closeDrawer} aria-label={t('labels.closeMenu')}>
                                <X size={20} />
                            </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                            <HeaderLanguageSelector value={language} onChange={setLanguage} />
                            <HeaderThemeToggle />
                        </div>

                        <nav className="flex flex-col px-2 pb-4" aria-label={t('labels.mobileNavigation')}>
                            {navItems.map((item) =>
                                item.megaMenu ? (
                                    <MegaMenu
                                        key={item.key}
                                        config={item.megaMenu}
                                        labelKey="nav.parts"
                                        active={isNavItemActive(location.pathname, item.to)}
                                        isMobile
                                        isExpanded={expandedMobileMenu === item.megaMenu.id}
                                        onToggle={() =>
                                            setExpandedMobileMenu((prev) => (prev === item.megaMenu.id ? null : item.megaMenu.id))
                                        }
                                        onClose={() => setExpandedMobileMenu(null)}
                                    />
                                ) : (
                                    <Link
                                        key={item.key}
                                        to={item.to}
                                        onClick={closeDrawer}
                                        className={`${navLinkClass(isNavItemActive(location.pathname, item.to))} w-full justify-start px-4`}
                                        aria-current={
                                            isNavItemActive(location.pathname, item.to) ? "page" : undefined
                                        }
                                    >
                                        {item.label}
                                    </Link>
                                )
                            )}

                            <span className="my-2 h-px bg-border" aria-hidden="true" />

                            <Link to="/favorites" onClick={closeDrawer} className={`${navLinkClass(false)} w-full justify-start gap-2 px-4`}>
                                <Heart size={18} aria-hidden="true" />
                                {t('nav.favorites')}
                                {favoritesCount > 0 ? (
                                    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                                        {favoritesCount}
                                    </span>
                                ) : null}
                            </Link>
                            <Link
                                to={isAuthenticated ? '/dashboard' : '/login'}
                                onClick={closeDrawer}
                                className={`${navLinkClass(false)} w-full justify-start gap-2 px-4`}
                            >
                                <User size={18} aria-hidden="true" />
                                {isAuthenticated ? t('nav.dashboard') : t('nav.account')}
                            </Link>

                            <Button asChild className="mx-2 mt-3" onClick={closeDrawer}>
                                <Link to={ROUTES.add}>
                                    <Plus size={18} aria-hidden="true" />
                                    {t('nav.addListing')}
                                </Link>
                            </Button>
                        </nav>
                    </aside>
                </div>
            ) : null}
        </>
    );
}

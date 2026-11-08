import "./footer.scss";
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation('common');
    return (
        <footer className="footer mt-12 border-t border-border pt-6 pb-12">
            <div className="footer__container mx-auto w-full max-w-[1280px] px-4">
                {/* Верхняя строка */}
                <div className="mb-6 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
                    <div className="text-foreground">
                        <strong>AvtoBaz</strong> — {t('footer.tagline')}
                    </div>
                </div>

                {/* Основная сетка */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Компания */}
                    <div>
                        <h6 className="mb-4 text-base font-medium uppercase text-muted-foreground">{t('footer.company')}</h6>
                        <ul className="list-none">
                            <li><a href="/about.html" className="footer__link">{t('footer.about')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.press')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.legal')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.privacy')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.imprint')}</a></li>
                        </ul>
                    </div>

                    {/* Услуги */}
                    <div>
                        <h6 className="mb-4 text-base font-medium uppercase text-muted-foreground">{t('footer.auto_services')}</h6>
                        <ul className="list-none">
                            <li><a href="#" className="footer__link">{t('footer.forBuyers')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.forSellers')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.forDealers')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.help')}</a></li>
                        </ul>
                    </div>

                    {/* Аукционы */}
                    <div>
                        <h6 className="mb-4 text-base font-medium uppercase text-muted-foreground">{t('footer.auctions')}</h6>
                        <ul className="list-none">
                            <li><a href="#" className="footer__link">{t('footer.currentAuctions')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.howItWorks')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.rules')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.guarantees')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.sellerVerification')}</a></li>
                        </ul>
                    </div>
                </div>

                {/* Нижняя часть */}
                <hr className="my-6 border-border" />
                <div className="flex flex-col justify-between gap-2 text-sm text-muted-foreground lg:flex-row">
                    <div>{t('footer.copyright')}</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

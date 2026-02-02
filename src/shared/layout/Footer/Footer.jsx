import "./footer.scss";
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation('common');
    return (
        <footer className="footer mt-5 pt-4 pb-5 border-t border-border">
            <div className="container">
                {/* Верхняя строка */}
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mb-4">
                    <div className="text-foreground">
                        <strong>AutoDump</strong> — {t('footer.tagline')}
                    </div>
                </div>

                {/* Основная сетка */}
                <div className="row g-4">
                    {/* Компания */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <h6 className="text-uppercase text-muted-foreground mb-3">{t('footer.company')}</h6>
                        <ul className="list-unstyled mb-0">
                            <li><a href="/about.html" className="footer__link">{t('footer.about')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.press')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.legal')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.privacy')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.imprint')}</a></li>
                        </ul>
                    </div>

                    {/* Услуги */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <h6 className="text-uppercase text-muted-foreground mb-3">{t('footer.services')}</h6>
                        <ul className="list-unstyled mb-0">
                            <li><a href="#" className="footer__link">{t('footer.forBuyers')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.forSellers')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.forDealers')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.help')}</a></li>
                        </ul>
                    </div>

                    {/* Аукционы */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <h6 className="text-uppercase text-muted-foreground mb-3">{t('footer.auctions')}</h6>
                        <ul className="list-unstyled mb-0">
                            <li><a href="#" className="footer__link">{t('footer.currentAuctions')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.howItWorks')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.rules')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.guarantees')}</a></li>
                            <li><a href="#" className="footer__link">{t('footer.sellerVerification')}</a></li>
                        </ul>
                    </div>
                </div>

                {/* Нижняя часть */}
                <hr className="my-4 border-border" />
                <div className="d-flex flex-column flex-lg-row justify-content-between gap-2 text-muted-foreground small">
                    <div>{t('footer.copyright')}</div>
                    <div className="d-flex flex-wrap gap-3">
                        <span className="text-muted-foreground">{t('footer.family')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

import "./footer.scss";

const Footer = () => {
    return (
        <footer className="footer border-top mt-5 pt-4 pb-5">
            <div className="container">
                {/* Верхняя строка */}
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mb-4">
                    <div className="text-body">
                        <strong>AutoDump</strong> — срочные продажи и аукционы авто. Цены ниже рынка, время ограничено — успей забрать свою сделку.
                    </div>
                </div>

                {/* Основная сетка */}
                <div className="row g-4">
                    {/* Компания */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <h6 className="text-uppercase text-muted mb-3">Компания</h6>
                        <ul className="list-unstyled mb-0">
                            <li><a href="/about.html" className="footer__link">О нас</a></li>
                            <li><a href="#" className="footer__link">Пресса</a></li>
                            <li><a href="#" className="footer__link">Правовая информация</a></li>
                            <li><a href="#" className="footer__link">Защита данных</a></li>
                            <li><a href="#" className="footer__link">Реквизиты</a></li>
                        </ul>
                    </div>

                    {/* Услуги */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <h6 className="text-uppercase text-muted mb-3">Услуги</h6>
                        <ul className="list-unstyled mb-0">
                            <li><a href="#" className="footer__link">Покупателям</a></li>
                            <li><a href="#" className="footer__link">Продавцам</a></li>
                            <li><a href="#" className="footer__link">Дилерам</a></li>
                            <li><a href="#" className="footer__link">Помощь / FAQ</a></li>
                        </ul>
                    </div>

                    {/* Аукционы */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <h6 className="text-uppercase text-muted mb-3">Аукционы</h6>
                        <ul className="list-unstyled mb-0">
                            <li><a href="#" className="footer__link">Текущие аукционы</a></li>
                            <li><a href="#" className="footer__link">Как это работает</a></li>
                            <li><a href="#" className="footer__link">Правила и комиссии</a></li>
                            <li><a href="#" className="footer__link">Гарантии / Эскроу</a></li>
                            <li><a href="#" className="footer__link">Верификация продавца</a></li>
                        </ul>
                    </div>

                    {/* Язык */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <h6 className="text-uppercase text-muted mb-3">Язык</h6>
                        <select className="form-select w-auto">
                            <option value="ru">Русский</option>
                            <option value="de">Deutsch</option>
                            <option value="en">English</option>
                            <option value="tr">Türkçe</option>
                        </select>
                    </div>
                </div>

                {/* Нижняя часть */}
                <hr className="my-4" />
                <div className="d-flex flex-column flex-lg-row justify-content-between gap-2 text-secondary small">
                    <div>© 2025 AutoDump GmbH. Alle Rechte vorbehalten.</div>
                    <div className="d-flex flex-wrap gap-3">
                        <span className="text-muted">AutoDump.de Media &amp; Smyle — часть семьи AutoDump.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

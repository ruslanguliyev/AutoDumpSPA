import React from "react";
// import styles from "./Footer.module.scss";

const Footer = () => {
    return (
        <footer className="border-top mt-5 pt-4 pb-5">
            <div className="container">
                {/* Верхняя строка */}
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mb-4">
                    <div className="text-body">
                        <strong>AutoDump</strong> — срочные продажи и аукционы авто.
                        Цены ниже рынка, время ограничено — успей забрать свою сделку.
                    </div>
                </div>

                {/* Основная сетка */}
                <div className="row g-4">
                    {/* Компания */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <h6 className="text-uppercase text-muted mb-3">Компания</h6>
                        <ul className="list-unstyled mb-0">
                            <li><a href="/about.html" className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">О нас</a></li>
                            <li><a href="#" className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">Пресса</a></li>
                            <li><a href="#" className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">Правовая информация</a></li>
                            <li><a href="#" className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">Защита данных</a></li>
                            <li><a href="#" className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">Реквизиты</a></li>
                        </ul>
                    </div>

                    {/* Услуги */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <h6 className="text-uppercase text-muted mb-3">Услуги</h6>
                        <ul className="list-unstyled mb-0">
                            <li><a href="#" className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">Покупателям</a></li>
                            <li><a href="#" className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">Продавцам</a></li>
                            <li><a href="#" className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">Дилерам</a></li>
                            <li><a href="#" className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">Помощь / FAQ</a></li>
                        </ul>
                    </div>

                    {/* Аукционы */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <h6 className="text-uppercase text-muted mb-3">Аукционы</h6>
                        <ul className="list-unstyled mb-0">
                            <li><a href="#" className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">Текущие аукционы</a></li>
                            <li><a href="#" className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">Как это работает</a></li>
                            <li><a href="#" className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">Правила и комиссии</a></li>
                            <li><a href="#" className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">Гарантии / Эскроу</a></li>
                            <li><a href="#" className="link-secondary link-underline-opacity-0 link-underline-opacity-100-hover">Верификация продавца</a></li>
                        </ul>
                    </div>

                    {/* Язык */}
                    <div className="col-12 col-md-6 col-lg-3">
                        <h6 className="text-uppercase text-muted mb-2">Язык</h6>
                        <select className="form-select w-auto">
                            <option selected>Русский</option>
                            <option>Deutsch</option>
                            <option>English</option>
                            <option>Türkçe</option>
                        </select>
                    </div>
                </div>

                {/* Низ футера */}
                <hr className="my-4" />
                <div className="d-flex flex-column flex-lg-row justify-content-between gap-2 text-secondary small">
                    <div>© 2025 AutoDump GmbH. Alle Rechte vorbehalten.</div>
                    <div className="d-flex flex-wrap gap-3">
                        <span className="text-muted">AutoDump.de Media & Smyle — часть семьи AutoDump.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

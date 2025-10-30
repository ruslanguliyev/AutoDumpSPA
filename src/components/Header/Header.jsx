import React from "react";
import styles from "./Header.module.scss";

const Header = () => {
    return (
        <header id="mainHeader" className={styles.header}>
            <nav className="navbar navbar-expand-md bg-body">
                <div className="container">
                    <a className="navbar-brand fw-bold" href="#">
                        <img
                            className={`${styles.logo} w-auto d-block`}
                            src="/src/assets/images/autodump-logo.PNG"
                            alt="Logo"
                        />
                    </a>

                    <button
                        className="navbar-toggler ms-auto"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainNav"
                        aria-controls="mainNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="mainNav">
                        <ul className="navbar-nav mx-md-auto my-2 my-md-0 gap-2">
                            <li className="nav-item">
                                <a className="nav-link" href="/about.html">About</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Auctions</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Pricing</a>
                            </li>
                        </ul>

                        <div className="d-flex gap-2 ms-md-0 ms-auto">
                            <a className="btn btn-outline-primary" href="#">Log in</a>
                            <a className="btn btn-outline-primary" href="#">Sign in</a>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;

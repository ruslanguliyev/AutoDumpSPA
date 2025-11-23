import { FC } from "react";
import "./Header.scss";

const Header: FC = () => {
  return (
    <header id="mainHeader" className="header">
      <nav className="navbar navbar-expand-md bg-body header__nav">
        <div className="container">
          <a className="navbar-brand fw-bold header__brand" href="/">
            <img
              className="header__logo w-auto d-block"
              height={50}
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

          <div className="collapse navbar-collapse header__menu" id="mainNav">
            <ul className="navbar-nav mx-md-auto my-2 my-md-0 gap-2 header__list">
              <li className="nav-item">
                <a className="nav-link header__link" href="/about">
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link header__link" href="#">
                  Auctions
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link header__link" href="#">
                  Pricing
                </a>
              </li>
            </ul>

            <div className="d-flex gap-2 ms-md-0 ms-auto header__auth">
              <a className="btn btn-outline-primary">Log in</a>
              <a className="btn btn-outline-primary">Sign in</a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

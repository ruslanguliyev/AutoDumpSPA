import Header from '../components/Header/Header'
import Routers from '../routes/Routers'
import { Outlet } from 'react-router-dom'
import ScrollToTopOnRouteChange from '../components/ScrollToTopOnRouteChange'
import Footer from '../components/Footer/Footer'

const Layout = () => {
    return (
        <>
            <ScrollToTopOnRouteChange />
            <Header />
            <Routers />
            <Footer />
            <Outlet />
        </>
    )
}

export default Layout
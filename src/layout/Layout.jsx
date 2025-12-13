import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import Routers from '../routes/Routers'
import { Outlet } from 'react-router-dom'
import ScrollToTopOnRouteChange from '../components/ScrollToTopOnRouteChange'

const Layout = () => {
    return (
        <>
            <ScrollToTopOnRouteChange />
            <Header />
            <Routers />
            <Outlet />
            <Footer />
        </>
    )
}

export default Layout
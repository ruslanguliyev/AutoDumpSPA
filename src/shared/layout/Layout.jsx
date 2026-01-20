import Header from '@/shared/layout/Header/Header'
import Routers from '@/routes/Routers'
import { Outlet } from 'react-router-dom'
import ScrollToTopOnRouteChange from '@/shared/hooks/ScrollToTopOnRouteChange'
import Footer from '@/shared/layout/Footer/Footer'

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
import Header from '@/shared/layout/Header/Header'
import Footer from '@/shared/layout/Footer/Footer'
import { Outlet } from 'react-router-dom'

const Layout = () => {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    )
}

export default Layout
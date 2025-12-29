// src/routes/Routers.jsx
import { Routes, Route } from "react-router-dom";
import Home from '../pages/home/Home';
import About from '../pages/about/About';
import SearchResults from '../pages/searchResults/SearchResults';
import VehicleDetail from '../pages/vehicleDetail/VehicleDetail';
import PartsPage from '../pages/PartsPage';
import SellerPage from "../pages/seller/SellerPage";


const Routers = () => {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/search' element={<SearchResults />} /> 
            <Route path='/parts' element={<PartsPage/>}/>
            <Route path='/vehicles/:id' element={<VehicleDetail/>} />
            <Route path="/seller/:sellerId" element={<SellerPage />} />
        </Routes>
    );
};

export default Routers;

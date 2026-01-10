// src/routes/Routers.jsx
import { Routes, Route } from "react-router-dom";
import Home from '../pages/home/Home';
import About from '../pages/about/About';
import SearchResults from '../pages/searchResults/SearchResults';
import VehicleDetail from '../pages/vehicleDetail/VehicleDetail';
import SellerPage from "../pages/seller/SellerPage";
import PartsPage from "../pages/parts/PartsPage";


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

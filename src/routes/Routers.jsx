// src/routes/Routers.jsx
import { Routes, Route } from "react-router-dom";
import Home from '@/vehicles/pages/home/Home';
import About from '@/app/pages/about/About';
import AutoSearchResults from '@/vehicles/pages/AutoSearchResults/AutoSearchResults';
import VehicleDetail from '@/vehicles/pages/vehicleDetail/VehicleDetail';
import SellerPage from "@/vehicles/pages/dealers/SellerPage";
import DealerDetailPage from "@/vehicles/pages/dealers/DealerDetailPage";
import PartsPage from "@/parts/pages/PartsPage";
import PartDetail from "@/parts/pages/partDetail/PartDetail";


const Routers = () => {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/autosearch' element={<AutoSearchResults />} /> 
            <Route path='/parts' element={<PartsPage/>}/>
            <Route path='/parts/:id' element={<PartDetail/>}/>
            <Route path='/vehicles/:id' element={<VehicleDetail/>} />
            <Route path="/dealers" element={<SellerPage />} />
            <Route path="/dealers/:dealerId" element={<DealerDetailPage />} />
        </Routes>
    );
};

export default Routers;

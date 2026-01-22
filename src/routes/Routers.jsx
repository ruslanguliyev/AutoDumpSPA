// src/routes/Routers.jsx
import { Routes, Route } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Home from "@/vehicles/pages/home/Home";
import About from "@/app/pages/about/About";
import AutoSearchResults from "@/vehicles/pages/AutoSearchResults/AutoSearchResults";
import VehicleDetail from "@/vehicles/pages/vehicleDetail/VehicleDetail";
import PartsPage from "@/parts/pages/PartsPage";
import PartDetail from "@/parts/pages/partDetail/PartDetail";

import { autos } from "@/vehicles/api/data";
import { fetchParts } from "@/parts/api/parts.api";
import { PARTS_DEFAULT_FILTER } from "@/parts/utils/parts.constants";
import SellersPage from "@/sellers/pages/SellersPage";
import SellerDetailPage from "@/sellers/pages/SellerDetailPage";

const PARTS_QUERY_KEY = "parts";
const EMPTY_LIST = [];

const useSellersPartsQuery = () =>
    useQuery({
        queryKey: [PARTS_QUERY_KEY, "sellers"],
        queryFn: () =>
            fetchParts({ ...PARTS_DEFAULT_FILTER, limit: 10_000, offset: 0 }),
        staleTime: 30_000,
    });

const SellersPageRoute = () => {
    const partsQuery = useSellersPartsQuery();
    const partsItems = partsQuery.data?.items ?? EMPTY_LIST;

    return (
        <SellersPage
            vehicles={autos}
            parts={partsItems}
            isPartsLoading={partsQuery.isLoading}
        />
    );
};

const SellerDetailPageRoute = () => {
    const partsQuery = useSellersPartsQuery();
    const partsItems = partsQuery.data?.items ?? EMPTY_LIST;

    return <SellerDetailPage vehicles={autos} parts={partsItems} />;
};


const Routers = () => {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/autosearch' element={<AutoSearchResults />} /> 
            <Route path='/parts' element={<PartsPage/>}/>
            <Route path='/parts/:id' element={<PartDetail/>}/>
            <Route path='/vehicles/:id' element={<VehicleDetail/>} />
            <Route path="/sellers" element={<SellersPageRoute />} />
            <Route path="/sellers/:sellerId" element={<SellerDetailPageRoute />} />
            <Route path="/dealers" element={<SellersPageRoute />} />
            <Route path="/dealers/:sellerId" element={<SellerDetailPageRoute />} />
        </Routes>
    );
};

export default Routers;

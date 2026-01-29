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
import ServicesListPage from "@/services/pages/ServicesListPage";
import ServiceDetailPage from "@/services/pages/ServiceDetailPage";

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

    // Handle error state - don't block rendering if parts fail to load
    if (partsQuery.error) {
        console.error('Error loading parts for sellers:', partsQuery.error);
    }

    try {
        return (
            <SellersPage
                vehicles={autos ?? []}
                parts={partsItems}
                isPartsLoading={partsQuery.isLoading}
            />
        );
    } catch (error) {
        console.error('Error rendering SellersPage:', error);
        return (
            <div className="w-full px-4 py-10">
                <div className="mx-auto w-full max-w-[1280px]">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                        <div className="font-semibold">Error loading sellers page</div>
                        <div className="mt-1">{error?.message || String(error)}</div>
                    </div>
                </div>
            </div>
        );
    }
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
            <Route path="/services" element={<ServicesListPage />} />
            <Route path="/services/:idOrSlug" element={<ServiceDetailPage />} />
        </Routes>
    );
};

export default Routers;

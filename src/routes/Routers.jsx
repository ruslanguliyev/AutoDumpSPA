// src/routes/Routers.jsx
import React from 'react';
import { Routes, Route } from "react-router-dom";
import Home from '../pages/home/Home';
import About from '../pages/about/About';
import SearchResults from '../pages/searchResults/SearchResults';
import VehicleDetail from '../pages/vehicleDetail/VehicleDetail';


const Routers = () => {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/search' element={<SearchResults />} /> 
            <Route path='/vehicles/:id' element={<VehicleDetail/>} />
        </Routes>
    );
};

export default Routers;

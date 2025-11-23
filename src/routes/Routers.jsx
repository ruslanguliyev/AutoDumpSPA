// src/routes/Routers.jsx
import React from 'react';
import { Routes, Route } from "react-router-dom";
import Home from '../pages/home/Home';
import About from '../pages/about/About';
import SearchResults from '../pages/searchResults/SearchResults';

const Routers = () => {
    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/search' element={<SearchResults />} /> 
        </Routes>
    );
};

export default Routers;

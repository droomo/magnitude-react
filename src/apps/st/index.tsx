import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from "react-router-dom"
import Experiment from "./Experiment";
import Login from "./Login";
import './css/style.css'
import Introduction from "./Introduction";
import ExperimentTest from "./ExperimentTest";


const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Experiment/>}/>
            <Route path="/test/space/" element={<ExperimentTest/>}/>
            <Route path="/intro/*" element={<Introduction/>}/>
            <Route path="/login/" element={<Login/>}/>
        </Routes>
    </BrowserRouter>
);

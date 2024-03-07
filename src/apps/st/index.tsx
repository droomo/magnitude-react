import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from "react-router-dom"
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
            <Route path="/st/" element={<Experiment/>}/>
            <Route path="/st/test/" element={<ExperimentTest/>}/>
            <Route path="/st/intro/*" element={<Introduction/>}/>
            <Route path="/st/login/" element={<Login/>}/>
        </Routes>
    </BrowserRouter>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Experiment from "./Experiment";
import Login from "./Login";
import './style.css'

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/st/" element={<Experiment/>}/>
                <Route path="/st/login" element={<Login/>}/>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

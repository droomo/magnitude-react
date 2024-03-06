import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Experiment from "./Experiment";
import Login from "./Login";
import './style.css'
import WebGLProvider from "./WebGLProvider";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/st/" element={<WebGLProvider><Experiment/></WebGLProvider>}/>
            <Route path="/st/login" element={<Login/>}/>
        </Routes>
    </BrowserRouter>
);

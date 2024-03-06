import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Experiment from "./Experiment";
import Login from "./Login";
import './css/style.css'
import WebGLProvider from "./WebGLProvider";
import Intro from "./Intro";


const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
        <WebGLProvider>
            <Routes>
                <Route path="/st/" element={<Experiment/>}/>
                <Route path="/st/intro/*" element={<Intro/>}/>
                <Route path="/st/login/" element={<Login/>}/>
            </Routes>
        </WebGLProvider>
    </BrowserRouter>
);

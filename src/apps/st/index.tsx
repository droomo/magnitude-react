import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Scene from "./Scene";
import './style.css'
import SceneProcedure from "./SceneProcedure";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/stp/" element={<Scene/>}/>
            <Route path="/st/" element={<SceneProcedure/>}/>
        </Routes>
    </BrowserRouter>
);

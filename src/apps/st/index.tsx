import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Scene from "./Scene";
import './style.css'
import SceneProcedure from "./SceneRoom";
import SceneShape from './SceneShape';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/st/__react" element={<Scene/>}/>
            <Route path="/st/" element={<SceneProcedure/>}/>
            <Route path="/st/shape" element={<SceneShape/>}/>
        </Routes>
    </BrowserRouter>
);

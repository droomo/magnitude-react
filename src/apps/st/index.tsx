import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Scene from "./discard/Scene";
import './style.css'
import SceneShapeRadius from "./Scene/SceneShapeRadius";
import SceneShape from './discard/SceneShape';
import TimeCounter from "./Scene/TimeCounter";
import Experiment from "./Experiment";
import Login from "./Login";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/st/__react" element={<Scene/>}/>
            <Route path="/st/" element={<Experiment/>}/>
            <Route path="/st/login" element={<Login/>}/>
            <Route path="/st/shaper" element={<SceneShapeRadius/>}/>
            <Route path="/st/shape" element={<SceneShape/>}/>
            <Route path="/st/time" element={<TimeCounter/>}/>
        </Routes>
    </BrowserRouter>
);

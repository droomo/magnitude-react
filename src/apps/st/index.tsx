import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from "react-router-dom"
import Experiment from "./Experiment";
import Login from "./Login";
import './css/style.css'
import Introduction from "./Introduction";
import ExperimentTest from "./ExperimentTest";
import {BlockType} from "../const";
import Control from "./control/Control";
import SceneShapeRadius from "./Scene/SceneShapeRadius";


const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/control" element={<Control/>}/>
            <Route path="/" element={<Experiment/>}/>
            <Route path="/test/space/" element={<ExperimentTest blockType={BlockType.Space}/>}/>
            <Route path="/test/S/" element={<SceneShapeRadius done={() => {
            }}/>}/>
            <Route path="/test/distance/" element={<ExperimentTest blockType={BlockType.Distance}/>}/>
            <Route path="/intro/*" element={<Introduction/>}/>
            <Route path="/login/" element={<Login/>}/>
        </Routes>
    </BrowserRouter>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from "react-router-dom"
import Experiment from "./Experiment";
import Login from "./Login";
import './css/style.css'
import Introduction from "./Introduction";
import ExperimentTest from "./ExperimentTest";
import SceneRoomDev from "./Scene/SceneRoomDev";
import {BlockType} from "../const";


const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Experiment/>}/>
            <Route path="/test/space/" element={<ExperimentTest blockType={BlockType.Space}/>}/>
            <Route path="/test/time/" element={<ExperimentTest blockType={BlockType.Time}/>}/>
            <Route path="/intro/*" element={<Introduction/>}/>
            <Route path="/login/" element={<Login/>}/>
            <Route path="/dev/" element={<SceneRoomDev room={{
                width: 8,
                height: 3,
                depth: 5,
                wall: 0,
                ground: 0,
                duration: 10000
            }}/>}/>
        </Routes>
    </BrowserRouter>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Experiment from "./Experiment";
import Login from "./Login";
import './css/style.css'
import Introduction from "./Introduction";
import ExperimentTest from "./ExperimentTest";
import SceneRoomDev from "./Scene/SceneRoomDev";


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
            <Route path="/st/dev/" element={<SceneRoomDev room={{
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

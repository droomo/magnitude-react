import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from "react-router-dom"
import './css/style.css'
import Control from "./control/Control";
import SceneRoomPractice from "./Scene/SceneRoomPractice";


const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/control" element={<Control/>}/>
            <Route path="/" element={<SceneRoomPractice/>}/>
        </Routes>
    </BrowserRouter>
);

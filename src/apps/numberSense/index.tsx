import React from 'react';
import ReactDOM from 'react-dom/client';
import StimuliGenerator2 from "./StimuliGenerator2";
import {BrowserRouter, Routes, Route} from "react-router-dom"
import StimuliViewer from "./StimuliViewer";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/psy/number-sense/stimuli-generator/" element={<StimuliGenerator2/>}/>
            <Route path="/psy/number-sense/stimuli-viewer/" element={<StimuliViewer/>}/>
        </Routes>
    </BrowserRouter>
);

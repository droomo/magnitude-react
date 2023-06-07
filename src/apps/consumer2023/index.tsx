import React from 'react';
import ReactDOM from 'react-dom/client';
import AppSurvey from './AppSurvey';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <AppSurvey/>
    </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import AppSurvey from './AppSurvey';

import axios from 'axios';

axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <AppSurvey/>
    </React.StrictMode>
);

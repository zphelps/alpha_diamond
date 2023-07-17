import React, {Suspense} from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import {HelmetProvider} from "react-helmet-async";
import {BrowserRouter} from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <Suspense>
                    <App/>
                </Suspense>
            </BrowserRouter>
        </HelmetProvider>
    </React.StrictMode>,
)

import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes } from './routes';
import './style.scss';

ReactDOM.render(
    <Router>
        <Routes />
    </Router>,
    document.getElementById('root')
);

serviceWorker.unregister();

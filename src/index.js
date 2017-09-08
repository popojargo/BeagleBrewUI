import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import FluidSimulation from './FluidSimulation';
import registerServiceWorker from './registerServiceWorker';

const brewGrid =
    <div>
        <FluidSimulation />
        <App />
    </div>;

ReactDOM.render(brewGrid, document.getElementById('root'));
registerServiceWorker();

import React from 'react';
import ReactDOM from 'react-dom';
import BeagleBrewUI from './BeagleBrewUI/BeagleBrewUI';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<BeagleBrewUI />, document.getElementById('root'));
registerServiceWorker();

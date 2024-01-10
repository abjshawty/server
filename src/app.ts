// Imports
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './router';

function init(){
    // Create Express Server
    const app = express()

    // Allow Cross-Origin requests
    app.use(cors({ origin : true }));

    // Security
    app.use(helmet());

    // Allow JSON & Text in POST and PUT requests
    app.use(express.json());
    app.use(express.text({ type : 'text/html' }));
    
    // Add all the defined routes to the server
    app.use(router)

    // Send the server with all parameters defined
    return app
}

// Exports
export default init()

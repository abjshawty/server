// Imports
import express from 'express'
import cors from 'cors'
import { router } from './router';

function init(){
    // Create Express Server
    const app = express()

    // Allow Cross-Origin requests
    app.use(cors({ origin : true }));

    // Allow JSON & Text in POST and PUT requests
    app.use(express.json());
    app.use(express.text({ type : 'text/html' }));
    
    // Add all the defined routes to the server
    app.use(router)
    return app
}

// Exports
export const server = init()

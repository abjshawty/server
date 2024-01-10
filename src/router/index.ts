// Import the routes from each file
import { getAllRoutes } from "../utils";
import testRoutes from "./testRoutes";

import { Router } from "express";

function init(){
    // Create a router for general use
    const router = Router()

    // Add the routes to the router
    // Simple routes
    router.get('/', (req, res) => res.send({ routes : getAllRoutes(router)}))
    // Grouped routes
    router.use('/test', testRoutes);

    // Return the router
    return router;
}

// Exoprt the route module
export default init();

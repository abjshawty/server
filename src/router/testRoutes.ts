import { Router } from "express";
import { server } from '../app';
import { getAllRoutes } from "../utils";

function testRoutesFactory(){
    // Create a router for specific subfolders of requests
    const testRoutes = Router();

    // Define sub-routes
    testRoutes.get("/", async(req, res) => res.send({msg:"Test 1, OK!"}));
    testRoutes.get("/routes", (req, res) => res.send({ routes : getAllRoutes(server) }));

    // Return the router
    return testRoutes;
}

// Export the router with all routes added
export default testRoutesFactory();
import getEndpoints from "express-list-endpoints";

const getAllRoutes = (app:any) => {
    return getEndpoints(app)
    .map
    (
        (endpoint) => endpoint.methods + " " + endpoint.path
    )
}

export default getAllRoutes
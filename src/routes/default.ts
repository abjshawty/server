export default {
    "/": () => Response.redirect("/docs"),
    "/health": () => new Response("ok"),
    "/docs": () => new Response("ok"),
};
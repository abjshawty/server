const server = Bun.serve({
  port: 3000,
  routes: {
    "/": () => new Response('Bun is live!'),
  }
});

console.log(`Listening on ${server.url}`)

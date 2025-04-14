import { server } from "./helpers";
import { Server as messages } from "./messages";
const main = () => server.start().catch((error) => messages.error(error));
main();
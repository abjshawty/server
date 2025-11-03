import { Post as Build } from "@prisma/client";
import { post as controller } from "../controllers";
import { ServiceFactory } from "../helpers";
class Service extends ServiceFactory<Build> { }
export default new Service(controller);
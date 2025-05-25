import { User as Build } from "@prisma/client";
import { User as Controller } from "../controllers";
import { ServiceFactory } from "../helpers";
class Service extends ServiceFactory<Build> {}
export default new Service(Controller);

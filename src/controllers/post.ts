import { Post as Build } from "client";
import { ControllerFactory } from "../helpers";
class Controller extends ControllerFactory<Build> { }
export default new Controller('post');

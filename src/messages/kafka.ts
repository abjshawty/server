import { log } from "console";
import { env } from "../helpers";
import * as locales from "../locales";
let lang: {
    Database?: any;
    Kafka: any;
    Server?: any;
};
if (env.language == "en-US") {
    lang = locales.en;
} else {
    lang = locales.fr;
}
export default {
    start: () => log(`${lang.Kafka.start}`),
    error: (error: Error, message?: string) => log(`${lang.Kafka.error}, ${message}:\n${error.message}`),
    close: () => log(`${lang.Kafka.close}`),
};
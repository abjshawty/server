import { ApiError } from "../errors";
class Result {
    constructor (
        public data: any,
        public status: number = 200,
        public error?: ApiError | null,
    ) {
        this.data = data;
        this.error = error;
        this.status = error ? error.statusCode : status;
    }
}

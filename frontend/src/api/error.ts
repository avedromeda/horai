export default class APIError {
    message: any;
    responseCode: number;
    constructor(message: any, responseCode: number) {
        this.message = message
        this.responseCode = responseCode
    }
}
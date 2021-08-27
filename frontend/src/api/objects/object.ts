import APIChild from "../child";

export default class APIObject extends APIChild {
    path(): string {
        return "";
    }

    async createObjectRequest(method: string, body?: BodyInit): Promise<Response> {
        return await super.createRequest(this.createEndpoint(this.path()), method, body);
    }
}
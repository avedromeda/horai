import APIChild from "../child";

export default class APIObject extends APIChild {
    data: any;
    
    path(): string {
        return "";
    }

    async update() {
        const response = await this.createObjectRequest(
            "PUT",
            this.createForm({
                ...this.data
            })
        )

        const data = await this.validateResponse(response);
        this.data = data;
        return data;
    }

    async createObjectRequest(method: string, body?: BodyInit): Promise<Response> {
        return await super.createRequest(this.createEndpoint(this.path()), method, body);
    }
}
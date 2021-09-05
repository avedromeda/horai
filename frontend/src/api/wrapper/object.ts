import APIChild from "../child";

export default class APIObject extends APIChild {
    data: any;

    path(): string {
        return "";
    }

    get id() {
        return this.data.id;
    }

    get createdOn() {
        return new Date(this.data.created_on * 1000);
    }

    get updatedOn() {
        return new Date(this.data.updated_on * 1000);
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
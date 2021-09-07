import APIChild from "../child";

export default class APIObject<P, R> extends APIChild {
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

    async update(newData?: P): Promise<R> {
        const response = await this.createObjectRequest(
            "PUT",
            this.createForm({
                ...(newData ?? this.data)
            })
        )

        const data: R = await this.validateResponse(response);
        this.data = data;
        return data;
    }

    async createObjectRequest(method: string, body?: BodyInit): Promise<Response> {
        return await super.createRequest(this.createEndpoint(this.path()), method, body);
    }
}
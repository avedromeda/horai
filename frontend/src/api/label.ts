import API from "./api";
import APIChild from "./child"

export interface ILabel {
    id: number
    name: string,
    color: number
}
export interface ILabelProps {
    name: string,
    color: number
}

export default class APILabel extends APIChild {
    constructor(api: API) {
        super(api);
    }

    async all(): Promise<ILabel[]> {
        const response = await this.createRequest(
            this.createEndpoint("labels"), "GET"
        )

        return (await this.validateResponse(response)).labels;
    }

    async create({ name, color }: ILabelProps): Promise<ILabel> {
        const response = await this.createRequest(
            this.createEndpoint("labels"), "POST",
            this.createForm({
                name,
                color
            })
        )

        return await this.validateResponse(response);
    }

    async get(labelId: number): Promise<ILabel> {
        const response = await this.createRequest(
            this.createEndpoint("label", labelId.toString()), "GET"
        )

        return await this.validateResponse(response);
    }

    async delete(labelId: number) {
        const response = await this.createRequest(
            this.createEndpoint("label", labelId.toString()), "DELETE"
        )

        await this.validateResponse(response);
    }
}
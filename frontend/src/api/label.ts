import API from "./api";
import APIChild from "./child"
import { ILabel } from "./objects/label";
import { INote } from "./objects/note";
import { ISubject } from "./objects/subject";


export interface ILabelProps {
    name: string,
    color: number
}

export default class APILabel extends APIChild {
    constructor(api: API) {
        super(api);
    }

    async all(): Promise<INote[]> {
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

    async get(labelId: number): Promise<INote> {
        const response = await this.createRequest(
            this.createEndpoint("label", labelId.toString()), "GET"
        )

        return await this.validateResponse(response);
    }
}
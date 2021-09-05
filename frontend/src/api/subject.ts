import API from "./api";
import APIChild from "./child"
import { INote } from "./note";


export interface ISubject {
    id: number
    name: string,
    user_id: number,
    notes: INote[],
    created_on: number,
    updated_on: number
}

export interface ISubjectProps {
    name: string
}

export default class APISubject extends APIChild {
    constructor (api: API) {
        super(api);
    }

    async all(): Promise<ISubject[]> {
        const response = await this.createRequest(
            this.createEndpoint("subjects"), "GET"
        )

        return (await this.validateResponse(response)).subjects;
    }

    async create({ name }: ISubjectProps): Promise<ISubject> {
        const response = await this.createRequest(
            this.createEndpoint("subjects"), "POST",
            this.createForm({
                name
            })
        )

        return await this.validateResponse(response);
    }

    async get(subjectId: number): Promise<ISubject> {
        const response = await this.createRequest(
            this.createEndpoint("subject", subjectId.toString()), "GET"
        )

        return await this.validateResponse(response);
    }

    async delete(subjectId: number) {
        const response = await this.createRequest(
            this.createEndpoint("subject", subjectId.toString()), "DELETE"
        )

        await this.validateResponse(response);
    }
}
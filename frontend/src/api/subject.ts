import API from "./api";
import APIChild from "./child"
import { ISubject } from "./objects/subject";


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
}
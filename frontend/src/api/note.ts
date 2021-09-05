import API from "./api";
import APIChild from "./child"

export interface INote {
    id: number
    title: string,
    content: string,
    user_id: number,
    label: number[],
    created_on: number,
    updated_on: number
}

export interface INoteProps {
    title: string,
    content: string,
    label: number[]
}

export default class APINote extends APIChild {
    constructor(api: API) {
        super(api);
    }

    async all(subjectId: number): Promise<INote[]> {
        const response = await this.createRequest(
            this.createEndpoint("subject", subjectId.toString(), "notes"), "GET"
        )

        return (await this.validateResponse(response)).notes;
    }

    async create(subjectId: number, { title, content, label }: INoteProps): Promise<INote> {
        const response = await this.createRequest(
            this.createEndpoint("subject", subjectId.toString(), "notes"), "POST",
            this.createForm({
                title,
                content,
                label
            })
        )

        return await this.validateResponse(response);
    }

    async get(subjectId: number, noteId: number): Promise<INote> {
        const response = await this.createRequest(
            this.createEndpoint("subject", subjectId.toString(), "note", noteId.toString()), "GET"
        )

        return await this.validateResponse(response);
    }

    async delete(subjectId: number, noteId: number) {
        const response = await this.createRequest(
            this.createEndpoint("subject", subjectId.toString(), "note", noteId.toString()), "DELETE"
        )

        await this.validateResponse(response);
    }
}
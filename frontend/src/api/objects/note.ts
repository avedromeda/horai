import API from "../api";
import APIChild from "../child";
import APIObject from "./object";
import Subject from "./subject";

export interface INote {
    id: number
    title: string,
    content: string,
    user_id: number
}

export default class Note extends APIObject {
    data: INote;
    subject: Subject;
    constructor (api: API, subject: Subject, data: INote) {
        super(api);

        this.data = data;
        this.subject = subject;
    }

    get title() {
        return this.data.title;
    }

    get content() {
        return this.data.content;
    }

    path() {
        return this.subject.path() + "/notes/" + this.data.id.toString() + "/";
    }

    async setTitle(title: string) {
        const response = await this.createObjectRequest(
            "PUT",
            this.createForm({
                title,
                content: this.content
            })
        )

        const data = await this.validateResponse(response);
        this.data = data;
        return data;
    }

    async setContent(content: string) {
        const response = await this.createObjectRequest(
            "PUT",
            this.createForm({
                title: this.title,
                content: this.content
            })
        )

        const data = await this.validateResponse(response);
        this.data = data;
        return data;
    }
}
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
        this.data.title = title;
        return await this.update();
    }

    async setContent(content: string) {
        this.data.content = content;
        return await this.update();
    }
}
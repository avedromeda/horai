import API from "../api";
import { INote } from "../note";
import Label from "./label";
import APIObject from "./object";
import Subject from "./subject";


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

    /**
     * NOTE: IS ASYNC!
     */
    get labels() {
        return Promise.all(this.data.label.map(labelId => this.api.label.get(labelId)));
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

    async addLabel(label: Label) {
        this.data.label.push(label.data.id);
        return await this.update();
    }

    async removeLabel(label: Label) {
        const idx = this.data.label.indexOf(label.data.id);
        if (idx > -1) {
            this.data.label.splice(idx, 1);
        }

        return await this.update();
    }

    async delete() {
        await this.api.note.delete(this.subject.data.id, this.data.id);
    }
}
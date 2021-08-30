import API from "../api";
import { INoteProps } from "../note";
import { ISubject } from "../subject";
import Note from "./note";
import APIObject from "./object";



export default class Subject extends APIObject {
    data: ISubject;
    constructor (api: API, data: ISubject) {
        super(api);

        this.data = data;
    }

    path() {
        return "subject/" + this.data.id.toString() + "/";
    }

    get name() {
        return this.data.name;
    }

    get notes() {
        return this.data.notes.map(inote => new Note(this.api, this, inote));
    }

    async createNote(note: INoteProps) {
        return new Note(this.api, this, await this.api.note.create(this.id, note));
    }

    async setName(name: string) {
        this.data.name = name;
        return await this.update();
    }

    async delete() {
        await this.api.subject.delete(this.data.id);
    }
}
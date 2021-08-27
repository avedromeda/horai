import API from "../api";
import APIChild from "../child";
import Note, { INote } from "./note";
import APIObject from "./object";

export interface ISubject {
    id: number
    name: string,
    user_id: number,
    notes: INote[]
}

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

    async setName(name: string) {
        const response = await this.createObjectRequest(
            "PUT",
            this.createForm({
                name
            })
        )

        const data = await this.validateResponse(response);
        this.data = data;
        return data;
    }
}
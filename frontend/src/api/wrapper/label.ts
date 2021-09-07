import API from "../api";
import { ILabel, ILabelProps } from "../label";
import APIObject from "./object";

export default class Label extends APIObject<ILabelProps, ILabel> {
    data: ILabel;
    constructor (api: API, data: ILabel) {
        super(api);

        this.data = data;
    }

    path() {
        return "label/" + this.data.id.toString() + "/";
    }

    get name() {
        return this.data.name;
    }

    get color() {
        return this.data.color;
    }

    async setName(name: string) {
        this.data.name = name;
        return await this.update();
    }

    async setColor(color: number) {
        this.data.color = color;
        return await this.update();
    }

    async delete() {
        await this.api.label.delete(this.data.id);
    }
}
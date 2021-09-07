import API from "../api";
import { IEvent, IEventProps } from "../events";
import APIObject from "./object";

export default class Event extends APIObject<IEventProps, IEvent> {
    data: IEvent;
    constructor (api: API, data: IEvent) {
        super(api);

        this.data = data;
    }

    path() {
        return "event/" + this.data.id.toString() + "/";
    }

    get title() {
        return this.data.title;
    }

    get content() {
        return this.data.content;
    }

    get color() {
        return this.data.color;
    }

    get startTime() {
        return this.data.start_time;
    }

    get endTime() {
        return this.data.end_time;
    }

    get allDay() {
        return this.data.all_day;
    }

    async setTitle(title: string) {
        this.data.title = title;
        return await this.update();
    }

    async setContent(content: string) {
        this.data.content = content;
        return await this.update();
    }

    async setColor(color: number) {
        this.data.color = color;
        return await this.update();
    }

    async setStartTime(startTime: number) {
        this.data.start_time = startTime;
        return await this.update();
    }

    async setEndTime(endTime: number) {
        this.data.end_time = endTime;
        return await this.update();
    }

    async setAllDay(allDay: boolean) {
        this.data.all_day = allDay;
        return await this.update();
    }

    async delete() {
        await this.api.event.delete(this.data.id);
    }
}
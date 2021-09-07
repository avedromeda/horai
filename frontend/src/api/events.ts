import API from "./api";
import APIChild from "./child"

export interface IEvent {
    id: number
    title: string,
    content: string,
    color: number,
    user_id: number,
    label: number[],

    start_time: number,
    end_time: number,
    all_day: boolean,

    created_on: number,
    updated_on: number
}

export interface IEventProps {
    title: string,
    content: string,
    color: number,
    label: number[],
    start_time: number,
    end_time: number,
    all_day: boolean
}

export default class APIEvents extends APIChild {
    constructor(api: API) {
        super(api);
    }

    async all(): Promise<IEvent[]> {
        const response = await this.createRequest(
            this.createEndpoint("events"), "GET"
        )

        return (await this.validateResponse(response)).events;
    }
    
    async create(props: IEventProps): Promise<IEvent> {
        const response = await this.createRequest(
            this.createEndpoint("events"), "POST",
            this.createForm(props)
        )

        return await this.validateResponse(response);
    }

    async get(eventId: number): Promise<IEvent> {
        const response = await this.createRequest(
            this.createEndpoint("event", eventId.toString()), "GET"
        )

        return await this.validateResponse(response);
    }

    async delete(eventId: number) {
        const response = await this.createRequest(
            this.createEndpoint("event", eventId.toString()), "DELETE"
        )

        await this.validateResponse(response);
    }
}
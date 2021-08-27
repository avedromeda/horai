import API from "../api";
import APIChild from "../child";

export interface ISubject {
    id: number
    name: string,
    user_id: number,
    notes: any[]
}

export default class Subject extends APIChild {
    data: ISubject;
    constructor (api: API, data: ISubject) {
        super(api);

        this.data = data;
    }

    async setName(name: string) {
        const response = await this.createRequest(
            this.createEndpoint("subject", this.data.id.toString()), "PUT",
            this.createForm({
                name
            })
        )

        const data = await this.validateResponse(response);
        this.data = data;
        return data;
    }
}
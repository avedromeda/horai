import API  from "./api"

export default class APIChild {
    api: API
    constructor(api: API) {
        this.api = api
    }

    async createRequest(route: string, method: string, body?: BodyInit) {
        return await this.api.createRequest(route, method, body)
    }

    createEndpoint(...parts: string[]) {
        return this.api.createEndpoint(...parts)
    }

    createForm(data: any) {
        return this.api.createForm(data)
    }

    async validateResponse(response: Response) {
        return await this.api.validateResponse(response)
    }
}
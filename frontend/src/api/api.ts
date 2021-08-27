import APIAuth from "./auth";
import APIError from "./error";


const API_ENDPOINT = "http://localhost:80/"


export default class API {
    jwt: string;
    auth: APIAuth;
    constructor() {
        this.jwt = null;

        this.auth = new APIAuth(this);
    }

    async createRequest(route: string, method: string, body?: BodyInit) {
        return await fetch(route, {
            method,
            body,
            headers: {
                ["X-Authenticate"]: this.jwt
            }
        })
    }

    createEndpoint(...parts: string[]) {
        return API_ENDPOINT + parts.join("/")
    }

    createForm(data: any) {
        const formData = new FormData();

        for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
                const element = data[key];
                if (Array.isArray(element)) {
                    // Support arrays
                    element.forEach(item => {
                        formData.append(key, item)
                    });
                } else {
                    formData.append(key, element)
                }
            }
        }

        return formData;
    }

    async validateResponse(response: Response) {
        const data = await response.json();
        if (response.status < 400) {
            return data;
        } else {
            throw new APIError(data, response.status)
        }
    }
}

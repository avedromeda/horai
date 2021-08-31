import APIAuth from "./auth";
import APIError from "./error";
import APILabel from "./label";
import APINote from "./note";
import APISubject from "./subject";


const API_ENDPOINT = "http://localhost:80/api/"


export default class API {
    jwt: string;
    auth: APIAuth;
    subject: APISubject;
    note: APINote;
    label: APILabel;
    constructor() {
        this.jwt = null;

        this.auth = new APIAuth(this);
        this.subject = new APISubject(this);
        this.note = new APINote(this);
        this.label = new APILabel(this);
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
        const endpoint = API_ENDPOINT + parts.join("/");
        return endpoint + (endpoint.endsWith("/") ? "" : "/")
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
        if (response.status === 204) {
            return {}
        } else {
            const data = await response.json();
            if (response.status < 400) {
                return data;
            } else {
                throw new APIError(data, response.status)
            }
        }
    }
}

import API from "./api";
import APIChild from "./child"


export interface IUser {
    id: number,
    name: string,
    verified_email: boolean,
    premium_features: boolean,
    admin_features: boolean
}

export default class APIAuth extends APIChild {
    dataMe: IUser;
    constructor (api: API) {
        super(api);

        this.dataMe = null;
    }

    get isLoggedIn() {
        return this.dataMe !== null;
    }

    async me(): Promise<IUser> {
        const response = await this.createRequest(
            this.createEndpoint("user", "me"), "GET"
        )

        const data = await this.validateResponse(response);
        this.dataMe = data;

        return data;
    }

    async login(email: string, password: string): Promise<IUser> {
        const response = await this.createRequest(
            this.createEndpoint("user", "login"), "POST",
            this.createForm({
                email,
                password
            })
        )

        const data = await this.validateResponse(response);
        return data;
    }

    async create(name: string, email: string, password: string, confirmPassword: string) {
        const response = await this.createRequest(
            this.createEndpoint("user", "create"), "POST",
            this.createForm({
                name,
                email,
                password,
                confirm_password: confirmPassword
            })
        )

        const data = await this.validateResponse(response);
        return data;
    }
}
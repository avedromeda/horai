import API from "../api";
import { IUser } from "../auth";
import APIObject from "./object";

// No props yet
export default class User extends APIObject<IUser, null> {
    data: IUser;
    constructor (api: API, data: IUser) {
        super(api);

        this.data = data;
    }

    get name() {
        return this.data.name;
    }

    get verified_email() {
        return this.data.verified_email;
    }

    get premium_features() {
        return this.data.premium_features;
    }

    get admin_features() {
        return this.data.admin_features;
    }
}
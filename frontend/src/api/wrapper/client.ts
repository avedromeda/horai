import API from "../api";
import { ILabelProps } from "../label";
import { ISubjectProps } from "../subject";
import Label from "./label";
import Subject from "./subject";
import User from "./user";

export default class Client {
    api: API;
    constructor () {
        this.api = new API();
    }

    isLoggedIn() {
        return this.api.auth.isLoggedIn;
    }

    async login(email: string, password: string) {
        await this.api.auth.login(email, password);

        const data = await this.api.auth.me();
        return new User(this.api, data);
    }

    async logout() {
        await this.api.auth.logout();
    }

    async sendVerificationEmail() {
        await this.api.auth.sendVerificationEmail();
    }

    async register(name: string, email: string, password: string, confirmPassword: string) {
        await this.api.auth.create(name, email, password, confirmPassword);

        const data = await this.api.auth.me();
        return new User(this.api, data);
    }

    async createSubject(subject: ISubjectProps): Promise<Subject> {
        const data = await this.api.subject.create(subject);
        return new Subject(this.api, data);
    }

    async getSubject(subjectId: number): Promise<Subject> {
        const data = await this.api.subject.get(subjectId);
        return new Subject(this.api, data);
    }

    async getSubjects(): Promise<Subject[]> {
        const data = await this.api.subject.all();

        // Sort by ID
        data.sort((a, b) => a.id - b.id);
        return data.map(isubject => new Subject(this.api, isubject));
    }

    async createLabel(label: ILabelProps): Promise<Label> {
        const data = await this.api.label.create(label);
        return new Label(this.api, data);
    }

    async getLabel(labelId: number): Promise<Label> {
        const data = await this.api.label.get(labelId);
        return new Label(this.api, data);
    }
}
import {Franchise} from "./franchise.ts";
import {Organization} from "./organization.ts";

export interface OrganizationalUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    franchise: Franchise;
    organization: Organization;
    avatarURL?: string;
    phone?: string;

    [key: string]: any;
}

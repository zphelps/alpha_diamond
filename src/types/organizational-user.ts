export interface OrganizationalUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    franchiseID: string;
    organizationID: string;
    avatarURL?: string;
    phone?: string;

    [key: string]: any;
}

import type {FC} from "react";
import type {Theme} from "@mui/material";
import {Button, Card, CardActions, CardHeader, Divider, useMediaQuery} from "@mui/material";
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";
import {ClientContact} from "../../types/client-contact.ts";
import numeral from "numeral";

interface ClientAccountContactProps {
    account_contact: ClientContact;
}

export const ClientAccountContact: FC<ClientAccountContactProps> = (props) => {
    const { account_contact} = props;
    const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

    const align = "vertical";

    return (
        <Card {...props} sx={{pb: 2}}>
            <CardHeader title="Account Contact"/>
            <PropertyList>
                <PropertyListItem
                    align={align}
                    divider
                    label="Name"
                    value={`${account_contact.first_name} ${account_contact.last_name}`}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Email"
                    value={`${account_contact.email}`}
                />
                <PropertyListItem
                    align={align}
                    label="Phone"
                    value={`${account_contact.phone}`}
                />
            </PropertyList>
        </Card>
    );
};

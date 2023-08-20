import type {FC} from "react";
import type {Theme} from "@mui/material";
import {Button, Card, CardActions, CardHeader, Divider, useMediaQuery} from "@mui/material";
import {PropertyList} from "../../components/property-list.tsx";
import {PropertyListItem} from "../../components/property-list-item.tsx";

interface ClientBillingContactProps {
    billing_contact: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: number;
    };
}

export const ClientBillingContact: FC<ClientBillingContactProps> = (props) => {
    const { billing_contact} = props;
    const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

    const align = mdUp ? "horizontal" : "vertical";

    return (
        <Card {...props} sx={{pb: 2}}>
            <CardHeader title="Billing Contact"/>
            <PropertyList>
                <PropertyListItem
                    align={align}
                    divider
                    label="Name"
                    value={`${billing_contact.first_name} ${billing_contact.last_name}`}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Email"
                    value={`${billing_contact.email}`}
                />
                <PropertyListItem
                    align={align}
                    label="Phone"
                    value={`${billing_contact.phone}`}
                />
            </PropertyList>
        </Card>
    );
};

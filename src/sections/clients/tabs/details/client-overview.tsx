import type {FC} from "react";
import PropTypes from "prop-types";
import {Button, Card, CardActions, CardHeader, Typography} from "@mui/material";
import {PropertyList} from "../../../../components/property-list.tsx";
import {PropertyListItem} from "../../../../components/property-list-item.tsx";
import {SeverityPill} from "../../../../components/severity-pill.tsx";
import {Client} from "../../../../types/client.ts";
import numeral from "numeral";

interface ClientBasicDetailsProps {
    client: Client;
}

export const ClientOverview: FC<ClientBasicDetailsProps> = (props) => {
    const {client} = props;

    return (
        <Card sx={{pb: 3}}>
            <CardHeader title="Overview"/>
            <PropertyList>
                <PropertyListItem
                    divider
                    align={"horizontal"}
                    label="Name"
                    value={client.name}
                />
                <PropertyListItem
                    divider
                    align={"horizontal"}
                    label="Type"
                    value={client.type}
                />
                <PropertyListItem
                    divider
                    align={"horizontal"}
                    label="Account Contact"
                >
                    <Typography variant={"body2"} lineHeight={1.8}
                                color={"text.secondary"}>{`${client.account_contact.first_name} ${client.account_contact.last_name}`}</Typography>
                    <Typography variant={"body2"} lineHeight={1.8} color={"text.secondary"}>{client.account_contact.email}</Typography>
                    <Typography variant={"body2"} lineHeight={1.8} color={"text.secondary"}>{client.account_contact.phone}</Typography>
                </PropertyListItem>
                <PropertyListItem
                    align={"horizontal"}
                    label="Total Revenue"
                    value={`$${numeral(client.locations?.reduce((acc, location) => {
                        return acc + location.total_revenue;
                    }, 0).toString()).format("0,0.00")}`}
                />
            </PropertyList>
        </Card>
    );
};

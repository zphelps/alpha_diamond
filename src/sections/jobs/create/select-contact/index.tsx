import {ChangeEvent, FC, useCallback, useEffect, useMemo, useState} from "react";
import {Button, Card, CardContent, Grid, Stack, Typography} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {useSelection} from "../../../../hooks/use-selection.tsx";
import {useMounted} from "../../../../hooks/use-mounted.ts";
import {Status} from "../../../../utils/status.ts";
import {Client} from "../../../../types/client.ts";
import {clientLocationsApi} from "../../../../api/client-locations";
import {setClientLocationsStatus, upsertManyClientLocations} from "../../../../slices/client-locations";
import {ClientLocation} from "../../../../types/client-location.ts";
import {ClientContact} from "../../../../types/client-contact.ts";
import {clientContactsApi} from "../../../../api/client-contacts";
import {setClientUsersStatus, upsertManyClientUsers} from "../../../../slices/client-users";
import {SelectContactListTable} from "./select-contact-list-table.tsx";

// ----------------------------------------------------------------------
interface ClientContactsSearchState {
    client_id: string;
    page: number;
    rowsPerPage: number;
}

const useClientContactsSearch = (client_id: string) => {
    const [state, setState] = useState<ClientContactsSearchState>({
        client_id: client_id,
        page: 0,
        rowsPerPage: 5,
    });

    const handlePageChange = useCallback(
        // @ts-ignore
        (event: (MouseEvent<HTMLButtonElement, MouseEvent> | null), page: number): void => {
            setState((prevState) => ({
                ...prevState,
                page
            }));
        },
        []
    );

    const handleRowsPerPageChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            setState((prevState) => ({
                ...prevState,
                rowsPerPage: parseInt(event.target.value, 10)
            }));
        },
        []
    );

    return {
        handlePageChange,
        handleRowsPerPageChange,
        state
    };
};

const useContactsStore = (searchState: ClientContactsSearchState) => {
    const isMounted = useMounted();
    const dispatch = useDispatch();

    const handleContactsGet = useCallback(
        async () => {
            try {
                const response = await clientContactsApi.getClientContacts(searchState);

                if (isMounted()) {
                    dispatch(upsertManyClientUsers(response.data));
                    dispatch(setClientUsersStatus(Status.SUCCESS));
                }
            } catch (err) {
                console.error(err);
                dispatch(setClientUsersStatus(Status.ERROR));
            }
        },
        [searchState, isMounted]
    );

    useEffect(
        () => {
            handleContactsGet();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [searchState]
    );
};

const useContactIds = (contacts: ClientContact[] = []) => {
    return useMemo(
        () => {
            return Object.keys(contacts);
        },
        [contacts]
    );
};

const useFilteredContacts = (contacts: ClientContact[] = []) => {
    return useMemo(
        () => {
            return Object.values(contacts);
        },
        [contacts]
    );
};
interface SelectContactProps {
    client_id: string;
    setFieldValue: (field: string, value: string) => void;
}
export const SelectContact: FC<SelectContactProps> = (props) => {
    const {client_id, setFieldValue} = props;

    const clientLocationsSearch = useClientContactsSearch(client_id);
    useContactsStore(clientLocationsSearch.state);

    // @ts-ignore
    const clientUsersStore = useSelector((state) => state.clientUsers);

    const clientUsersIds = useContactIds(clientUsersStore.users);
    const clientUsersSelection = useSelection<string>(clientUsersIds);

    const filteredContacts = useFilteredContacts(clientUsersStore.users[client_id]);

    useEffect(() => {
        if (clientUsersSelection.selected.length === 1) {
            setFieldValue('on_site_contact_id', clientUsersSelection.selected[0]);
            setFieldValue('on_site_contact', clientUsersStore.users[client_id][clientUsersSelection.selected[0]]);
        } else {
            setFieldValue('on_site_contact_id', null);
            setFieldValue('on_site_contact', null);
        }
    }, [clientUsersSelection.selected, setFieldValue])

    return (
        <Stack>
            <Typography
                variant={'h6'}
                sx={{mb: 2}}
            >
                Select On-Site Contact
            </Typography>
            <SelectContactListTable
                count={filteredContacts.length}
                items={filteredContacts}
                onDeselectAll={clientUsersSelection.handleDeselectAll}
                onDeselectOne={clientUsersSelection.handleDeselectOne}
                onPageChange={clientLocationsSearch.handlePageChange}
                onRowsPerPageChange={clientLocationsSearch.handleRowsPerPageChange}
                onSelectAll={clientUsersSelection.handleSelectAll}
                onSelectOne={clientUsersSelection.handleSelectOne}
                page={clientLocationsSearch.state.page}
                rowsPerPage={clientLocationsSearch.state.rowsPerPage}
                selected={clientUsersSelection.selected}
            />
        </Stack>
    );
}

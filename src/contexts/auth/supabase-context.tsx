import type {FC, ReactNode} from "react";
import {createContext, useCallback, useEffect, useReducer} from "react";
import PropTypes from "prop-types";
import {db, supabase} from "../../config.ts";
import {OrganizationalUser} from "../../types/organizational-user.ts";
import {AuthChangeEvent, Session} from "@supabase/supabase-js";
import {Franchise} from "../../types/franchise.ts";

const auth = supabase.auth;

interface State {
    isInitialized: boolean;
    isAuthenticated: boolean;
    user: OrganizationalUser | null;
}

enum ActionType {
    AUTH_STATE_CHANGED = "AUTH_STATE_CHANGED"
}

type AuthStateChangedAction = {
    type: ActionType.AUTH_STATE_CHANGED;
    payload: {
        isAuthenticated: boolean;
        user: OrganizationalUser | null;
    };
};

type Action = AuthStateChangedAction;

const initialState: State = {
    isAuthenticated: false,
    isInitialized: false,
    user: null
};

const reducer = (state: State, action: Action): State => {
    if (action.type === "AUTH_STATE_CHANGED") {
        const {isAuthenticated, user} = action.payload;

        return {
            ...state,
            isAuthenticated,
            isInitialized: true,
            user
        };
    }

    return state;
};

export interface AuthContextType extends State {
    issuer: "Supabase";
    createUserWithEmailAndPassword: (email: string, password: string) => Promise<any>;
    signInWithEmailAndPassword: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    ...initialState,
    issuer: "Supabase",
    createUserWithEmailAndPassword: () => Promise.resolve(),
    signInWithEmailAndPassword: () => Promise.resolve(),
    signOut: () => Promise.resolve()
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = (props) => {
    const {children} = props;
    const [state, dispatch] = useReducer(reducer, initialState);

    const handleAuthStateChanged = useCallback(
        // @ts-ignore
        async (event: AuthChangeEvent, session: Session | null) => {
            if (session?.user) {
                console.log("SIGNED_IN", session);

                const user = await db.from("organizational_users").select(
                    "id, email, first_name, last_name, phone_number, avatar_url, franchise:franchise_id(*, primary_contact:primary_contact_id(*)), organization:organization_id(*)"
                ).eq("id", session.user.id).single();

                dispatch({
                    type: ActionType.AUTH_STATE_CHANGED,
                    payload: {
                        isAuthenticated: true,
                        user: {
                            id: session.user.id,
                            email: user?.data?.email,
                            firstName: user?.data?.first_name,
                            lastName: user?.data?.last_name,
                            // @ts-ignore
                            franchise: user?.data?.franchise,
                            // @ts-ignore
                            organization: user?.data?.organization,
                            avatarURL: user?.data?.avatar_url,
                            phone: user?.data?.phone_number,
                        }
                    }
                });
            } else {
                dispatch({
                    type: ActionType.AUTH_STATE_CHANGED,
                    payload: {
                        isAuthenticated: false,
                        user: null
                    }
                });
            }
        },
        [dispatch]
    );

    useEffect(
        () => {
            auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
                return handleAuthStateChanged(event, session);
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const _signInWithEmailAndPassword = useCallback(
        async (email: string, password: string): Promise<void> => {
            await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
        },
        []
    );

    const _createUserWithEmailAndPassword = useCallback(
        async (email: string,
               password: string): Promise<void> => {
            await supabase.auth.signUp({
                email: email,
                password: password
            });
        },
        []
    );

    const _signOut = useCallback(
        async (): Promise<void> => {
            await auth.signOut();
        },
        []
    );

    return (
        <AuthContext.Provider
            value={{
                ...state,
                issuer: "Supabase",
                createUserWithEmailAndPassword: _createUserWithEmailAndPassword,
                signInWithEmailAndPassword: _signInWithEmailAndPassword,
                signOut: _signOut
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export const AuthConsumer = AuthContext.Consumer;

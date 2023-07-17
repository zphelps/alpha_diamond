import { useContext } from 'react';
import {AuthContext} from "../contexts/auth/supabase-context.tsx";
export const useAuth = () => useContext(AuthContext);

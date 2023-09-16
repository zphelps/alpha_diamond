import {Hauler} from "./hauler.ts";

export interface BinType {
    id: string;
    name: string;
    description: string;
    client_location_id: string;
    size: BinSize;
    on_demand_charge: number;
    hauler: Hauler;
}

export enum BinSize {
    TWENTY_YARD = '20 yard',
    THIRTY_YARD = '30 yard',
    FORTY_YARD = '40 yard',
    FIFTY_YARD = '50 yard',
    SIXTY_YARD = '60 yard',
    OTHER = 'other',
}

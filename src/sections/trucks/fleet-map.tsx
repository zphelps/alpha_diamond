import type {FC} from "react";
import {useCallback, useEffect, useRef, useState} from "react";
import type {MapRef, ViewState} from "react-map-gl";
import Map, {Marker} from "react-map-gl";
import type {FlyToOptions} from "mapbox-gl";
import PropTypes from "prop-types";
import {Box, Typography} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import {Truck} from "../../types/truck.ts";
import {mapboxConfig} from "../../config.ts";
import {Truck02} from "@untitled-ui/icons-react";

// Map default view state
const VIEW_STATE: Pick<ViewState, "latitude" | "longitude" | "zoom"> = {
    latitude: 39.98331,
    longitude: -86.26225,
    zoom: 11
};

interface FleetMapProps {
    currentVehicleId?: string;
    onVehicleSelect?: (vehicleId: string) => void;
    trucks?: Truck[];
}

export const FleetMap: FC<FleetMapProps> = (props) => {
    const {onVehicleSelect, currentVehicleId, trucks = []} = props;
    const theme = useTheme();
    const mapRef = useRef<MapRef | null>(null);
    const [viewState] = useState(() => {
        if (!currentVehicleId) {
            return VIEW_STATE;
        } else {
            const vehicle = trucks.find((vehicle) => vehicle.id === currentVehicleId);

            if (!vehicle) {
                return VIEW_STATE;
            } else {
                return {
                    latitude: vehicle.latitude,
                    longitude: vehicle.longitude,
                    zoom: 13
                };
            }
        }
    });

    const handleRecenter = useCallback(
        () => {
            const map = mapRef.current;

            if (!map) {
                return;
            }

            let flyOptions: FlyToOptions;

            const vehicle = trucks.find((vehicle) => vehicle.id === currentVehicleId);


            if (!vehicle) {
                flyOptions = {
                    center: [VIEW_STATE.longitude, VIEW_STATE.latitude]
                };
            } else {
                flyOptions = {
                    center: [vehicle.longitude, vehicle.latitude]
                };
            }
            map.flyTo(flyOptions);
        },
        [trucks, currentVehicleId]
    );

    // Recenter if vehicles or current vehicle change
    useEffect(
        () => {
            handleRecenter();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [trucks, currentVehicleId]
    );

    const mapStyle = theme.palette.mode === "dark"
        ? "mapbox://styles/mapbox/dark-v9"
        : "mapbox://styles/mapbox/light-v9";

    if (!mapboxConfig.apiKey) {
        return (
            <Box
                sx={{
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "center"
                }}
            >
                <Box sx={{mb: 3}}>
                    <Box
                        component="img"
                        src="/assets/errors/error-404.png"
                        sx={{
                            width: 200,
                            maxWidth: "100%"
                        }}
                    />
                </Box>
                <Typography
                    variant="h5"
                    sx={{mb: 1}}
                >
                    Map cannot be loaded
                </Typography>
                <Typography
                    color="text.secondary"
                    variant="subtitle2"
                >
                    Mapbox API Key is not configured.
                </Typography>
            </Box>
        );
    }

    return (
        <Map
            attributionControl={false}
            initialViewState={viewState}
            mapStyle={mapStyle}
            mapboxAccessToken={mapboxConfig.apiKey}
            ref={mapRef}
            maxZoom={20}
            minZoom={11}
        >
            {trucks.map((vehicle) => (
                <Marker
                    key={vehicle.id}
                    latitude={vehicle.latitude}
                    longitude={vehicle.longitude}
                    onClick={() => onVehicleSelect?.(vehicle.id)}
                >
                    <Box
                        sx={{
                            height: 50,
                            width: 50,
                            ...(vehicle.id === currentVehicleId && {
                                filter: (theme) => `drop-shadow(0px 0px 8px ${theme.palette.primary.main})`
                            }),
                            "& img": {
                                height: "100%"
                            }
                        }}
                    >
                        <img src="src/assets/truck-pin.png"/>
                    </Box>
                </Marker>
            ))}
        </Map>
    );
};

FleetMap.propTypes = {
    currentVehicleId: PropTypes.string,
    onVehicleSelect: PropTypes.func,
    trucks: PropTypes.array
};

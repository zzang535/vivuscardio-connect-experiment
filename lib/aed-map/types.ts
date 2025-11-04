export type Position = {
    lat: number;
    lng: number;
};

export type Playspot = {
    key: string;
    name: string;
    lat: number;
    lng: number;
    radius: number;
    markerColor: string;
    circleColor: string;
    musicUrl?: string;
};

export type Spot = {
    lat: number;
    lng: number;
    mapScale?: number;
    playspots: Playspot[];
};

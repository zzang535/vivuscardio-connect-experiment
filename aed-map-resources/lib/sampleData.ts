import { Spot, Playspot } from './types';

// Sample playspots data
export const samplePlayspot: Playspot = {
    key: 'sample-playspot-1',
    name: 'Sample Location 1',
    lat: 37.5665,
    lng: 126.9780,
    radius: 100,
    markerColor: '#FF5733',
    circleColor: '#FF5733',
    musicUrl: '',
};

// Sample spot data (Seoul, South Korea)
export const sampleSpot: Spot = {
    lat: 37.5665,
    lng: 126.9780,
    mapScale: 15,
    playspots: [
        {
            key: 'playspot-1',
            name: 'Gwanghwamun Square',
            lat: 37.5720,
            lng: 126.9769,
            radius: 100,
            markerColor: '#4285F4',
            circleColor: '#4285F4',
        },
        {
            key: 'playspot-2',
            name: 'Gyeongbokgung Palace',
            lat: 37.5796,
            lng: 126.9770,
            radius: 150,
            markerColor: '#34A853',
            circleColor: '#34A853',
        },
        {
            key: 'playspot-3',
            name: 'Insadong Street',
            lat: 37.5718,
            lng: 126.9857,
            radius: 120,
            markerColor: '#FBBC04',
            circleColor: '#FBBC04',
        },
    ],
};

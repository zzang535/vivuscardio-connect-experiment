'use client';

import React, {
    useEffect,
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
} from 'react';
import { createCurrentLocationDiv, calculateDistance } from '@/lib/methods';
import { darkenColor } from '@/lib/tinycolor';
import { Playspot, Spot, Position } from '@/lib/types';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || '';

let map: google.maps.Map;

type GoogleMapProps = {
    spot: Spot;
    currentPlayspot: Playspot;
    setDistances: React.Dispatch<React.SetStateAction<number[]>>;
    setCurrentPlayspot: React.Dispatch<React.SetStateAction<Playspot>>;
    askForMusicPlay: () => void;
};

const GoogleMap = forwardRef(
    (
        {
            spot,
            currentPlayspot,
            setDistances,
            setCurrentPlayspot,
            askForMusicPlay,
        }: GoogleMapProps,
        ref,
    ) => {
        const [currentPosition, setCurrentPosition] = useState<Position | null>(
            null,
        );
        const markerRef =
            useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

        // 컴포넌트가 랜더링 될 때 Google Maps script 를 추가한다.
        // 그리고 initMap 을 실행한다.
        useEffect(() => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=marker`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                // 지도 시작
                initMap();
            };
            script.onerror = () => {
                console.error('Failed to load the Google Maps script.');
            };
            document.head.appendChild(script);

            return () => {
                document.head.removeChild(script);
            };
        }, []);

        // 유저의 현재 위치를 가져온 뒤 currentPosition state 를 set 한다.
        useEffect(() => {
            let watchId: number;

            if (navigator.geolocation) {
                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        setCurrentPosition({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    },
                    (error) => {
                        console.error('Error fetching location:', error);
                    },
                    {
                        enableHighAccuracy: true,
                        maximumAge: 0,
                        timeout: 3000,
                    },
                );
            } else {
                console.error('Geolocation is not supported by this browser.');
            }

            return () => {
                if (navigator.geolocation && watchId) {
                    navigator.geolocation.clearWatch(watchId);
                }
            };
        }, []);

        // 유저의 현재 위치가 변할 때 마다 실행
        // 1 - 현재 위치 마커 변경
        // 2 - spot 들과의 거리 체크 및 음악 시작 로직 실행
        useEffect(() => {
            if (currentPosition && typeof google !== 'undefined') {
                // detach current marker from map
                if (markerRef.current) {
                    markerRef.current.map = null;
                }

                const newMarker = new google.maps.marker.AdvancedMarkerElement({
                    map: map,
                    position: {
                        lat: currentPosition.lat,
                        lng: currentPosition.lng,
                    },
                    content: createCurrentLocationDiv(),
                });

                // store the marker reference
                markerRef.current = newMarker;

                let distances: number[] = [];

                spot.playspots.map((playspot) => {
                    const distance = calculateDistance(
                        currentPosition.lat,
                        currentPosition.lng,
                        playspot.lat,
                        playspot.lng,
                    );

                    distances.push(distance);

                    // 반경보다 거리가 작은 경우
                    if (distance > 0 && distance <= playspot.radius) {
                        // 현재 저장된 playspot 과 다른 playspot 에 진입한 경우
                        if (currentPlayspot.key !== playspot.key) {
                            setCurrentPlayspot({ ...playspot });

                            if (typeof window !== 'undefined') {
                                localStorage.setItem(
                                    'currentPlayspot',
                                    JSON.stringify(playspot),
                                );
                            }

                            askForMusicPlay();
                        }
                    }
                });

                setDistances(distances);
            }
        }, [currentPosition]);

        // 부모 컴포넌트에서 사용할 수 있도록 설정
        useImperativeHandle(ref, () => ({
            // 지도의 중심을 현재 위치로 설정
            setMapCenter: () => {
                if (currentPosition) {
                    map.setCenter(currentPosition);
                }
            },
        }));

        // 지도 전체 초기화
        async function initMap() {
            if (typeof google !== 'undefined') {
                const mapElement = document.getElementById('map');

                if (mapElement) {
                    map = new google.maps.Map(mapElement, {
                        zoom: spot.mapScale || 10,
                        center: {
                            lat: spot.lat,
                            lng: spot.lng,
                        },
                        mapId: 'map',
                        gestureHandling: 'greedy',
                        disableDefaultUI: true,
                    });
                }

                spot.playspots.map((playspot) => {
                    // 마커 생성
                    const pinBackground = new google.maps.marker.PinElement({
                        borderColor: darkenColor({
                            color: playspot.markerColor,
                            percent: 20,
                        }),
                        glyphColor: darkenColor({
                            color: playspot.markerColor,
                            percent: 20,
                        }),
                        background: playspot.markerColor,
                    });

                    new google.maps.marker.AdvancedMarkerElement({
                        map: map,
                        position: {
                            lat: playspot.lat,
                            lng: playspot.lng,
                        },
                        title: playspot.name,
                        content: pinBackground.element,
                    });

                    // 원 객체 생성
                    new google.maps.Circle({
                        strokeColor: playspot.circleColor,
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: playspot.circleColor,
                        fillOpacity: 0.35,
                        map,
                        center: { lat: playspot.lat, lng: playspot.lng },
                        radius: playspot.radius,
                    });
                });
            } else {
                console.error('Google Maps API is not loaded.');
            }
        }

        return (
            <div
                id="map"
                style={{
                    width: '100%',
                    height: '100%',
                }}
            ></div>
        );
    },
);

GoogleMap.displayName = 'GoogleMap';

export default GoogleMap;

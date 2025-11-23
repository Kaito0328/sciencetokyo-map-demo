"use client";
import React, { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import * as L from 'leaflet';

export type MapState = {
  ready: boolean;
  zoom: number;
  minZoom: number;
  center: L.LatLng;
  bounds: L.LatLngBounds;
};

const defaultBounds = () => L.latLngBounds([[0, 0], [0, 0]]);
const defaultCenter = () => L.latLng(0, 0);

const MapStateContext = React.createContext<MapState>({
  ready: false,
  zoom: 0,
  minZoom: 0,
  center: defaultCenter(),
  bounds: defaultBounds(),
});

export const useMapState = () => React.useContext(MapStateContext);

export const ReadyKey = 'initialboundsready'; 

export const MapStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const map = useMap();
  const [state, setState] = React.useState<MapState>({
    ready: false,
    zoom: 0,
    minZoom: 0,
    center: defaultCenter(),
    bounds: defaultBounds(),
  });

useEffect(() => {
    if (!map) return;
    let mounted = true;

    map.whenReady(() => {
      if (!mounted) return;
      setState({
        ready: true,
        zoom: map.getZoom(),
        minZoom: map.getMinZoom?.() ?? map.getZoom(),
        center: map.getCenter(),
        bounds: map.getBounds(),
      });
    });

    return () => { mounted = false; };
  }, [map]);

  useMapEvents({
    zoomend() {
      setState((prev) => ({
        ...prev,
        zoom: map.getZoom(),
        minZoom: map.getMinZoom?.() ?? map.getZoom(),
        center: map.getCenter(),
        bounds: map.getBounds(),
      }));
    },
    moveend() {
      setState((prev) => ({
        ...prev,
        center: map.getCenter(),
        bounds: map.getBounds(),
      }));
    },
  });

  return (
    <MapStateContext.Provider value={state}>{children}</MapStateContext.Provider>
  );
};

export default MapStateProvider;

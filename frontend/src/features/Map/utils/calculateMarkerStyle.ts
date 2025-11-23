import { InterestScoreParameters, RadiusParameters } from "../config/parameters";
import { MapState } from "../MapStateProvider";
import { clamp01} from "./CoordinateUtils";

export type MarkerStyleInput = {
  position: L.LatLng;
  mapState: MapState;
  filter: number;
  isSearched?: boolean;
  searchWeight?: number;
  interest_params: InterestScoreParameters;
  radius_params: RadiusParameters;
  opacity_threshold: number;
};

export type MarkerStyle = {
    radius: number;
    opacity: number;
    interestScore: number;
}

export function calculateInterestScore(distance: number, zoom: number, filter: number, is_searched: boolean, params: InterestScoreParameters, searchWeight?: number): number {
    const { offset, distance_factor, zoom_factor, zoom_min, zoom_max, filter_factor, search_factor } = params;

    const zoom_normalized = clamp01((zoom - zoom_min) / (zoom_max - zoom_min));
  const search = Math.max(is_searched ? 1 : 0, clamp01(searchWeight ?? 0));

    const interestScore = distance_factor * distance + zoom_factor * zoom_normalized + filter_factor * filter + offset + search_factor * search;
    return clamp01(interestScore);
}


export function calculateMarkerStyle({ position, filter, isSearched, searchWeight, mapState, interest_params, radius_params, opacity_threshold }: MarkerStyleInput): MarkerStyle | null {
  const { ready, zoom, center, bounds } = mapState;
  if (!ready) return null;

  const viewW = (bounds.getEast() as number) - (bounds.getWest() as number);
  const viewH = (bounds.getSouth() as number) - (bounds.getNorth() as number);
  const normR = 0.5 * Math.sqrt(viewW * viewW + viewH * viewH);
  const distance = Math.sqrt(Math.pow(position.lng - center.lng, 2) + Math.pow(position.lat - center.lat, 2));
  const distance_normalized = clamp01(distance / normR);

  if (distance_normalized >= 1) return null;

  const interestScore = calculateInterestScore(distance_normalized, zoom, filter, isSearched ?? false, interest_params, searchWeight);

  if (interestScore <= 0) return null;

  const opacity = opacity_threshold + (1 - opacity_threshold) * interestScore;


  const {  min_radius, max_radius } = radius_params;

  const radius = min_radius + (max_radius - min_radius) * interestScore;

  return {
    radius,
    opacity,
    interestScore,
  };
}

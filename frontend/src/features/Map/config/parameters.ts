
export type InterestScoreParameters = {
    offset: number;
    distance_factor: number;
    zoom_factor: number;
    zoom_min: number;
    zoom_max: number;
    filter_factor: number;
    search_factor: number;
};

export type RadiusParameters = {
    min_radius: number;
    max_radius: number;
};
export const DEFAULT_OPACITY_THRESHOLD = 0.4;

export const LABEL_PERMANENT_THRESHOLD = 0.5;

export const BUILDING_INTEREST_SCORE_PARAMS: InterestScoreParameters = {
    offset: -0.4,
    distance_factor: -0.3,
    zoom_factor: 1.8,
    zoom_min: -1.0,
    zoom_max: 1.0,
    filter_factor: 0.4,
    search_factor: 1.0
};

export const BUILDING_INTEREST_SCORE_PARAMS_MOBILE: InterestScoreParameters = {
    offset: -0.4,
    distance_factor: -0.3,
    zoom_factor: 1.8,
    zoom_min: -1.0,
    zoom_max: 1.0,
    filter_factor: 0.4,
    search_factor: 1.0
};

export const BUILDING_INTEREST_SCORE_PARAMS_DESKTOP: InterestScoreParameters = {
    offset: -0.2,
    distance_factor: -0.4,
    zoom_factor: 1.8,
    zoom_min: -0.5,
    zoom_max: 2.0,
    filter_factor: 0.4,
    search_factor: 1.0
};

export const BUILDING_RADIUS_PARAMS_MOBILE: RadiusParameters = {
    min_radius: 4,
    max_radius: 8
};

export const BUILDING_RADIUS_PARAMS_DESKTOP: RadiusParameters = {
    min_radius: 6,
    max_radius: 12
};


export const AREA_INTEREST_SCORE_PARAMS: InterestScoreParameters = {
    offset: 1.0,
    distance_factor: 0,
    zoom_factor: -1.1,
    zoom_min: -1,
    zoom_max: -0.2,
    filter_factor: 0,
    search_factor: 0
};


export const AREA_RADIUS_PARAMS_MOBILE: RadiusParameters = {
    min_radius: 8,
    max_radius: 13
};

export const AREA_RADIUS_PARAMS_DESKTOP: RadiusParameters = {
    min_radius: 12,
    max_radius: 20
};

export const LECTURE_SMOOTH_DEGREE = 0.3;

export const SEARCH_TOP_SUGGESTIONS = 5;
export const SEARCH_RESULT_S = 1.0;
export const SEARCH_SUGGESTION_S = 0.5;

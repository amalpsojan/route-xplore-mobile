import RestClient from "@/services/axios";
import qs from "qs";

type StartEndPoints = {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
};

type ParseLinkResponse = {
  start: StartEndPoints;
  end: StartEndPoints;
};

export const parseLink = async (mapLink: string) => {
  const { data } = await RestClient.post<ParseLinkResponse>(`/parse-link`, {
    link: mapLink,
  });
  return data;
};

type RouteInput = {
  start: string;
  end: string;
  geometry?: "geojson" | "polyline" | "polyline6";
};

type RouteResponse = {
  distanceMeters: number;
  durationSeconds: number;
  provider: string;
  profile: string;
  osrmUrl: string;
  geometry: {
    coordinates: number[];
    type: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  }[];
  start: StartEndPoints;
  end: StartEndPoints;
};

export const getRoute = async ({
  geometry = "geojson",
  ...input
}: RouteInput) => {
  const { data } = await RestClient.post<RouteResponse>(`/route`, {
    ...input,
    geometry,
  });
  return data;
};

type RouteWithWaypointsInput = {
  start: string;
  end: string;
  waypoints?: string[];
  geometry?: "geojson" | "polyline" | "polyline6";
};

export const getRouteWithWaypoints = async ({
  geometry = "geojson",
  ...input
}: RouteWithWaypointsInput) => {
  const { data } = await RestClient.post<RouteResponse>(
    `/route/with-waypoints`,
    {
      ...input,
      geometry,
    }
  );
  return data;
};

type PlacesInput = {
  start: Omit<StartEndPoints, "name">;
  end: Omit<StartEndPoints, "name">;
};

type Place = {
  id: number;
  name: string;
  tourism: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  tags: {
    name: string;
    tourism: string;
    waterway: string;
    wikidata: string;
  };
};

type PlacesResponse = {
  start: {
    lat: number;
    lng: number;
  };
  end: {
    lat: number;
    lng: number;
  };
  places: Place[];
};

export const getPlaces = async ({ start, end }: PlacesInput) => {
  const url = `/places?${qs.stringify({
    start: `${start?.coordinates?.lat},${start?.coordinates?.lng}`,
    end: `${end?.coordinates?.lat},${end?.coordinates?.lng}`,
    padding: 0.1,
    format: "simple",
    types: "attraction,viewpoint,museum,gallery",
    wikidataOnly: true,
  })}`;
  const { data } = await RestClient.get<PlacesResponse>(url);
  return data;
};

type PlaceDetailsResponse = {
  wikipedia: string;
  title: string;
  extract: string;
  description: string;
  thumbnail: string;
  lang: string;
  page_url: string;
  wikidata: string;
};

export const getPlaceDetails = async (wikiId: string) => {
  const { data } = await RestClient.get<PlaceDetailsResponse>(
    `/place-details?wikidata=${wikiId}`
  );
  return data;
};

import RestClient from "@/services/axios";

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

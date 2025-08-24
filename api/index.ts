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
  waypoints: [];
  route: {
    osrmUrl: string;
    geometry: {
      coordinates: number[];
      type: string;
    };
    coordinates: {
      lat: number;
      lng: number;
    }[];
    distanceMeters: number;
    durationSeconds: number;
    provider: string;
    profile: string;
  };
};

export const parseLink = async (mapLink: string) => {
  const { data } = await RestClient.post<ParseLinkResponse>(`/parse-link`, {
    link: mapLink,
  });
  return data;
};


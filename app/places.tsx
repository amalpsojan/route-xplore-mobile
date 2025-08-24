import { getPlaceDetails, getPlaces, getRouteWithWaypoints } from "@/api/index";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Polyline } from "react-native-maps";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OpenStreetMap from "../components/OpenStreetMap";
import PlaceCard from "../components/cards/PlaceCard";
import EndMarker from "../components/marker/EndMarker";
import StartMarker from "../components/marker/StartMarker";
import WaypointMarker from "../components/marker/WaypointMarker";

type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  description: string;
  wikidata?: string;
};

export default function PlacesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slat, slng, elat, elng } = useLocalSearchParams<{
    slat?: string;
    slng?: string;
    elat?: string;
    elng?: string;
  }>();

  const mapRef = useRef<MapView | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const toggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const start = useMemo(
    () => ({
      latitude: slat ? Number(slat) : undefined,
      longitude: slng ? Number(slng) : undefined,
    }),
    [slat, slng]
  );
  const end = useMemo(
    () => ({
      latitude: elat ? Number(elat) : undefined,
      longitude: elng ? Number(elng) : undefined,
    }),
    [elat, elng]
  );

  const initialRegion = {
    latitude: (Number(slat) + Number(elat)) / 2 || 10.38,
    longitude: (Number(slng) + Number(elng)) / 2 || 76.55,
    latitudeDelta: 0.8,
    longitudeDelta: 0.8,
  };

  const { data: placesResp } = useQuery({
    queryKey: ["places", start, end],
    queryFn: () =>
      getPlaces({
        start: { coordinates: { lat: Number(slat), lng: Number(slng) } } as any,
        end: { coordinates: { lat: Number(elat), lng: Number(elng) } } as any,
      }),
    enabled:
      Number.isFinite(start.latitude) &&
      Number.isFinite(start.longitude) &&
      Number.isFinite(end.latitude) &&
      Number.isFinite(end.longitude),
  });

  const places: Place[] = useMemo(() => {
    const arr = placesResp?.places ?? [];
    return arr
      .map((p: any) => ({
        id: String(p.id),
        name: p.name || p.tags?.name || "Unnamed",
        latitude: p.coordinates?.lat,
        longitude: p.coordinates?.lng,
        imageUrl: "",
        description: p.tags?.tourism || "Attraction",
        wikidata: p.tags?.wikidata,
      }))
      .filter(
        (p: Place) =>
          Number.isFinite(p.latitude) && Number.isFinite(p.longitude)
      );
  }, [placesResp]);

  const { data: detailsMap } = useQuery({
    queryKey: [
      "place-details",
      (places || []).map((p) => p.wikidata).filter(Boolean),
    ],
    queryFn: async () => {
      const ids = (places || [])
        .map((p) => p.wikidata)
        .filter(Boolean) as string[];
      const results = await Promise.all(ids.map((id) => getPlaceDetails(id)));
      const map: Record<string, any> = {};
      ids.forEach((id, i) => {
        map[id] = results[i];
      });
      return map;
    },
    enabled: (places || []).some((p) => !!p.wikidata),
  });

  const enrichedPlaces: Place[] = useMemo(() => {
    return (places || []).map((p) => {
      const det = p.wikidata ? (detailsMap as any)?.[p.wikidata] : undefined;
      return {
        ...p,
        imageUrl:
          p.imageUrl ||
          det?.thumbnail ||
          `https://picsum.photos/seed/${p.id}/600/400`,
        description: det?.extract || p.description,
      };
    });
  }, [places, detailsMap]);

  const width = Dimensions.get("window").width;

  const waypoints = useMemo(
    () =>
      Object.keys(selected)
        .filter((id) => selected[id])
        .map((id) => {
          const p = enrichedPlaces.find((sp) => sp.id === id)!;
          return `${p.latitude},${p.longitude}`;
        }),
    [selected, enrichedPlaces]
  );

  const { data: routeData } = useQuery({
    queryKey: ["route-with-waypoints", start, end, waypoints],
    queryFn: () =>
      getRouteWithWaypoints({
        start: `${start.latitude},${start.longitude}`,
        end: `${end.latitude},${end.longitude}`,
        waypoints,
        geometry: "geojson",
      }),
    enabled:
      Number.isFinite(start.latitude) &&
      Number.isFinite(start.longitude) &&
      Number.isFinite(end.latitude) &&
      Number.isFinite(end.longitude),
  });

  const routeCoords = useMemo(() => {
    const coords: any = routeData?.geometry?.coordinates;
    if (!Array.isArray(coords))
      return [] as Array<{ latitude: number; longitude: number }>;
    return coords
      .map((pair: any) =>
        Array.isArray(pair) && pair.length >= 2
          ? { latitude: Number(pair[1]), longitude: Number(pair[0]) }
          : null
      )
      .filter(
        (p: any) =>
          p && Number.isFinite(p.latitude) && Number.isFinite(p.longitude)
      ) as Array<{ latitude: number; longitude: number }>;
  }, [routeData]);

  const onGenerate = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.mapContainer}>
        <OpenStreetMap
          style={{ flex: 1 }}
          initialRegion={initialRegion}
          mapType="none"
          ref={mapRef}
        >
          {Number.isFinite(start.latitude) &&
            Number.isFinite(start.longitude) && (
              <StartMarker
                anchor={{ x: 0.5, y: 1 }}
                coordinate={{
                  latitude: start.latitude as number,
                  longitude: start.longitude as number,
                }}
                title="Start"
              />
            )}
          {Number.isFinite(end.latitude) && Number.isFinite(end.longitude) && (
            <EndMarker
              anchor={{ x: 0.5, y: 1 }}
              coordinate={{
                latitude: end.latitude as number,
                longitude: end.longitude as number,
              }}
            />
          )}
          {enrichedPlaces.map((p, idx) => (
            <WaypointMarker
              text={`${idx + 1}`}
              coordinate={{
                latitude: p.latitude,
                longitude: p.longitude,
              }}
            />
          ))}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={4}
              strokeColor="#2e86de"
            />
          )}
        </OpenStreetMap>
      </View>

      <Carousel
        width={width * 0.9}
        height={200}
        data={enrichedPlaces}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 70,
          parallaxAdjacentItemScale: 0.85,
        }}
        renderItem={({ item }) => (
          <PlaceCard
            name={item.name}
            imageUrl={item.imageUrl}
            description={item.description}
            selected={!!selected[item.id]}
            onToggle={() => toggle(item.id)}
            onPress={() => {
              if (item.wikidata) {
                router.push({
                  pathname: "/place-details",
                  params: { wiki: item.wikidata },
                });
              }
            }}
          />
        )}
        onSnapToItem={(index) => {
          setActiveIndex(index);
          const p = enrichedPlaces[index];
          if (p && mapRef.current) {
            mapRef.current.animateCamera({
              center: { latitude: p.latitude, longitude: p.longitude },
              zoom: 12,
            });
          }
        }}
        loop={false}
        style={styles.carousel}
      />
      <TouchableOpacity style={styles.button} onPress={onGenerate}>
        <Text style={styles.buttonText}>Generate Google Maps Link</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  carousel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 16,
    // backgroundColor: "red",
  },
  button: {
    backgroundColor: "#2e86de",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12,
    marginHorizontal: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

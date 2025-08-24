import { getRouteWithWaypoints } from "@/api/index";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OpenStreetMap from "../components/OpenStreetMap";

type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  description: string;
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

  // Placeholder places. Next iteration: fetch from backend /api/places
  const samplePlaces: Place[] = useMemo(
    () => [
      {
        id: "p1",
        name: "Viewpoint A",
        latitude: 10.4,
        longitude: 76.4,
        imageUrl:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
        description: "Panoramic lookout with lush greenery and misty hills.",
      },
      {
        id: "p2",
        name: "Museum B",
        latitude: 10.35,
        longitude: 76.55,
        imageUrl:
          "https://images.unsplash.com/photo-1549893079-842e6b5d1ec9?w=800",
        description: "Local history museum showcasing regional culture.",
      },
      {
        id: "p3",
        name: "Park C",
        latitude: 10.32,
        longitude: 76.7,
        imageUrl:
          "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800",
        description: "Shady riverside park perfect for picnics and walks.",
      },
    ],
    []
  );

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

  const waypoints = useMemo(
    () =>
      Object.keys(selected)
        .filter((id) => selected[id])
        .map((id) => {
          const p = samplePlaces.find((sp) => sp.id === id)!;
          return `${p.latitude},${p.longitude}`;
        }),
    [selected, samplePlaces]
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

  const selectedList = samplePlaces.filter((p) => selected[p.id]);
  const width = Dimensions.get("window").width;

  const onGenerate = () => {
    // Next iteration: send to backend /api/generate-route with selected waypoints
    // For now, just pop back
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
              <Marker
                anchor={{ x: 0.5, y: 1 }}
                coordinate={{
                  latitude: start.latitude as number,
                  longitude: start.longitude as number,
                }}
                title="Start"
              >
                <View style={[styles.markerContainer, styles.markerStart]}>
                  <Ionicons name="navigate" size={18} color="#2e86de" />
                </View>
              </Marker>
            )}
          {Number.isFinite(end.latitude) && Number.isFinite(end.longitude) && (
            <Marker
              anchor={{ x: 0.5, y: 1 }}
              coordinate={{
                latitude: end.latitude as number,
                longitude: end.longitude as number,
              }}
              title="End"
            >
              <View style={[styles.markerContainer, styles.markerEnd]}>
                <Ionicons name="location" size={18} color="#d63031" />
              </View>
            </Marker>
          )}
          {samplePlaces.map((p, idx) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.latitude, longitude: p.longitude }}
              title={p.name}
              pinColor={selected[p.id] ? "#2e86de" : (idx === activeIndex ? "#e67e22" : undefined)}
              onPress={() => toggle(p.id)}
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
        height={180}
        data={samplePlaces}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 70,
          parallaxAdjacentItemScale: 0.85,
        }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description}
              </Text>
              <TouchableOpacity
                onPress={() => toggle(item.id)}
                style={[
                  styles.cardBtn,
                  selected[item.id] && styles.cardBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.cardBtnText,
                    selected[item.id] && styles.cardBtnTextActive,
                  ]}
                >
                  {selected[item.id] ? "Selected" : "Select"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        onSnapToItem={(index) => {
          setActiveIndex(index);
          const p = samplePlaces[index];
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
  },
  markerContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  markerStart: {
    borderWidth: 1,
    borderColor: "#2e86de",
  },
  markerEnd: {
    borderWidth: 1,
    borderColor: "#d63031",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  listHeaderText: {
    fontSize: 16,
    fontWeight: "700",
  },
  count: {
    color: "#666",
  },
  placeRow: {
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  placeName: {
    fontSize: 14,
    fontWeight: "500",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#2e86de",
  },
  checkboxChecked: {
    backgroundColor: "#2e86de",
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
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardImage: { width: 140, height: 160 },
  cardBody: { flex: 1, padding: 10, gap: 6, justifyContent: "space-between" },
  cardTitle: { fontWeight: "700", fontSize: 14 },
  cardDesc: { color: "#666", fontSize: 12 },
  cardBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#eaf2ff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  cardBtnActive: { backgroundColor: "#2e86de" },
  cardBtnText: { color: "#2e86de", fontWeight: "700" },
  cardBtnTextActive: { color: "#fff" },
});

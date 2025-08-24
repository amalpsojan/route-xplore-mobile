import { getRouteWithWaypoints } from "@/api/index";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import OpenStreetMap from "../components/OpenStreetMap";

type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function PlacesScreen() {
  const router = useRouter();
  const { slat, slng, elat, elng } = useLocalSearchParams<{
    slat?: string;
    slng?: string;
    elat?: string;
    elng?: string;
  }>();

  // Placeholder places. Next iteration: fetch from backend /api/places
  const samplePlaces: Place[] = useMemo(
    () => [
      { id: "p1", name: "Viewpoint A", latitude: 10.40, longitude: 76.40 },
      { id: "p2", name: "Museum B", latitude: 10.35, longitude: 76.55 },
      { id: "p3", name: "Park C", latitude: 10.32, longitude: 76.70 },
    ],
    []
  );

  const mapRef = useRef<MapView | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const start = useMemo(() => ({
    latitude: slat ? Number(slat) : undefined,
    longitude: slng ? Number(slng) : undefined,
  }), [slat, slng]);
  const end = useMemo(() => ({
    latitude: elat ? Number(elat) : undefined,
    longitude: elng ? Number(elng) : undefined,
  }), [elat, elng]);

  const initialRegion = {
    latitude: (Number(slat) + Number(elat)) / 2 || 10.38,
    longitude: (Number(slng) + Number(elng)) / 2 || 76.55,
    latitudeDelta: 0.8,
    longitudeDelta: 0.8,
  };

  const waypoints = useMemo(() =>
    Object.keys(selected)
      .filter((id) => selected[id])
      .map((id) => {
        const p = samplePlaces.find((sp) => sp.id === id)!;
        return `${p.latitude},${p.longitude}`;
      }),
  [selected, samplePlaces]);

  const { data: routeData } = useQuery({
    queryKey: ["route-with-waypoints", start, end, waypoints],
    queryFn: () => getRouteWithWaypoints({
      start: `${start.latitude},${start.longitude}`,
      end: `${end.latitude},${end.longitude}`,
      waypoints,
      geometry: "geojson",
    }),
    enabled: Number.isFinite(start.latitude) && Number.isFinite(start.longitude) && Number.isFinite(end.latitude) && Number.isFinite(end.longitude),
  });

  const routeCoords = useMemo(() => {
    const coords: any = routeData?.geometry?.coordinates;
    if (!Array.isArray(coords)) return [] as Array<{ latitude: number; longitude: number }>;
    return coords
      .map((pair: any) => Array.isArray(pair) && pair.length >= 2 ? ({ latitude: Number(pair[1]), longitude: Number(pair[0]) }) : null)
      .filter((p: any) => p && Number.isFinite(p.latitude) && Number.isFinite(p.longitude)) as Array<{ latitude: number; longitude: number }>;
  }, [routeData]);

  const selectedList = samplePlaces.filter((p) => selected[p.id]);

  const onGenerate = () => {
    // Next iteration: send to backend /api/generate-route with selected waypoints
    // For now, just pop back
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <OpenStreetMap style={{ flex: 1 }} initialRegion={initialRegion} mapType="none" ref={mapRef}>
          {samplePlaces.map((p) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.latitude, longitude: p.longitude }}
              title={p.name}
              pinColor={selected[p.id] ? "#2e86de" : undefined}
              onPress={() => toggle(p.id)}
            />
          ))}
          {routeCoords.length > 0 && (
            <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#2e86de" />
          )}
        </OpenStreetMap>
      </View>
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>Select Places</Text>
        <Text style={styles.count}>{selectedList.length} selected</Text>
      </View>
      <FlatList
        data={samplePlaces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.placeRow} onPress={() => toggle(item.id)}>
            <Text style={styles.placeName}>{item.name}</Text>
            <View style={[styles.checkbox, selected[item.id] && styles.checkboxChecked]} />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ paddingBottom: 12 }}
      />
      <TouchableOpacity style={styles.button} onPress={onGenerate}>
        <Text style={styles.buttonText}>Generate Google Maps Link</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  mapContainer: {
    height: 260,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
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
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});



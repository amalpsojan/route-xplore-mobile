import { getRoute } from "@/api/index";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import OpenStreetMap from "../components/OpenStreetMap";

export default function RouteScreen() {
  const router = useRouter();
  const { slat, slng, elat, elng, sname, ename } = useLocalSearchParams<{
    slat?: string;
    slng?: string;
    elat?: string;
    elng?: string;
    sname?: string;
    ename?: string;
  }>();

  type LatLngOpt = { latitude?: number; longitude?: number };
  const [start, setStart] = useState<LatLngOpt>({
    latitude: slat ? Number(slat) : undefined,
    longitude: slng ? Number(slng) : undefined,
  });
  const [end, setEnd] = useState<LatLngOpt>({
    latitude: elat ? Number(elat) : undefined,
    longitude: elng ? Number(elng) : undefined,
  });
  const [editTarget, setEditTarget] = useState<"start" | "end">("start");

  const { data: routeData, isPending } = useQuery({
    queryKey: [
      "get-route",
      start.latitude,
      start.longitude,
      end.latitude,
      end.longitude,
    ],
    queryFn: () =>
      getRoute({
        start: `${start.latitude},${start.longitude}`,
        end: `${end.latitude},${end.longitude}`,
        geometry: "geojson",
      }),
    enabled:
      Number.isFinite(start.latitude) &&
      Number.isFinite(start.longitude) &&
      Number.isFinite(end.latitude) &&
      Number.isFinite(end.longitude),
  });

  const START = start;
  const END = end;

  const mapRef = useRef<MapView | null>(null);

  const initialRegion = {
    latitude: 20,
    longitude: 0,
    latitudeDelta: 40,
    longitudeDelta: 40,
  };

  // Build route coordinates from API response (expect GeoJSON LineString [lng, lat])
  const routeCoords = useMemo(() => {
    const coords: any = routeData?.geometry?.coordinates;
    if (!Array.isArray(coords)) return [] as Array<{ latitude: number; longitude: number }>;
    return coords
      .map((pair: any) =>
        Array.isArray(pair) && pair.length >= 2
          ? { latitude: Number(pair[1]), longitude: Number(pair[0]) }
          : null
      )
      .filter(
        (p: any) => p && Number.isFinite(p.latitude) && Number.isFinite(p.longitude)
      ) as Array<{ latitude: number; longitude: number }>;
  }, [routeData]);

  // Fit map once both coordinates are available
  useEffect(() => {
    const hasStart =
      Number.isFinite(START.latitude) && Number.isFinite(START.longitude);
    const hasEnd =
      Number.isFinite(END.latitude) && Number.isFinite(END.longitude);
    if (hasStart && hasEnd && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          {
            latitude: START.latitude as number,
            longitude: START.longitude as number,
          },
          {
            latitude: END.latitude as number,
            longitude: END.longitude as number,
          },
        ],
        {
          edgePadding: { top: 80, right: 80, bottom: 100, left: 80 },
          animated: true,
        }
      );
    }
  }, [START, END]);

  // Fit to the route when present
  useEffect(() => {
    if (routeCoords.length > 1 && mapRef.current) {
      mapRef.current.fitToCoordinates(routeCoords, {
        edgePadding: { top: 80, right: 80, bottom: 100, left: 80 },
        animated: true,
      });
    }
  }, [routeCoords]);

  // Keep rendering the map while fetching to avoid flicker

  return (
    <SafeAreaView style={styles.container}>
      {/* Top: Start */}
      <View style={styles.rowBox}>
        <Text style={styles.label}>Start</Text>
        {Number.isFinite(START.latitude) && Number.isFinite(START.longitude) ? (
          <Text style={styles.value}>
            {START.latitude?.toFixed(6)}, {START.longitude?.toFixed(6)}
          </Text>
        ) : (
          <Text style={styles.value}>—</Text>
        )}
      </View>
      {/* Below: End */}
      <View style={styles.rowBox}>
        <Text style={styles.label}>End</Text>
        {Number.isFinite(END.latitude) && Number.isFinite(END.longitude) ? (
          <Text style={styles.value}>
            {END.latitude?.toFixed(6)}, {END.longitude?.toFixed(6)}
          </Text>
        ) : (
          <Text style={styles.value}>—</Text>
        )}
      </View>

      {/* Edit controls */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, editTarget === "start" && styles.toggleActive]}
          onPress={() => setEditTarget("start")}
        >
          <Text style={[styles.toggleText, editTarget === "start" && styles.toggleTextActive]}>Edit Start</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, editTarget === "end" && styles.toggleActive]}
          onPress={() => setEditTarget("end")}
        >
          <Text style={[styles.toggleText, editTarget === "end" && styles.toggleTextActive]}>Edit End</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <OpenStreetMap
          style={{ flex: 1 }}
          initialRegion={initialRegion}
          mapType="none"
          pitchEnabled
          rotateEnabled
          scrollEnabled
          zoomEnabled
          ref={mapRef}
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            if (editTarget === "start") setStart({ latitude, longitude });
            else setEnd({ latitude, longitude });
          }}
        >
          {Number.isFinite(START.latitude) &&
            Number.isFinite(START.longitude) && (
              <Marker
                draggable
                onDragEnd={(e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  setStart({ latitude, longitude });
                }}
                coordinate={{
                  latitude: START.latitude as number,
                  longitude: START.longitude as number,
                }}
                title="Start"
              />
            )}
          {Number.isFinite(END.latitude) && Number.isFinite(END.longitude) && (
            <Marker
              draggable
              onDragEnd={(e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setEnd({ latitude, longitude });
              }}
              coordinate={{
                latitude: END.latitude as number,
                longitude: END.longitude as number,
              }}
              title="End"
            />
          )}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={4}
              strokeColor="#2e86de"
            />
          )}
        </OpenStreetMap>
        {/* OSM attribution */}
        <View style={styles.attributionContainer} pointerEvents="none">
          <View style={styles.attributionBadge}>
            <Text style={styles.attributionText}>
              © OpenStreetMap contributors
            </Text>
          </View>
        </View>
      </View>

      {/* Search Places button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/places",
            params: { slat, slng, elat, elng },
          })
        }
      >
        <Text style={styles.buttonText}>Search Places</Text>
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
    gap: 12,
  },
  rowBox: {
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    fontSize: 12,
    color: "#666",
  },
  value: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "600",
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#e8f0fe",
    borderColor: "#2e86de",
  },
  toggleText: {
    color: "#333",
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#2e86de",
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  button: {
    backgroundColor: "#2e86de",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: Platform.select({ ios: 10, android: 10, default: 10 }),
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  attributionContainer: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  attributionBadge: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  attributionText: {
    fontSize: 12,
    color: "#2d3436",
  },
});

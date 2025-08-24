import { getRoute } from "@/api/index";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
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

  const { data: routeData, isPending } = useQuery({
    queryKey: ["get-route", start, end],
    queryFn: () =>
      getRoute({
        start: `${start.latitude},${start.longitude}`,
        end: `${end.latitude},${end.longitude}`,
        geometry: "geojson",
      }),
    enabled: Boolean(start.latitude) && Boolean(start.longitude) && Boolean(end.latitude) && Boolean(end.longitude),
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

  

  // Build route coordinates from API response (supports multiple shapes)
  const routeCoords = useMemo(() => {
    const out: Array<{ latitude: number; longitude: number }> = [];
    const pl: any = routeData;
    if (!pl) return out;

    // 1) GeoJSON LineString: [lng, lat]
    const geo = pl?.route?.geometry?.coordinates || pl?.geometry?.coordinates;
    if (Array.isArray(geo) && geo.length) {
      for (const pair of geo) {
        if (Array.isArray(pair) && pair.length >= 2) {
          const [lng, lat] = pair;
          const la = typeof lat === "string" ? Number(lat) : lat;
          const lo = typeof lng === "string" ? Number(lng) : lng;
          if (Number.isFinite(la) && Number.isFinite(lo))
            out.push({ latitude: la, longitude: lo });
        }
      }
    }

    // 2) Array of {lat,lng} or [lat,lng]
    if (out.length === 0) {
      const arr = pl?.route?.coordinates || pl?.coordinates;
      if (Array.isArray(arr)) {
        for (const item of arr) {
          if (Array.isArray(item) && item.length >= 2) {
            const [laRaw, loRaw] = item;
            const la = typeof laRaw === "string" ? Number(laRaw) : laRaw;
            const lo = typeof loRaw === "string" ? Number(loRaw) : loRaw;
            if (Number.isFinite(la) && Number.isFinite(lo))
              out.push({ latitude: la, longitude: lo });
          } else if (item && typeof item === "object") {
            const la =
              typeof item.lat === "string"
                ? Number(item.lat)
                : item.lat ?? item.latitude;
            const lo =
              typeof item.lng === "string"
                ? Number(item.lng)
                : item.lng ?? item.lon ?? item.long ?? item.longitude;
            if (Number.isFinite(la) && Number.isFinite(lo))
              out.push({ latitude: la as number, longitude: lo as number });
          }
        }
      }
    }

    

    return out;
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

  if (isPending) return <Text>Loading...</Text>;

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
        >
          {Number.isFinite(START.latitude) &&
            Number.isFinite(START.longitude) && (
              <Marker
                coordinate={{
                  latitude: START.latitude as number,
                  longitude: START.longitude as number,
                }}
                title="Start"
              />
            )}
          {Number.isFinite(END.latitude) && Number.isFinite(END.longitude) && (
            <Marker
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

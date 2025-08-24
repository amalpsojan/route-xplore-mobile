import { getRoute } from "@/api/index";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OpenStreetMap from "../components/OpenStreetMap";
import EndMarker from "../components/marker/EndMarker";
import StartMarker from "../components/marker/StartMarker";

export default function RouteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  // Track initial coordinates to control label precedence
  const initialStartRef = useRef<LatLngOpt>({
    latitude: slat ? Number(slat) : undefined,
    longitude: slng ? Number(slng) : undefined,
  });
  const initialEndRef = useRef<LatLngOpt>({
    latitude: elat ? Number(elat) : undefined,
    longitude: elng ? Number(elng) : undefined,
  });
  const hasEditedStart = useMemo(() => {
    const ilat = initialStartRef.current.latitude;
    const ilng = initialStartRef.current.longitude;
    return (
      Number.isFinite(start.latitude) &&
      Number.isFinite(start.longitude) &&
      (start.latitude !== ilat || start.longitude !== ilng)
    );
  }, [start]);
  const hasEditedEnd = useMemo(() => {
    const ilat = initialEndRef.current.latitude;
    const ilng = initialEndRef.current.longitude;
    return (
      Number.isFinite(end.latitude) &&
      Number.isFinite(end.longitude) &&
      (end.latitude !== ilat || end.longitude !== ilng)
    );
  }, [end]);

  const startLabel = useMemo(() => {
    // Before edit: prefer sname; After edit: prefer API name
    if (!hasEditedStart && sname) return String(sname);
    const apiName = (routeData as any)?.start?.name;
    if (hasEditedStart && apiName) return String(apiName);
    if (Number.isFinite(START.latitude) && Number.isFinite(START.longitude)) {
      return `${(START.latitude as number).toFixed(6)}, ${(
        START.longitude as number
      ).toFixed(6)}`;
    }
    return "—";
  }, [sname, routeData, START, hasEditedStart]);

  const endLabel = useMemo(() => {
    if (!hasEditedEnd && ename) return String(ename);
    const apiName = (routeData as any)?.end?.name;
    if (hasEditedEnd && apiName) return String(apiName);
    if (Number.isFinite(END.latitude) && Number.isFinite(END.longitude)) {
      return `${(END.latitude as number).toFixed(6)}, ${(
        END.longitude as number
      ).toFixed(6)}`;
    }
    return "—";
  }, [ename, routeData, END, hasEditedEnd]);

  // Build route coordinates from API response (expect GeoJSON LineString [lng, lat])
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

  function formatDuration(seconds?: number) {
    if (!seconds || !Number.isFinite(seconds)) return "—";
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h} hr${h > 1 ? "s" : ""} ${m} min`;
  }

  function formatDistance(meters?: number) {
    if (!meters || !Number.isFinite(meters)) return "—";
    const km = meters / 1000;
    if (km < 1) return `${Math.round(meters)} m`;
    return `${km.toFixed(1)} km`;
  }

  const swapStartEnd = () => {
    const s = { ...START } as LatLngOpt;
    const e = { ...END } as LatLngOpt;
    setStart(e);
    setEnd(s);
  };

  const renderHeader = () => {
    return (
      <Fragment>
        {/* Top card overlay */}
        <View pointerEvents="box-none" style={styles.topOverlay}>
          <View style={styles.topCard}>
            <View style={styles.topRow}>
              <Ionicons
                name="navigate"
                size={18}
                color="#2e86de"
                style={styles.icon}
              />
              <Text style={styles.topText}>{startLabel}</Text>
            </View>
            <TouchableOpacity style={styles.swapRow} onPress={swapStartEnd}>
              <Ionicons name="swap-vertical" size={18} color="#555" />
              <Text style={styles.swapText}>Swap</Text>
            </TouchableOpacity>
            <View style={styles.topRow}>
              <Ionicons
                name="location"
                size={18}
                color="#d63031"
                style={styles.icon}
              />
              <Text style={styles.topText}>{endLabel}</Text>
            </View>
            <View style={styles.editRow}>
              <TouchableOpacity
                style={[
                  styles.editChip,
                  editTarget === "start" && styles.editChipActive,
                ]}
                onPress={() => setEditTarget("start")}
              >
                <Text
                  style={[
                    styles.editChipText,
                    editTarget === "start" && styles.editChipTextActive,
                  ]}
                >
                  Edit Start
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.editChip,
                  editTarget === "end" && styles.editChipActive,
                ]}
                onPress={() => setEditTarget("end")}
              >
                <Text
                  style={[
                    styles.editChipText,
                    editTarget === "end" && styles.editChipTextActive,
                  ]}
                >
                  Edit End
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Fragment>
    );
  };

  const renderBottom = () => {
    return (
      <Fragment>
        {/* Bottom summary bar */}
        <View style={styles.bottomBar}>
          <View style={styles.summaryPill}>
            <Ionicons name="car" size={16} color="#333" />
            <Text style={styles.summaryText}>
              {formatDuration(routeData?.durationSeconds)}
            </Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.summaryText}>
              {formatDistance(routeData?.distanceMeters)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bottomPrimary}
            onPress={() =>
              router.push({
                pathname: "/places",
                params: { slat, slng, elat, elng },
              })
            }
          >
            <Text style={styles.bottomPrimaryText}>Search Places</Text>
          </TouchableOpacity>
        </View>
      </Fragment>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
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
              <StartMarker
                draggable
                anchor={{ x: 0.5, y: 1 }}
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
            <EndMarker
              draggable
              anchor={{ x: 0.5, y: 1 }}
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

        {renderHeader()}

        {renderBottom()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    marginTop: 8,
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
  topOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
  },
  topCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: { marginRight: 8 },
  topText: { fontSize: 14, fontWeight: "600" },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  editRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  editChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  editChipActive: {
    backgroundColor: "#e8f0fe",
    borderColor: "#2e86de",
  },
  editChipText: { color: "#333", fontWeight: "600" },
  editChipTextActive: { color: "#2e86de" },
  swapRow: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  swapText: { color: "#555", fontWeight: "700" },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  summaryPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  summaryText: { fontWeight: "700", color: "#333" },
  dot: { marginHorizontal: 4, color: "#999" },
  bottomPrimary: {
    backgroundColor: "#2e86de",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  bottomPrimaryText: { color: "#fff", fontWeight: "700" },
});

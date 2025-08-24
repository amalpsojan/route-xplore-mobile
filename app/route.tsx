import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const OSM_TILE_TEMPLATE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export default function RouteScreen() {
  const router = useRouter();
  const { url } = useLocalSearchParams<{ url?: string }>();

  // TODO: Parse the provided Google Maps URL via backend; hard-coded for now
  const START = { latitude: 10.4723104, longitude: 76.2147255 };
  const END = { latitude: 10.2814598, longitude: 76.8649643 };

  const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const mapRef = useRef<MapView | null>(null);

  const initialRegion = {
    latitude: (START.latitude + END.latitude) / 2,
    longitude: (START.longitude + END.longitude) / 2,
    latitudeDelta: Math.abs(START.latitude - END.latitude) * 2 || 0.5,
    longitudeDelta: Math.abs(START.longitude - END.longitude) * 2 || 0.5,
  };

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const osrm = `https://router.project-osrm.org/route/v1/driving/${START.longitude},${START.latitude};${END.longitude},${END.latitude}?overview=full&geometries=geojson`;
        const res = await fetch(osrm);
        const json = await res.json();
        const coords = json?.routes?.[0]?.geometry?.coordinates ?? [];
        const mapped = coords.map((pair: [number, number]) => ({ latitude: pair[1], longitude: pair[0] }));
        setRouteCoords(mapped);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Failed to fetch route from OSRM", e);
      }
    };
    fetchRoute();
  }, [url]);

  useEffect(() => {
    if (routeCoords.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(routeCoords, {
        edgePadding: { top: 60, right: 40, bottom: 60, left: 40 },
        animated: true,
      });
    }
  }, [routeCoords]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top: Start */}
      <View style={styles.rowBox}>
        <Text style={styles.label}>Start</Text>
        <Text style={styles.value}>{START.latitude.toFixed(6)},{" "}{START.longitude.toFixed(6)}</Text>
      </View>
      {/* Below: End */}
      <View style={styles.rowBox}>
        <Text style={styles.label}>End</Text>
        <Text style={styles.value}>{END.latitude.toFixed(6)},{" "}{END.longitude.toFixed(6)}</Text>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={initialRegion}
          provider={PROVIDER_DEFAULT}
          mapType="none"
          pitchEnabled
          rotateEnabled
          scrollEnabled
          zoomEnabled
          ref={mapRef}
        >
          <UrlTile urlTemplate={OSM_TILE_TEMPLATE} maximumZ={19} tileSize={256} shouldReplaceMapContent zIndex={0} />
          <Marker coordinate={START} title="Start" />
          <Marker coordinate={END} title="End" />
          {routeCoords.length > 0 && (
            <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#2e86de" />
          )}
        </MapView>
        {/* OSM attribution */}
        <View style={styles.attributionContainer} pointerEvents="none">
          <View style={styles.attributionBadge}>
            <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
          </View>
        </View>
      </View>

      {/* Search Places button */}
      <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname: "/places", params: { url } })}>
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



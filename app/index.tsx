import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const OSM_TILE_TEMPLATE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const IndexScreen = () => {
  const START = { latitude: 10.4723104, longitude: 76.2147255 };
  const END = { latitude: 10.2814598, longitude: 76.8649643 };

  const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);

  const initialRegion = {
    latitude: (START.latitude + END.latitude) / 2,
    longitude: (START.longitude + END.longitude) / 2,
    latitudeDelta: Math.abs(START.latitude - END.latitude) * 2 || 0.5,
    longitudeDelta: Math.abs(START.longitude - END.longitude) * 2 || 0.5,
  };

  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${START.longitude},${START.latitude};${END.longitude},${END.latitude}?overview=full&geometries=geojson`;
        const res = await fetch(url);
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
  }, []);

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
        {/* OpenStreetMap raster tiles */}
        <UrlTile
          /* OSM requires subdomains a, b, c for load-balancing */
          urlTemplate={OSM_TILE_TEMPLATE}
          maximumZ={19}
          tileSize={256}
          shouldReplaceMapContent
          zIndex={0}
          /* react-native-maps will automatically expand {s} across a,b,c */
        />

        {/* Start and End markers */}
        <Marker coordinate={START} title="Start" />
        <Marker coordinate={END} title="End" />

        {/* Route polyline */}
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#2e86de" />
        )}
      </MapView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 18,
  },
  attributionContainer: {
    position: "absolute",
    bottom: Platform.select({ ios: 10, android: 10, default: 10 }),
    right: Platform.select({ ios: 10, android: 10, default: 10 }),
  },
  attributionBadge: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  attributionTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  attributionText: {
    fontSize: 12,
    color: "#2d3436",
  },
});

export default IndexScreen;

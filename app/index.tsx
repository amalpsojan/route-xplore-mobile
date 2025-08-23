import React from "react";
import { Platform, StyleSheet } from "react-native";
import MapView, { PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const OSM_TILE_TEMPLATE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const IndexScreen = () => {
  const initialRegion = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

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

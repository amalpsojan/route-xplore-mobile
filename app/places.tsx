import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

const OSM_TILE_TEMPLATE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function PlacesScreen() {
  const router = useRouter();
  const { url } = useLocalSearchParams<{ url?: string }>();

  // Placeholder places. Next iteration: fetch from backend /api/places
  const samplePlaces: Place[] = useMemo(
    () => [
      { id: "p1", name: "Viewpoint A", latitude: 10.40, longitude: 76.40 },
      { id: "p2", name: "Museum B", latitude: 10.35, longitude: 76.55 },
      { id: "p3", name: "Park C", latitude: 10.32, longitude: 76.70 },
    ],
    []
  );

  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const initialRegion = {
    latitude: 10.38,
    longitude: 76.55,
    latitudeDelta: 0.8,
    longitudeDelta: 0.8,
  };

  const selectedList = samplePlaces.filter((p) => selected[p.id]);

  const onGenerate = () => {
    // Next iteration: send to backend /api/generate-route with selected waypoints
    // For now, just pop back
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView style={{ flex: 1 }} initialRegion={initialRegion} provider={PROVIDER_DEFAULT} mapType="none">
          <UrlTile urlTemplate={OSM_TILE_TEMPLATE} maximumZ={19} tileSize={256} shouldReplaceMapContent zIndex={0} />
          {samplePlaces.map((p) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.latitude, longitude: p.longitude }}
              title={p.name}
              pinColor={selected[p.id] ? "#2e86de" : undefined}
              onPress={() => toggle(p.id)}
            />
          ))}
        </MapView>
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



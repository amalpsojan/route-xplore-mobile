import { parseLink } from "@/api/index";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const IndexScreen = () => {
  const router = useRouter();
  const [url, setUrl] = useState("https://maps.app.goo.gl/iM6y5bicQRJUuYRV8");

  const { mutateAsync, isPending, error, reset } = useMutation({
    mutationFn: (link: string) => parseLink(link),
  });

  const onSearch = useCallback(async () => {
    const { end, start } = await mutateAsync(url.trim());

    const startLat = Number(start.coordinates.lat);
    const startLng = Number(start.coordinates.lng);
    const startName = start.name;
    const endLat = Number(end.coordinates.lat);
    const endLng = Number(end.coordinates.lng);
    const endName = end.name;

    if (
      !Number.isFinite(startLat) ||
      !Number.isFinite(startLng) ||
      !Number.isFinite(endLat) ||
      !Number.isFinite(endLng)
    ) {
      throw new Error("Could not resolve start/end coordinates from link");
    }

    router.push({
      pathname: "/route",
      params: {
        slat: String(startLat),
        slng: String(startLng),
        sname: startName,
        elat: String(endLat),
        elng: String(endLng),
        ename: endName,
      },
    });
  }, [mutateAsync, router]);

  const isButtonDisabled = useMemo(
    () => isPending || !url.trim(),
    [isPending, url]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>RouteXplore</Text>
        <Text style={styles.subtitle}>Paste your Google Maps route link</Text>
      </View>
      <View style={styles.inputCard}>
        <TextInput
          placeholder="https://www.google.com/maps/dir/?api=1&origin=...&destination=..."
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={styles.input}
        />
        <TouchableOpacity
          style={[styles.button, { opacity: isButtonDisabled ? 0.5 : 1 }]}
          onPress={onSearch}
          disabled={isButtonDisabled}
        >
          <Text style={styles.buttonText}>
            {isPending ? "Parsing..." : "Search"}
          </Text>
        </TouchableOpacity>
      </View>
      {error ? (
        <View style={{ marginTop: 8 }}>
          <Text style={{ color: "#c0392b" }}>
            {(error as any)?.message || "Failed to parse link"}
          </Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    color: "#555",
  },
  inputCard: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  button: {
    backgroundColor: "#2e86de",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default IndexScreen;

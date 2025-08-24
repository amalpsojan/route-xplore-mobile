import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const IndexScreen = () => {
  const router = useRouter();
  const [url, setUrl] = useState("https://maps.app.goo.gl/iM6y5bicQRJUuYRV8");

  const onSearch = () => {
    if (!url.trim()) return;
    router.push({ pathname: "/route", params: { url } });
  };

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
        <TouchableOpacity style={styles.button} onPress={onSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
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

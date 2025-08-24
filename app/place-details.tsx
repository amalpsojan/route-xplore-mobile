import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export default function PlaceDetailsScreen() {
  const { wiki, url } = useLocalSearchParams<{ wiki?: string; url?: string }>();
  const pageUrl = useMemo(() => {
    if (url) return String(url);
    if (wiki) return `https://www.wikidata.org/wiki/${wiki}`;
    return "https://en.wikipedia.org";
  }, [wiki, url]);

  return (
    <View style={styles.container}>
      <WebView source={{ uri: pageUrl }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});



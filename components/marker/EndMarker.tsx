import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";

type MarkerProps = React.ComponentProps<typeof Marker>;

const EndMarker = (props: MarkerProps) => {
  return (
    <Marker {...props}>
      <MarkerIcon />
    </Marker>
  );
};

const MarkerIcon = () => {
  return (
    <View style={styles.container}>
      <Ionicons name="location" size={18} color="#d63031" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#d63031",
  },
});

export default EndMarker;



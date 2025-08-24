import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Marker } from "react-native-maps";

type MarkerProps = React.ComponentProps<typeof Marker> & {
  text: string;
};

const WaypointMarker: React.FC<MarkerProps> = ({ text, ...props }) => {
  return (
    <Marker {...props}>
      <MarkerIcon text={text} />
    </Marker>
  );
};

const MarkerIcon = ({ text }: { text: string }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#d63031",
  },
  text: {
    color: "#d63031",
    fontWeight: "700",
  },
});

export default WaypointMarker;

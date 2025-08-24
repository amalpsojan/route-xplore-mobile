import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Marker } from "react-native-maps";

type MarkerProps = React.ComponentProps<typeof Marker> & {
  text: string;
  focused?: boolean;
};

const WaypointMarker: React.FC<MarkerProps> = ({ text, focused = false, ...props }) => {
  return (
    <Marker {...props}>
      <MarkerIcon text={text} focused={focused} />
    </Marker>
  );
};

const MarkerIcon = ({ text, focused }: { text: string; focused: boolean }) => {
  return (
    <View style={[styles.container, focused && styles.focused]}>
      <Text style={[styles.text, focused && styles.focusedText]}>{text}</Text>
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
  focused: {
    borderColor: "#2e86de",
    // zIndex: 1000,
  },
  focusedText: {
    color: "#2e86de",
  },
});

export default WaypointMarker;

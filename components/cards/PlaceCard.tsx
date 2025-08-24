import { BlurView } from "expo-blur";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

type Props = {
  name: string;
  imageUrl: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
  onPress: () => void;
};

const PlaceCard: React.FC<Props> = ({
  name,
  imageUrl,
  description,
  selected,
  onToggle,
  onPress,
}) => {
  const toggleTap = Gesture.Tap()
    .maxDuration(250)
    .maxDistance(5)
    .onEnd((_event, success) => {
      if (success) {
        runOnJS(onToggle)();
      }
    });

  const cardTap = Gesture.Tap()
    .maxDuration(250)
    .maxDistance(10)
    .requireExternalGestureToFail(toggleTap)
    .onEnd((_event, success) => {
      if (success) {
        runOnJS(onPress)();
      }
    });

  return (
    <View style={styles.cardContainer}>
      <GestureDetector gesture={cardTap}>
        <View style={styles.cardTouchable}>
          <BlurView intensity={25} tint="dark" style={styles.card}>
            <Image source={{ uri: imageUrl }} style={styles.cardImage} />
            <BlurView intensity={5} tint="dark" style={styles.cardBody}>
              <Text style={styles.cardTitle}>{name}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {description}
              </Text>
              <BlurView 
                intensity={10} 
                tint={"dark"} 
                style={[styles.cardBtn]}
              >
                <GestureDetector gesture={toggleTap}>
                  <View style={styles.cardBtnTouch}>
                    <Text style={[styles.cardBtnText]}>
                      {selected ? "Selected" : "Select"}
                    </Text>
                  </View>
                </GestureDetector>
              </BlurView>
            </BlurView>
          </BlurView>
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 12,
  },
  cardTouchable: {
    borderRadius: 20,
  },
  card: {
    flexDirection: "row",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    height: 180,
  },
  cardImage: { 
    width: 140, 
    height: 180,
  },
  cardBody: { 
    flex: 1, 
    padding: 16, 
    gap: 10, 
    justifyContent: "space-between",
  },
  cardTitle: { 
    fontWeight: "800", 
    fontSize: 17,
    color: "#1a1a1a",
    letterSpacing: 0.3,
    textShadowColor: "rgba(255, 255, 255, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardDesc: { 
    color: "#2c2c2c", 
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    textShadowColor: "rgba(255, 255, 255, 0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  cardBtn: {
    alignSelf: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden",
  },
  cardBtnTouch: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cardBtnText: { 
    color: "#1a5490", 
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.3,
    textAlign: "center",
  },
});

export default PlaceCard;



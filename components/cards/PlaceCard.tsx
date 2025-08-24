import { BlurView } from "expo-blur";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { State, TapGestureHandler } from "react-native-gesture-handler";

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
  const handleTap = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      onPress();
    }
  };

  const handleSelectTap = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      onToggle();
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TapGestureHandler
        onHandlerStateChange={handleTap}
        maxDeltaX={10}
        maxDeltaY={10}
        minPointers={1}
      >
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
                <TapGestureHandler
                  onHandlerStateChange={handleSelectTap}
                  maxDeltaX={5}
                  maxDeltaY={5}
                >
                  <View style={styles.cardBtnTouch}>
                    <Text style={[styles.cardBtnText]}>
                      {selected ? "Selected" : "Select"}
                    </Text>
                  </View>
                </TapGestureHandler>
              </BlurView>
            </BlurView>
          </BlurView>
        </View>
      </TapGestureHandler>
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
  cardBtnActive: { 
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  cardBtnText: { 
    color: "#1a5490", 
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  cardBtnTextActive: { 
    color: "#ffffff",
    fontWeight: "800",
  },

});

export default PlaceCard;



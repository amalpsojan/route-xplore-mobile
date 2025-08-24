import { BlurView } from "expo-blur";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  name: string;
  imageUrl: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
  onViewDetails?: () => void;
};

const PlaceCard: React.FC<Props> = ({
  name,
  imageUrl,
  description,
  selected,
  onToggle,
  onViewDetails,
}) => {
  return (
    <View style={styles.cardContainer}>
      <BlurView intensity={25} tint="dark" style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.cardImage} />
        <BlurView intensity={5} tint="dark" style={styles.cardBody}>
          <Text style={styles.cardTitle}>{name}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {description}
          </Text>
          <BlurView 
            intensity={selected ? 20 : 10} 
            tint={selected ? "light" : "dark"} 
            style={[styles.cardBtn, selected && styles.cardBtnActive]}
          >
            <TouchableOpacity onPress={onToggle} style={styles.cardBtnTouch}>
              <Text style={[styles.cardBtnText, selected && styles.cardBtnTextActive]}>
                {selected ? "Selected" : "Select"}
              </Text>
            </TouchableOpacity>
          </BlurView>
          {onViewDetails ? (
            <TouchableOpacity onPress={onViewDetails} style={styles.linkBtn}>
              <Text style={styles.linkText}>View details</Text>
            </TouchableOpacity>
          ) : null}
        </BlurView>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 12,
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
  linkBtn: { 
    marginTop: 6,
    paddingVertical: 6,
  },
  linkText: { 
    color: "#1a5490", 
    fontWeight: "700",
    fontSize: 14,
    textDecorationLine: "underline",
    textDecorationColor: "rgba(26, 84, 144, 0.6)",
  },
});

export default PlaceCard;



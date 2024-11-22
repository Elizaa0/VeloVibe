import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Polyline } from "react-native-maps";

const RouteDetailsScreen = ({ route }) => {
  const { selectedRoute } = route.params;

  if (!selectedRoute || !selectedRoute.route) {
    return (
      <View style={styles.container}>
        <Text>Błąd: Nie można załadować trasy. Sprawdź dane.</Text>
      </View>
    );
  }

  const calculateDistance = (route) => {
    if (!route || route.length < 2) return 0;
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const pointA = route[i];
      const pointB = route[i + 1];
      totalDistance += haversineDistance(
        pointA.latitude,
        pointA.longitude,
        pointB.latitude,
        pointB.longitude
      );
    }
    return totalDistance;
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = degToRad(lat2 - lat1);
    const dLon = degToRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const degToRad = (deg) => deg * (Math.PI / 180);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: selectedRoute.route[0].latitude,
          longitude: selectedRoute.route[0].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Polyline
          coordinates={selectedRoute.route}
          strokeColor="#FF0000"
          strokeWidth={4}
        />
      </MapView>
      <View style={styles.info}>
        <Text style={styles.name}>{selectedRoute.name}</Text>
        <Text style={styles.distance}>
          Dystans: {(calculateDistance(selectedRoute.route) / 1000).toFixed(2)} km
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8FF",
  },
  map: {
    flex: 1,
  },
  info: {
    padding: 10,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#CCC",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  distance: {
    fontSize: 16,
    color: "#555",
  },
});

export default RouteDetailsScreen;

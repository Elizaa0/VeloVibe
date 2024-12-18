import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useRoute } from "@react-navigation/native";

const RouteDetailsScreen = () => {
  const [routeDetails, setRouteDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const route = useRoute();
  const { routeId } = route.params;

  useEffect(() => {
    const fetchRouteDetails = async () => {
      try {
        if (!routeId) {
          throw new Error("Brak ID trasy.");
        }

        const routeDoc = await getDoc(doc(db, "routes", routeId));
        if (routeDoc.exists()) {
          setRouteDetails(routeDoc.data());
        } else {
          throw new Error("Nie znaleziono trasy o podanym ID.");
        }
      } catch (err) {
        console.error("Błąd pobierania szczegółów trasy:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRouteDetails();
  }, [routeId]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#9FFB88" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : routeDetails ? (
        <>
          <Text style={styles.title}>{routeDetails.name}</Text>
          <Text style={styles.distance}>
            Dystans: {(routeDetails.distance / 1000).toFixed(2)} km
          </Text>

          {routeDetails.coordinates && routeDetails.coordinates.length > 0 ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: routeDetails.coordinates[0]?.latitude || 0,
                longitude: routeDetails.coordinates[0]?.longitude || 0,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              <Polyline
                coordinates={routeDetails.coordinates}
                strokeColor="#FF0000"
                strokeWidth={4}
              />
            </MapView>
          ) : (
            <Text style={styles.noRouteText}>Brak danych o trasie.</Text>
          )}
        </>
      ) : (
        <Text style={styles.errorText}>Nie znaleziono szczegółów trasy.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8FF",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  distance: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    color: "#555",
  },
  map: {
    flex: 1,
    marginTop: 10,
    borderRadius: 10,
  },
  noRouteText: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default RouteDetailsScreen;

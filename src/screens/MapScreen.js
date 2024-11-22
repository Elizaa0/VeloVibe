import React, { useState, useEffect } from "react";
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigation } from "@react-navigation/native";

const MapScreen = () => {
  const [routes, setRoutes] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "routes"));
        const fetchedRoutes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoutes(fetchedRoutes);
      } catch (error) {
        console.error("Błąd podczas pobierania tras: ", error);
      }
    };

    fetchRoutes();
  }, []);

  const renderRouteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.routeItem}
      onPress={() => navigation.navigate("RouteDetails", { selectedRoute: item })}
    >
      <Text style={styles.routeName}>{item.name}</Text>
      <Text style={styles.routeDistance}>Dystans: {(item.distance / 1000).toFixed(2)} km</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trasy</Text>
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        renderItem={renderRouteItem}
        ListEmptyComponent={<Text style={styles.noRoutes}>Brak dostępnych tras.</Text>}
      />
      <TouchableOpacity
        style={styles.addRouteButton}
        onPress={() => navigation.navigate("AddRoute")}
      >
        <Text style={styles.addRouteText}>Dodaj nową trasę</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F0F8FF",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  routeItem: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  routeName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  routeDistance: {
    fontSize: 16,
    color: "#555",
  },
  noRoutes: {
    textAlign: "center",
    color: "#555",
    fontSize: 16,
  },
  addRouteButton: {
    backgroundColor: "#9FFB88",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  addRouteText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },
});

export default MapScreen;

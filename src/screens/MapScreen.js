import React, { useState, useEffect, useCallback } from "react";
import {View, FlatList, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator,} from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getAuth } from "firebase/auth"; 
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const MapScreen = () => {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [filterValue, setFilterValue] = useState("");
  const [sortOrder, setSortOrder] = useState("distance");
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser; 

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      if (!user) {
        console.error("Użytkownik nie jest zalogowany.");
        return;
      }

      const q = query(collection(db, "routes"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const fetchedRoutes = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Nieznana trasa",
          distance: data.distance || 0,
          coordinates: data.coordinates || [],
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });

      setRoutes(fetchedRoutes);
      setFilteredRoutes(fetchedRoutes);
    } catch (error) {
      console.error("Błąd podczas pobierania tras: ", error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRoutes();
    }, [user])
  );

  const filterRoutes = (value) => {
    setFilterValue(value);
    const filtered = routes.filter(
      (route) => route.distance / 1000 >= parseFloat(value) || value === ""
    );
    setFilteredRoutes(filtered);
  };

  const sortRoutes = (order) => {
    setSortOrder(order);
    const sorted = [...filteredRoutes].sort((a, b) => {
      if (order === "distance") return a.distance - b.distance;
      else return a.name.localeCompare(b.name);
    });
    setFilteredRoutes(sorted);
  };

  const handleRoutePress = (route) => {
    if (!route.coordinates || route.coordinates.length === 0) {
      alert("Brak współrzędnych dla tej trasy.");
      return;
    }
    setSelectedRoute(route);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Twoje Trasy</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#9FFB88" />
      ) : (
        <>
          <TextInput
            style={styles.filterInput}
            placeholder="Minimalna długość trasy (km)"
            keyboardType="numeric"
            value={filterValue}
            onChangeText={filterRoutes}
          />

          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => sortRoutes("distance")}
            >
              <Text style={styles.sortButtonText}>Sortuj wg Dystansu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => sortRoutes("name")}
            >
              <Text style={styles.sortButtonText}>Sortuj wg Nazwy</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredRoutes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.routeItem}
                onPress={() => handleRoutePress(item)}
              >
                <Text style={styles.routeName}>{item.name}</Text>
                <Text style={styles.routeDistance}>
                  Dystans: {(item.distance / 1000).toFixed(2)} km
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.noRoutes}>Brak dostępnych tras.</Text>
            }
          />

          {selectedRoute && selectedRoute.coordinates && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: selectedRoute.coordinates[0]?.latitude || 0,
                  longitude: selectedRoute.coordinates[0]?.longitude || 0,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
              >
                <Polyline
                  coordinates={selectedRoute.coordinates}
                  strokeColor="#FF0000"
                  strokeWidth={3}
                />
              </MapView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedRoute(null)}
              >
                <Text style={styles.closeButtonText}>Zamknij podgląd</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={styles.addRouteButton}
            onPress={() => navigation.navigate("AddRoute")}
          >
            <Text style={styles.addRouteText}>Dodaj Nową Trasę</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F0F8FF", 
    padding: 16 
  },
  header: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 10, 
    textAlign: "center" 
  },
  filterInput: { 
    backgroundColor: "#FFF", 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 10 
  },
  sortButtons: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 10 
  },
  sortButton: { 
    backgroundColor: "#9FFB88", 
    padding: 10, 
    borderRadius: 8, 
    flex: 1, 
    marginHorizontal: 5 
  },
  sortButtonText: { 
    color: "#333", 
    fontWeight: "bold", 
    textAlign: "center" 
  },
  routeItem: { 
    backgroundColor: "#FFF", 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10 
  },
  routeName: { 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  routeDistance: { 
    fontSize: 16, 
    color: "#555" 
  },
  noRoutes: { 
    textAlign: "center", 
    color: "#555", 
    fontSize: 16 
  },
  mapContainer: { 
    marginTop: 10, 
    height: 300, 
    borderRadius: 8 
  },
  map: { 
    flex: 1 
  },
  closeButton: { 
    padding: 10, 
    backgroundColor: "#FF5C5C", 
    alignItems: "center" 
  },
  closeButtonText: { 
    color: "#FFF", 
    fontWeight: "bold" 
  },
  addRouteButton: { 
    backgroundColor: "#9FFB88", 
    padding: 15, 
    borderRadius: 8, 
    marginTop: 10 
  },
  addRouteText: { 
    fontSize: 18, 
    color: "#333", 
    fontWeight: "bold", 
    textAlign: "center" 
  },
});

export default MapScreen;

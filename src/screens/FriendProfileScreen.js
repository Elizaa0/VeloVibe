import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useRoute } from "@react-navigation/native";
import MapView, { Polyline } from "react-native-maps";

const FriendProfileScreen = () => {
  const [routes, setRoutes] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const route = useRoute();

  if (!route.params || !route.params.friendId || !route.params.name) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Brak danych znajomego.</Text>
      </View>
    );
  }

  const { friendId, name } = route.params;

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const q = query(collection(db, "routes"), where("userId", "==", friendId));
        const querySnapshot = await getDocs(q);

        const fetchedRoutes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          route: doc.data().coordinates || [],
        }));

        setRoutes(fetchedRoutes);
      } catch (error) {
        console.error("Błąd pobierania tras znajomego:", error.message);
      }
    };

    const fetchTrainings = async () => {
      try {
        const q = query(collection(db, "trainings"), where("userId", "==", friendId));
        const querySnapshot = await getDocs(q);

        const fetchedTrainings = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTrainings(fetchedTrainings);
      } catch (error) {
        console.error("Błąd pobierania treningów znajomego:", error.message);
      }
    };

    fetchRoutes();
    fetchTrainings();
  }, [friendId]);

  const handleShowRoute = (itemId) => {
    setSelectedItemId((prevId) => (prevId === itemId ? null : itemId));
  };

  const formatElapsedTime = (elapsedTime) => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profil użytkownika: {name}</Text>

      {/* Trasy */}
      <Text style={styles.sectionHeader}>Trasy użytkownika</Text>
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemTitle}>Trasa: {item.name || "Brak nazwy"}</Text>
            <Text style={styles.itemDetail}>
              Dystans: {(item.distance / 1000).toFixed(2)} km
            </Text>
            <TouchableOpacity
              style={styles.showRouteButton}
              onPress={() => handleShowRoute(item.id)}
            >
              <Text style={styles.showRouteButtonText}>
                {selectedItemId === item.id ? "Ukryj trasę" : "Pokaż trasę"}
              </Text>
            </TouchableOpacity>
            {selectedItemId === item.id && item.route.length > 0 && (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: item.route[0]?.latitude || 0,
                    longitude: item.route[0]?.longitude || 0,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Polyline
                    coordinates={item.route}
                    strokeColor="#FF0000"
                    strokeWidth={3}
                  />
                </MapView>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Brak tras użytkownika.</Text>}
      />

      {/* Treningi */}
      <Text style={styles.sectionHeader}>Treningi użytkownika</Text>
      <FlatList
        data={trainings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemDetail}>
              Dystans: {(item.distance / 1000).toFixed(2)} km
            </Text>
            <Text style={styles.itemDetail}>
              Czas trwania: {formatElapsedTime(item.elapsedTime)}
            </Text>
            <TouchableOpacity
              style={styles.showRouteButton}
              onPress={() => handleShowRoute(item.id)}
            >
              <Text style={styles.showRouteButtonText}>
                {selectedItemId === item.id ? "Ukryj trasę" : "Pokaż trasę"}
              </Text>
            </TouchableOpacity>
            {selectedItemId === item.id && item.route && item.route.length > 0 && (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: item.route[0]?.latitude || 0,
                    longitude: item.route[0]?.longitude || 0,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Polyline
                    coordinates={item.route}
                    strokeColor="#FF0000"
                    strokeWidth={3}
                  />
                </MapView>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Brak treningów użytkownika.</Text>}
      />
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
    textAlign: "center", 
    marginBottom: 16 
  },
  sectionHeader: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginVertical: 10 
  },
  itemContainer: { 
    backgroundColor: "#FFF", 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10 
  },
  itemTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 5 
  },
  itemDetail: { 
    fontSize: 16, 
    marginBottom: 5, 
    color: "#555" 
  },
  showRouteButton: {
    marginTop: 5,
    backgroundColor: "#9FFB88",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  showRouteButtonText: { 
    color: "#FFF", 
    fontWeight: "bold" 
  },
  mapContainer: { 
    marginTop: 10, 
    height: 200, 
    borderRadius: 8, 
    overflow: "hidden" 
  },
  map: { 
    flex: 1 
  },
  empty: { 
    textAlign: "center", 
    color: "#555", 
    fontSize: 16, 
    marginTop: 10 
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  errorText: { 
    fontSize: 18, 
    color: "red" 
  },
});

export default FriendProfileScreen;

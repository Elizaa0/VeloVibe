import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore"; 
import { getAuth } from "firebase/auth";
import { db } from "../../firebaseConfig";
import MapView, { Polyline } from "react-native-maps";

const HomeScreen = () => {
  const [friendTrainings, setFriendTrainings] = useState([]);
  const [selectedTrainingId, setSelectedTrainingId] = useState(null);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchFriendTrainings = async () => {
      try {
        if (!user) return;

        const friendsDocRef = doc(db, "friends", user.uid); 
        const friendsDoc = await getDoc(friendsDocRef);

        if (!friendsDoc.exists()) {
          console.log("Brak znajomych.");
          return;
        }

        const friendIds = friendsDoc.data()?.friendList || [];

        if (friendIds.length === 0) {
          console.log("Brak treningów znajomych.");
          return;
        }

        const trainingsQuery = query(
          collection(db, "trainings"),
          where("userId", "in", friendIds)
        );
        const snapshot = await getDocs(trainingsQuery);

        const fetchedTrainings = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const training = { id: docSnap.id, ...docSnap.data() };
            if (!training.userName) {
              const userDocRef = doc(db, "users", training.userId);
              const userDoc = await getDoc(userDocRef);
              training.userName = userDoc.exists() ? userDoc.data()?.name || "Nieznany" : "Nieznany";
            }
            return training;
          })
        );

        setFriendTrainings(fetchedTrainings);
      } catch (error) {
        console.error("Błąd pobierania treningów znajomych:", error.message);
      }
    };

    fetchFriendTrainings();
  }, [user]);

  const handleShowRoute = (trainingId) => {
    setSelectedTrainingId((prevId) => (prevId === trainingId ? null : trainingId));
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
      <Text style={styles.header}>Treningi Twoich Znajomych</Text>
      <FlatList
        data={friendTrainings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.trainingItem}>
            <Text style={styles.trainingInfo}>
              Użytkownik: {item.userName || "Nieznany"}
            </Text>
            <Text style={styles.trainingInfo}>
              Dystans: {(item.distance / 1000).toFixed(2)} km
            </Text>
            <Text style={styles.trainingInfo}>
              Czas: {formatElapsedTime(item.elapsedTime)}
            </Text>
            <Text style={styles.trainingInfo}>
              Data: {item.createdAt?.toDate().toLocaleString() || "Brak danych"}
            </Text>
            <TouchableOpacity
              style={styles.showRouteButton}
              onPress={() => handleShowRoute(item.id)}
            >
              <Text style={styles.showRouteButtonText}>
                {selectedTrainingId === item.id ? "Ukryj trasę" : "Pokaż trasę"}
              </Text>
            </TouchableOpacity>
            {selectedTrainingId === item.id && item.route && item.route.length > 0 && (
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
        ListEmptyComponent={<Text>Brak treningów znajomych.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8FF",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  trainingItem: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  trainingInfo: {
    fontSize: 16,
    marginBottom: 5,
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
    fontWeight: "bold",
  },
  mapContainer: {
    marginTop: 10,
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
});

export default HomeScreen;

import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";

const HomeScreen = () => {
  const [friendTrainings, setFriendTrainings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFriendTrainings = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error("Użytkownik niezalogowany.");
        return;
      }

      // Pobierz listę znajomych
      const friendsRef = doc(db, "friends", userId);
      const friendsDoc = await getDoc(friendsRef);

      if (!friendsDoc.exists() || !friendsDoc.data()?.friendList?.length) {
        console.log("Brak znajomych.");
        setFriendTrainings([]);
        setIsLoading(false);
        return;
      }

      const friendIds = friendsDoc.data().friendList;

      // Pobierz treningi znajomych
      const trainingsQuery = query(
        collection(db, "trainings"),
        where("userId", "in", friendIds)
      );
      const trainingsSnapshot = await getDocs(trainingsQuery);

      const fetchedTrainings = await Promise.all(
        trainingsSnapshot.docs.map(async (trainingDoc) => {
          const training = trainingDoc.data();
          const friendDoc = await getDoc(doc(db, "users", training.userId));

          return {
            ...training,
            friendName: friendDoc.exists() ? friendDoc.data()?.name : "Nieznajomy",
          };
        })
      );

      setFriendTrainings(fetchedTrainings);
      setIsLoading(false);
    } catch (error) {
      console.error("Błąd pobierania treningów znajomych:", error);
      setIsLoading(false);
    }
  };

  const formatElapsedTime = (elapsedTime) => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    fetchFriendTrainings();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Treningi znajomych</Text>
      {isLoading ? (
        <Text style={styles.loadingText}>Ładowanie...</Text>
      ) : friendTrainings.length > 0 ? (
        <FlatList
          data={friendTrainings}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.trainingItem}>
              <Text style={styles.name}>{item.friendName}</Text>
              <Text>Dystans: {(item.distance / 1000).toFixed(3)} km</Text>
              <Text>Czas: {formatElapsedTime(item.elapsedTime)}</Text>
              <Text>Data: {item.createdAt?.toDate().toLocaleString() || "Brak danych"}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noTrainings}>Brak treningów znajomych.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8FF",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  trainingItem: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingText: {
    textAlign: "center",
    color: "#555",
    fontSize: 16,
  },
  noTrainings: {
    textAlign: "center",
    color: "#555",
    fontSize: 16,
  },
});

export default HomeScreen;

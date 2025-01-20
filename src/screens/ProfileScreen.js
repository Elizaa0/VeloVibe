import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { getAuth, signOut } from "firebase/auth";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import MapView, { Polyline } from "react-native-maps";

const ProfileScreen = () => {
  const [userName, setUserName] = useState("");
  const [trainings, setTrainings] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedTrainingId, setSelectedTrainingId] = useState(null);
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!user || !user.uid) {
          throw new Error("Użytkownik niezalogowany.");
        }

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserName(userDoc.data()?.name || "Użytkownik");
        }

        const trainingsQuery = query(
          collection(db, "trainings"),
          where("userId", "==", user.uid)
        );
        const trainingsSnapshot = await getDocs(trainingsQuery);
        const fetchedTrainings = trainingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrainings(fetchedTrainings);

        const friendsDocRef = doc(db, "friends", user.uid);
        const friendsDoc = await getDoc(friendsDocRef);
        if (friendsDoc.exists()) {
          const friendIds = friendsDoc.data()?.friendList || [];
          const friendDetails = await Promise.all(
            friendIds.map(async (friendId) => {
              const friendDocRef = doc(db, "users", friendId);
              const friendDoc = await getDoc(friendDocRef);
              return {
                id: friendId,
                name: friendDoc.exists() ? friendDoc.data()?.name : "Nieznajomy",
              };
            })
          );
          setFriends(friendDetails);
        }
      } catch (error) {
        console.error("Błąd pobierania danych profilu:", error);
      }
    };

    fetchProfileData();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => Alert.alert("Wylogowano pomyślnie"))
      .catch((error) => console.error("Błąd podczas wylogowywania:", error));
  };

  const handleNavigateToAddFriend = () => {
    navigation.navigate("AddFriend");
  };

  const handleShowRoute = (trainingId) => {
    setSelectedTrainingId((prevId) => (prevId === trainingId ? null : trainingId));
  };

  const handleFriendPress = (friendId, name) => {
    navigation.navigate("FriendProfileScreen", { friendId, name });
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
      <Text style={styles.welcomeText}>Witaj, {userName}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Wyloguj się</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Twoje treningi:</Text>
      <FlatList
        data={trainings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.trainingItem}>
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
                    latitude: item.route[0]?.latitude,
                    longitude: item.route[0]?.longitude,
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
        ListEmptyComponent={<Text>Brak zapisanych treningów.</Text>}
      />

      <Text style={styles.sectionTitle}>Twoi znajomi:</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.friendItem}
            onPress={() => handleFriendPress(item.id, item.name)}
          >
            <Text style={styles.friendName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Brak znajomych.</Text>}
      />

      <TouchableOpacity
        style={styles.addFriendButton}
        onPress={handleNavigateToAddFriend}
      >
        <Text style={styles.addFriendButtonText}>Dodaj znajomego</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F8FF", padding: 20 },
  welcomeText: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#333" },
  logoutButton: {
    alignSelf: "flex-end",
    backgroundColor: "#FF5C5C",
    padding: 10,
    borderRadius: 8,
  },
  logoutButtonText: { color: "#FFF", fontWeight: "bold" },
  addFriendButton: {
    backgroundColor: "#9FFB88",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  addFriendButtonText: { color: "#333", fontWeight: "bold", fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  trainingItem: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  trainingInfo: { fontSize: 16 },
  showRouteButton: {
    marginTop: 5,
    backgroundColor: "#9FFB88",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  showRouteButtonText: { color: "#FFF", fontWeight: "bold" },
  mapContainer: {
    marginTop: 10,
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
  },
  map: { flex: 1 },
  friendItem: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  friendName: { fontSize: 16, fontWeight: "bold" },
});

export default ProfileScreen;

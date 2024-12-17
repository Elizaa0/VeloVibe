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

const ProfileScreen = () => {
  const [userName, setUserName] = useState("");
  const [trainings, setTrainings] = useState([]);
  const [friends, setFriends] = useState([]);
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!user || !user.uid) {
          throw new Error("Użytkownik niezalogowany.");
        }

        // Pobierz dane użytkownika
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserName(userDoc.data()?.name || "Użytkownik");
        }

        // Pobierz treningi użytkownika
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

        // Pobierz znajomych
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

  const navigateToAddFriend = () => {
    navigation.navigate("AddFriend");
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

      {/* Sekcja treningów */}
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
          </View>
        )}
        ListEmptyComponent={<Text>Brak zapisanych treningów.</Text>}
      />

      {/* Sekcja znajomych */}
      <Text style={styles.sectionTitle}>Twoi znajomi:</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Text style={styles.friendName}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Brak znajomych.</Text>}
      />
      <TouchableOpacity style={styles.addFriendButton} onPress={navigateToAddFriend}>
        <Text style={styles.addFriendButtonText}>Dodaj znajomego</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F0F8FF",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  logoutButton: {
    alignSelf: "flex-end",
    backgroundColor: "#FF5C5C",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#555",
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
  trainingInfo: {
    fontSize: 16,
    color: "#555",
  },
  friendItem: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  addFriendButton: {
    backgroundColor: "#9FFB88",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  addFriendButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default ProfileScreen;
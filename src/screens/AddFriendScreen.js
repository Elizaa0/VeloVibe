import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";

const AddFriendScreen = () => {
  const [friendEmail, setFriendEmail] = useState("");

  const addFriend = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert("Błąd", "Użytkownik niezalogowany.");
        return;
      }

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", friendEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Błąd", "Nie znaleziono użytkownika o podanym adresie e-mail.");
        return;
      }

      const friendDoc = querySnapshot.docs[0];
      const friendId = friendDoc.id;

      const userRef = doc(db, "friends", userId);
      await updateDoc(userRef, {
        friendList: arrayUnion(friendId),
      });

      Alert.alert("Sukces", "Znajomy został dodany!");
      setFriendEmail("");
    } catch (err) {
      console.error("Błąd podczas dodawania znajomego:", err);
      Alert.alert("Błąd", "Nie udało się dodać znajomego.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dodaj znajomego</Text>
      <TextInput
        style={styles.input}
        value={friendEmail}
        onChangeText={setFriendEmail}
        placeholder="E-mail znajomego"
        keyboardType="email-address"
        placeholderTextColor="#666"
      />
      <TouchableOpacity style={styles.button} onPress={addFriend}>
        <Text style={styles.buttonText}>Dodaj znajomego</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#F0F8FF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#9FFB88",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  button: {
    backgroundColor: "#9FFB88",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },
});

export default AddFriendScreen;

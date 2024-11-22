import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";

const AddRouteScreen = () => {
  const [routeName, setRouteName] = useState("");
  const [distance, setDistance] = useState("");

  const addRoute = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert("Błąd", "Użytkownik niezalogowany.");
        return;
      }

      await addDoc(collection(db, "routes"), {
        userId,
        name: routeName,
        distance: parseFloat(distance),
        createdAt: new Date(),
      });

      Alert.alert("Sukces", "Trasa została dodana!");
      setRouteName("");
      setDistance("");
    } catch (err) {
      console.error("Błąd dodawania trasy:", err);
      Alert.alert("Błąd", "Nie udało się dodać trasy.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dodaj trasę</Text>
      <TextInput
        style={styles.input}
        value={routeName}
        onChangeText={setRouteName}
        placeholder="Nazwa trasy"
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        value={distance}
        onChangeText={setDistance}
        placeholder="Dystans w metrach"
        keyboardType="numeric"
        placeholderTextColor="#666"
      />
      <TouchableOpacity style={styles.button} onPress={addRoute}>
        <Text style={styles.buttonText}>Dodaj trasę</Text>
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

export default AddRouteScreen;

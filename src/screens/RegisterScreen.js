import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const handleRegister = async () => {
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
      });

      Alert.alert("Sukces", "Rejestracja zakończona!");
      navigation.navigate("Login");
    } catch (err) {
      setError(err.message);
      console.error("Błąd rejestracji:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rejestracja</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        placeholder="Imię"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#666"
      />
      <TextInput
        placeholder="Adres email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#666"
      />
      <TextInput
        placeholder="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#666"
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Zarejestruj się</Text>
      </TouchableOpacity>
      <Text
        style={styles.link}
        onPress={() => navigation.navigate("Login")}
      >
        Masz już konto? Zaloguj się
      </Text>
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
  error: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
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
  link: {
    marginTop: 20,
    color: "blue",
    textAlign: "center",
  },
});

export default RegisterScreen;

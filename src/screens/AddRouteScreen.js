import React, { useState, useEffect } from "react";
import {View,Text,TouchableOpacity,StyleSheet,TextInput,ActivityIndicator,Alert,} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getAuth } from "firebase/auth";

const AddRouteScreen = ({ navigation }) => {
  const [routeName, setRouteName] = useState("");
  const [pointA, setPointA] = useState(null);
  const [pointB, setPointB] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialRegion, setInitialRegion] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Brak uprawnień do lokalizacji.");
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setInitialRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (error) {
        console.error("Błąd lokalizacji:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLocation();
  }, []);

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    if (!pointA) {
      setPointA({ latitude, longitude });
    } else if (!pointB) {
      setPointB({ latitude, longitude });
      setRouteCoordinates([pointA, { latitude, longitude }]);
      const distanceInKm = calculateDistance(pointA, { latitude, longitude });
      setDistance(distanceInKm.toFixed(2));
    } else {
      setPointA({ latitude, longitude });
      setPointB(null);
      setRouteCoordinates([]);
      setDistance(0);
    }
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371; 
    const dLat = (point2.latitude - point1.latitude) * (Math.PI / 180);
    const dLon = (point2.longitude - point1.longitude) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.latitude * (Math.PI / 180)) *
        Math.cos(point2.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSaveRoute = async () => {
    if (!routeName || !pointA || !pointB || routeCoordinates.length === 0) {
      Alert.alert("Błąd", "Wprowadź nazwę trasy i wybierz punkty A i B.");
      return;
    }

    const user = auth.currentUser;

    try {
      await addDoc(collection(db, "routes"), {
        name: routeName,
        distance: distance * 1000, 
        coordinates: routeCoordinates,
        createdAt: new Date(),
        userId: user ? user.uid : "anonymous", 
      });
      Alert.alert("Sukces", "Trasa została zapisana!");
      navigation.goBack();
    } catch (error) {
      console.error("Błąd zapisu trasy:", error.message);
      Alert.alert("Błąd", "Nie udało się zapisać trasy.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dodaj Nową Trasę</Text>

      {loading || !initialRegion ? (
        <ActivityIndicator size="large" color="#9FFB88" />
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nazwa trasy"
            value={routeName}
            onChangeText={setRouteName}
          />

          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            onPress={handleMapPress}
          >
            {pointA && <Marker coordinate={pointA} title="Punkt A" />}
            {pointB && <Marker coordinate={pointB} title="Punkt B" />}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#FF0000"
                strokeWidth={3}
              />
            )}
          </MapView>

          <Text style={styles.distanceText}>
            Dystans: {distance > 0 ? `${distance} km` : "Wybierz punkty A i B"}
          </Text>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveRoute}>
            <Text style={styles.saveButtonText}>Zapisz Trasę</Text>
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
    padding: 10 
  },
  header: { 
    fontSize: 24, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 10 
  },
  input: { 
    backgroundColor: "#FFF", 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 10 
  },
  map: { 
    flex: 1, 
    borderRadius: 10, 
    marginBottom: 10 
  },
  distanceText: { 
    fontSize: 18, 
    textAlign: "center", 
    marginVertical: 10 
  },
  saveButton: { 
    backgroundColor: "#9FFB88", 
    padding: 15, 
    borderRadius: 8, 
    alignItems: "center" 
  },
  saveButtonText: { 
    fontSize: 18, 
    color: "#333", 
    fontWeight: "bold" 
  },
});

export default AddRouteScreen;

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

const LiveTrainingScreen = () => {
  const [location, setLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => interval && clearInterval(interval);
  }, [isTracking]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Brak dostępu do lokalizacji");
        return;
      }

      const locationWatcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          setLocation({ latitude, longitude });

          if (isTracking) {
            if (route.length > 0) {
              const lastLocation = route[route.length - 1];
              const distanceBetween = getDistanceFromLatLonInKm(
                lastLocation.latitude,
                lastLocation.longitude,
                latitude,
                longitude
              );
              setDistance((prevDistance) => prevDistance + distanceBetween);
            }
            setRoute((prevRoute) => [...prevRoute, { latitude, longitude }]);
          }
        }
      );

      return () => locationWatcher.remove();
    };

    requestLocationPermission();
  }, [isTracking]);

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const deg2rad = (deg) => deg * (Math.PI / 180);

  const startTracking = () => {
    setIsTracking(true);
    setElapsedTime(0);
    setDistance(0);
    setRoute([]);
  };

  const stopTracking = async () => {
    setIsTracking(false);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error("Użytkownik niezalogowany.");
        return;
      }

      await addDoc(collection(db, "trainings"), {
        userId, 
        route,
        elapsedTime,
        distance,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Trening zapisany!");
    } catch (error) {
      console.error("Błąd podczas zapisywania treningu:", error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: location?.latitude || 37.78825,
          longitude: location?.longitude || -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
      >
        {route.length > 0 && (
          <Polyline coordinates={route} strokeColor="#FF0000" strokeWidth={3} />
        )}
      </MapView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={isTracking ? styles.stopButton : styles.startButton}
          onPress={isTracking ? stopTracking : startTracking}
        >
          <Text style={styles.buttonText}>{isTracking ? "Zatrzymaj" : "Start"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#9FFB88",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  stopButton: {
    backgroundColor: "#ff5c5c",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LiveTrainingScreen;
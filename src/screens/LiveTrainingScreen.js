import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const LiveTrainingScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval = null;

    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      const locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5, 
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          setLocation({ latitude, longitude });
          if (isTracking) {
            setRoute((prevRoute) => [...prevRoute, { latitude, longitude }]);
          }
        }
      );

      return () => {
        locationWatcher.remove();
      };
    };

    requestLocationPermission();
  }, [isTracking]);

  const startTracking = () => {
    setIsTracking(true);
    setElapsedTime(0);
    setRoute([]);
  };

  const stopTracking = async () => {
    setIsTracking(false);
    try {
      await addDoc(collection(db, 'trainings'), {
        route,
        elapsedTime,
        timestamp: new Date(),
      });
      alert('Trening zapisany!');
    } catch (error) {
      console.error('Błąd podczas zapisywania treningu: ', error);
    }
  };

  const formatElapsedTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.elapsedTime}>{formatElapsedTime(elapsedTime)}</Text>
      </View>
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
          <Text style={styles.buttonText}>
            {isTracking ? 'Zatrzymaj' : 'Start'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  elapsedTime: {
    fontSize: 18,
    color: '#333',
  },
  map: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#9FFB88',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  stopButton: {
    backgroundColor: '#9FFB88',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LiveTrainingScreen;

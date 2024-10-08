import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { db, auth } from '../../firebaseConfig'; 
import { useNavigation } from '@react-navigation/native';
import { collection, addDoc } from 'firebase/firestore';

export default function AddRouteScreen() {
  const [routeName, setRouteName] = useState('');
  const [markers, setMarkers] = useState([]);
  const navigation = useNavigation();

  const handleAddRoute = async () => {
    if (!routeName || markers.length < 2) {
      Alert.alert('Błąd', 'Proszę uzupełnić wszystkie pola i dodać co najmniej dwa punkty trasy');
      return;
    }

    try {
      // Obliczanie dystansu 
      let distance = 0;
      for (let i = 1; i < markers.length; i++) {
        const prev = markers[i - 1];
        const curr = markers[i];
        const dx = curr.latitude - prev.latitude;
        const dy = curr.longitude - prev.longitude;
        distance += Math.sqrt(dx * dx + dy * dy) * 111; 
      }

      await addDoc(collection(db, 'routes'), {
        name: routeName,
        distance: parseFloat(distance.toFixed(2)),
        markers,
      });
      Alert.alert('Sukces', 'Trasa została dodana');
      setRouteName('');
      setMarkers([]);
      navigation.navigate('Map', { newRoute: { name: routeName, distance: parseFloat(distance.toFixed(2)), markers } });
    } catch (error) {
      console.error('Błąd podczas dodawania trasy: ', error);
      Alert.alert('Błąd', 'Nie udało się dodać trasy');
    }
  };

  const handleMapPress = (event) => {
    const newMarker = event.nativeEvent.coordinate;
    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dodaj Trasę</Text>
      <TextInput
        style={styles.input}
        placeholder="Nazwa trasy"
        value={routeName}
        onChangeText={setRouteName}
      />
      <MapView
        style={styles.map}
        onPress={handleMapPress}
        initialRegion={{
          latitude: 50.866077,
          longitude: 20.628568,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {markers.map((marker, index) => (
          <Marker key={index} coordinate={marker} />
        ))}
        {markers.length > 1 && (
          <Polyline
            coordinates={markers}
            strokeColor="#000"
            strokeWidth={3}
          />
        )}
      </MapView>
      <Button title="Dodaj trasę" onPress={handleAddRoute} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#9FFB88',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  map: {
    height: 300,
    marginBottom: 20,
  },
});

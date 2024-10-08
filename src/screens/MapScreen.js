import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const MapScreen = () => {
  const [routes, setRoutes] = useState([
    {
      id: '1',
      name: 'Trasa wokół Zalewu Kieleckiego',
      distance: 15,
      latitude: 50.8753,
      longitude: 20.6232,
    },
    {
      id: '2',
      name: 'Trasa przez Górę Telegraf',
      distance: 10,
      latitude: 50.8454,
      longitude: 20.6486,
    },
    {
      id: '3',
      name: 'Trasa do Rezerwatu Kadzielnia',
      distance: 8,
      latitude: 50.8626,
      longitude: 20.6191,
    },
  ]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'routes'));
        const routesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoutes(prevRoutes => [...prevRoutes, ...routesList]);
      } catch (error) {
        console.error('Error fetching routes: ', error);
      }
    };

    fetchRoutes();
  }, []);

  const renderRouteItem = ({ item }) => (
    <TouchableOpacity style={styles.routeItem}>
      <Text style={styles.routeName}>{item.name}</Text>
      <Text style={styles.routeDistance}>Dystans: {item.distance} km</Text>
      <MapView
        style={styles.miniMap}
        initialRegion={{
          latitude: item.latitude,
          longitude: item.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker coordinate={{ latitude: item.latitude, longitude: item.longitude }} />
      </MapView>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lista tras rowerowych</Text>
      <FlatList
        data={routes}
        renderItem={renderRouteItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9FFB88', 
    padding: 10,
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    margin: 10,
  },
  routeItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  routeDistance: {
    fontSize: 16,
    color: '#555',
  },
  miniMap: {
    height: 100,
    marginTop: 10,
  },
});

export default MapScreen;
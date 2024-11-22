import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

const HistoryScreen = () => {
  const [trainings, setTrainings] = useState([]);

  const fetchUserTrainings = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const q = query(
        collection(db, 'trainings'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const trainingList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      setTrainings(trainingList);
    } catch (error) {
      console.error('Błąd podczas pobierania treningów:', error);
    }
  };

  useEffect(() => {
    fetchUserTrainings();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text>Data: {item.createdAt?.toLocaleString()}</Text>
      <Text>Czas: {item.elapsedTime || 0} sekundy</Text>
      <Text>Dystans: {item.distance?.toFixed(2) || 0} km</Text>
      {item.route && item.route.length > 0 && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: item.route[0].latitude,
            longitude: item.route[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Polyline coordinates={item.route} strokeColor="#FF0000" strokeWidth={3} />
        </MapView>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Twoja Historia Treningów</Text>
      <FlatList
        data={trainings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>Brak zapisanych treningów.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginVertical: 16 },
  item: { marginBottom: 16, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 16 },
  map: { height: 150, marginTop: 10, borderRadius: 8 },
});

export default HistoryScreen;

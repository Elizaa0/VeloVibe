import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../firebaseConfig';

export default function HistoryScreen() {
  const [trainings, setTrainings] = useState([]); 
  const hasFetchedTrainings = useRef(false); 

  // Listener stanu autoryzacji
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user && !hasFetchedTrainings.current) {
        fetchTrainings(); 
        hasFetchedTrainings.current = true; 
      } else if (!user) {
        setTrainings([]); 
        hasFetchedTrainings.current = false; 
      }
    });

    return () => unsubscribe(); 
  }, []);

  // Funkcja pobierająca treningi z Firestore
  const fetchTrainings = async () => {
    try {
      const q = query(collection(db, 'trainings'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const trainingList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrainings(trainingList); 
    } catch (error) {
      console.error('Błąd podczas pobierania treningów: ', error);
    }
  };

  // Funkcja renderująca każdy element listy treningów
  const renderItem = ({ item }) => (
    <View style={styles.trainingItem}>
      <Text style={styles.text}>Trening: {item.name}</Text>
      <Text style={styles.text}>Data: {item.createdAt?.toDate().toLocaleDateString()}</Text>
      <Text style={styles.text}>Czas: {item.time}s</Text>
      <Text style={styles.text}>Dystans: {item.distance} km</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historia Twoich Treningów</Text>
      {trainings.length > 0 ? (
        <FlatList
          data={trainings}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.text}>Brak zapisanych treningów</Text>
      )}
    </View>
  );
}

// Style
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#9FFB88',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  trainingItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    color: '#000',
  },
});

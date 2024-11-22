import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import { db } from '../../firebaseConfig';

export const fetchFriendsTrainings = async () => {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.warn("Brak zalogowanego użytkownika");
      return [];
    }

    const userDoc = await getDoc(doc(db, "friends", currentUser.uid));

    if (!userDoc.exists()) {
      console.warn("Dokument friends nie istnieje dla tego użytkownika");
      return [];
    }

    const friendList = userDoc.data()?.friendList;

    if (!Array.isArray(friendList) || friendList.length === 0) {
      console.warn("Brak znajomych do wyświetlenia treningów");
      return [];
    }

    const trainingsQuery = query(
      collection(db, "trainings"),
      where("uid", "in", friendList)
    );

    const querySnapshot = await getDocs(trainingsQuery);

    const friendsTrainings = [];
    querySnapshot.forEach((doc) => {
      friendsTrainings.push({ id: doc.id, ...doc.data() });
    });

    return friendsTrainings;
  } catch (error) {
    console.error("Błąd podczas pobierania treningów znajomych:", error);
    return [];
  }
};

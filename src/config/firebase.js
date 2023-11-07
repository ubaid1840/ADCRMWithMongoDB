import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence   } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6-ksPOA7Bei5gm4_mHTTLOmxZiM9WQ8M",
  authDomain: "adcrm-a0bf3.firebaseapp.com",
  projectId: "adcrm-a0bf3",
  storageBucket: "adcrm-a0bf3.appspot.com",
  messagingSenderId: "719101108135",
  appId: "1:719101108135:web:ece59bc56406ee6f7ca082"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default app
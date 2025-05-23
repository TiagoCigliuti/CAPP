import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDMpUwKTXoSG74FxR22BkMJZ-iertshKnY",
  authDomain: "staffpro-dc3c8.firebaseapp.com",
  projectId: "staffpro-dc3c8",
  storageBucket: "staffpro-dc3c8.firebasestorage.app",
  messagingSenderId: "1043709959129",
  appId: "1:1043709959129:web:744d5cbcf845e71c3ed7c8",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

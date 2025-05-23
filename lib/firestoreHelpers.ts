import { db } from "./firebase"
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore"

const jugadoresRef = collection(db, "jugadores")

export async function agregarJugador(jugador: any) {
  try {
    const docRef = await addDoc(jugadoresRef, jugador)
    return docRef
  } catch (error) {
    console.error("Error adding document: ", error)
    throw error
  }
}

export async function obtenerJugadores() {
  try {
    const snapshot = await getDocs(jugadoresRef)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error getting documents: ", error)
    throw error
  }
}

export async function obtenerJugador(id: string) {
  try {
    const docRef = doc(db, "jugadores", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting document: ", error)
    throw error
  }
}

export async function actualizarJugador(id: string, datos: any) {
  try {
    const docRef = doc(db, "jugadores", id)
    await updateDoc(docRef, datos)
  } catch (error) {
    console.error("Error updating document: ", error)
    throw error
  }
}

export async function eliminarJugador(id: string) {
  try {
    await deleteDoc(doc(db, "jugadores", id))
  } catch (error) {
    console.error("Error deleting document: ", error)
    throw error
  }
}

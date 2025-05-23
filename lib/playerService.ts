import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, orderBy } from "firebase/firestore"
import { db } from "./firebase"

export interface Player {
  id?: string
  nombre: string
  apellido: string
  fechaNacimiento: string
  posicion: string
  foto?: string // This will store base64 encoded images for now
  createdAt?: Date
}

const COLLECTION_NAME = "jugadores"

export class PlayerService {
  // Add a new player
  static async addPlayer(player: Omit<Player, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...player,
        createdAt: new Date(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding player:", error)
      throw error
    }
  }

  // Get all players
  static async getAllPlayers(): Promise<Player[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("apellido"))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Player,
      )
    } catch (error) {
      console.error("Error getting players:", error)
      throw error
    }
  }

  // Get a single player
  static async getPlayer(id: string): Promise<Player | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Player
      } else {
        return null
      }
    } catch (error) {
      console.error("Error getting player:", error)
      throw error
    }
  }

  // Update a player
  static async updatePlayer(id: string, updates: Partial<Player>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, updates)
    } catch (error) {
      console.error("Error updating player:", error)
      throw error
    }
  }

  // Delete a player
  static async deletePlayer(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error("Error deleting player:", error)
      throw error
    }
  }
}

import { db } from "./firebase"
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, updateDoc, query, where } from "firebase/firestore"

// Colecciones
const jugadoresRef = collection(db, "jugadores")
const clientsRef = collection(db, "clients")
const usersRef = collection(db, "users")

// === JUGADORES ===
export async function agregarJugador(jugador: any, clientId?: string) {
  try {
    const jugadorData = {
      ...jugador,
      clientId: clientId || null, // Asignar cliente si se proporciona
      createdAt: new Date(),
    }
    const docRef = await addDoc(jugadoresRef, jugadorData)
    return docRef
  } catch (error) {
    console.error("Error adding document: ", error)
    throw error
  }
}

export async function obtenerJugadores(clientId?: string) {
  try {
    let q
    if (clientId) {
      // Obtener jugadores de un cliente específico
      q = query(jugadoresRef, where("clientId", "==", clientId))
    } else {
      // Obtener todos los jugadores
      q = jugadoresRef
    }

    const snapshot = await getDocs(q)
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

// === FUNCIÓN PARA LIMPIAR JUGADORES DE UN CLIENTE ===
export async function eliminarTodosLosJugadoresDeCliente(clientId: string) {
  try {
    const q = query(jugadoresRef, where("clientId", "==", clientId))
    const snapshot = await getDocs(q)

    const deletePromises = snapshot.docs.map(async (jugadorDoc) => {
      await deleteDoc(doc(db, "jugadores", jugadorDoc.id))
    })

    await Promise.all(deletePromises)
    console.log(`Eliminados ${snapshot.docs.length} jugadores del cliente ${clientId}`)
  } catch (error) {
    console.error("Error eliminando jugadores del cliente: ", error)
    throw error
  }
}

// === CLIENTES ===
export async function agregarCliente(cliente: any) {
  try {
    // Filter out undefined values
    const cleanedCliente = Object.fromEntries(Object.entries(cliente).filter(([_, value]) => value !== undefined))

    const docRef = await addDoc(clientsRef, {
      ...cleanedCliente,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return { id: docRef.id, ...cliente }
  } catch (error) {
    console.error("Error adding client: ", error)
    throw error
  }
}

export async function obtenerClientes() {
  try {
    const snapshot = await getDocs(clientsRef)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error getting clients: ", error)
    throw error
  }
}

export async function obtenerCliente(id: string) {
  try {
    const docRef = doc(db, "clients", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting client: ", error)
    throw error
  }
}

export async function obtenerClientePorNombre(nombre: string) {
  try {
    const q = query(clientsRef, where("name", "==", nombre))
    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() }
    }
    return null
  } catch (error) {
    console.error("Error getting client by name: ", error)
    throw error
  }
}

export async function actualizarCliente(id: string, datos: any) {
  try {
    // Filter out undefined values
    const cleanedDatos = Object.fromEntries(Object.entries(datos).filter(([_, value]) => value !== undefined))

    const docRef = doc(db, "clients", id)
    await updateDoc(docRef, {
      ...cleanedDatos,
      updatedAt: new Date(),
    })
    return { id, ...datos }
  } catch (error) {
    console.error("Error updating client: ", error)
    throw error
  }
}

export async function eliminarCliente(id: string) {
  try {
    // Primero eliminar todos los jugadores del cliente
    await eliminarTodosLosJugadoresDeCliente(id)

    // Luego eliminar todos los usuarios del cliente
    await eliminarTodosLosUsuariosDeCliente(id)

    // Finalmente eliminar el cliente
    await deleteDoc(doc(db, "clients", id))

    console.log(`Cliente ${id} eliminado junto con todos sus datos asociados`)
  } catch (error) {
    console.error("Error deleting client: ", error)
    throw error
  }
}

// === USUARIOS ===
export async function agregarUsuario(usuario: any) {
  try {
    // Filter out undefined values
    const cleanedUsuario = Object.fromEntries(Object.entries(usuario).filter(([_, value]) => value !== undefined))

    const docRef = await addDoc(usersRef, {
      ...cleanedUsuario,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return { id: docRef.id, ...usuario }
  } catch (error) {
    console.error("Error adding user: ", error)
    throw error
  }
}

export async function obtenerUsuarios() {
  try {
    const snapshot = await getDocs(usersRef)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error getting users: ", error)
    throw error
  }
}

export async function obtenerUsuario(id: string) {
  try {
    const docRef = doc(db, "users", id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting user: ", error)
    throw error
  }
}

export async function obtenerUsuarioPorCredenciales(username: string, password: string) {
  try {
    const q = query(usersRef, where("username", "==", username), where("password", "==", password))
    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() }
    }
    return null
  } catch (error) {
    console.error("Error getting user by credentials: ", error)
    throw error
  }
}

export async function actualizarUsuario(id: string, datos: any) {
  try {
    // Filter out undefined values
    const cleanedDatos = Object.fromEntries(Object.entries(datos).filter(([_, value]) => value !== undefined))

    const docRef = doc(db, "users", id)
    await updateDoc(docRef, {
      ...cleanedDatos,
      updatedAt: new Date(),
    })
    return { id, ...datos }
  } catch (error) {
    console.error("Error updating user: ", error)
    throw error
  }
}

export async function eliminarUsuario(id: string) {
  try {
    await deleteDoc(doc(db, "users", id))
  } catch (error) {
    console.error("Error deleting user: ", error)
    throw error
  }
}

export async function desactivarUsuariosDeCliente(clientId: string) {
  try {
    const q = query(usersRef, where("clientId", "==", clientId))
    const snapshot = await getDocs(q)

    const updatePromises = snapshot.docs.map(async (userDoc) => {
      const docRef = doc(db, "users", userDoc.id)
      await updateDoc(docRef, {
        status: "inactive",
        updatedAt: new Date(),
      })
    })

    await Promise.all(updatePromises)
  } catch (error) {
    console.error("Error deactivating client users: ", error)
    throw error
  }
}

// === FUNCIÓN PARA ELIMINAR TODOS LOS USUARIOS DE UN CLIENTE ===
export async function eliminarTodosLosUsuariosDeCliente(clientId: string) {
  try {
    const q = query(usersRef, where("clientId", "==", clientId))
    const snapshot = await getDocs(q)

    const deletePromises = snapshot.docs.map(async (userDoc) => {
      await deleteDoc(doc(db, "users", userDoc.id))
    })

    await Promise.all(deletePromises)
    console.log(`Eliminados ${snapshot.docs.length} usuarios del cliente ${clientId}`)
  } catch (error) {
    console.error("Error eliminando usuarios del cliente: ", error)
    throw error
  }
}

// === LIMPIEZA Y MIGRACIÓN ===
export async function limpiarJugadoresAleatorios() {
  try {
    // Buscar cliente germanmenendez
    const clienteGerman = await obtenerClientePorNombre("germanmenendez")

    if (clienteGerman) {
      // Eliminar todos los jugadores del cliente germanmenendez
      await eliminarTodosLosJugadoresDeCliente(clienteGerman.id)
      console.log("Jugadores aleatorios eliminados del cliente germanmenendez")
    }

    // Limpiar localStorage de jugadores genéricos
    if (typeof localStorage !== "undefined") {
      // Limpiar datos de wellness y RPE de jugadores genéricos
      for (let i = 1; i <= 20; i++) {
        localStorage.removeItem(`wellness-jugador-${i}`)
        localStorage.removeItem(`rpe-jugador-${i}`)
        localStorage.removeItem(`wellness-ejemplo${i}`)
        localStorage.removeItem(`rpe-ejemplo${i}`)
      }
      console.log("localStorage limpiado de jugadores genéricos")
    }
  } catch (error) {
    console.error("Error en limpieza: ", error)
  }
}

// === INICIALIZACIÓN DE DATOS ===
export async function inicializarDatosIniciales() {
  try {
    // Verificar si ya existen datos
    const clientsSnapshot = await getDocs(clientsRef)
    const usersSnapshot = await getDocs(usersRef)

    if (clientsSnapshot.empty) {
      // Crear cliente ejemplo
      await agregarCliente({
        name: "Cliente Ejemplo",
        theme: "default",
        status: "active",
        enabledModules: ["jugadores", "calendario", "carga_interna"],
      })

      // Crear cliente germanmenendez
      await agregarCliente({
        name: "germanmenendez",
        theme: "default",
        status: "active",
        enabledModules: ["jugadores", "calendario", "carga_interna"],
      })

      console.log("Clientes iniciales creados")
    }

    if (usersSnapshot.empty) {
      // Crear usuarios administradores iniciales
      await agregarUsuario({
        username: "Admin1",
        password: "1891",
        role: "admin",
        status: "active",
      })

      await agregarUsuario({
        username: "Admin2",
        password: "2025",
        role: "admin",
        status: "active",
      })

      // Obtener clientes para crear usuarios
      const clients = await obtenerClientes()
      const clienteEjemplo = clients.find((c) => c.name === "Cliente Ejemplo")
      const clienteGerman = clients.find((c) => c.name === "germanmenendez")

      if (clienteEjemplo) {
        await agregarUsuario({
          username: "usuario_ejemplo",
          password: "ejemplo123",
          role: "client_user",
          clientId: clienteEjemplo.id,
          status: "active",
        })
      }

      if (clienteGerman) {
        await agregarUsuario({
          username: "germanmenendez",
          password: "german123",
          role: "client_user",
          clientId: clienteGerman.id,
          status: "active",
        })
      }

      console.log("Usuarios iniciales creados")
    }

    // Ejecutar limpieza de jugadores aleatorios
    await limpiarJugadoresAleatorios()
  } catch (error) {
    console.error("Error initializing data: ", error)
  }
}

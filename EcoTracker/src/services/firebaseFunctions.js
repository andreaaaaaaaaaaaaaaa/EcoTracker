import { db } from "../firebaseConfig";
import { collection, addDoc, updateDoc, getDoc, query, where, getDocs, doc, arrayRemove, arrayUnion, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

// Registrar sitio (sin cambios)
export const registrarSitio = async (sitio) => {
    console.log(sitio)
    try {
        const docRef = await addDoc(collection(db, "sitios"), sitio);
        console.log("Sitio registrado con ID", docRef.id);
    } catch (error) {
        console.error("Error al registrar sitio: ", error);
    }
};

// NUEVO: Registrar usuario con Firebase Auth + Firestore
export const registrarUsuario = async (email, password, nombre, usuario) => {
    try {
        // 1. Crear usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // 2. Crear documento en Firestore con el mismo UID
        await setDoc(doc(db, "usuarios", user.uid), {
            nombre: nombre,
            usuario: usuario,
            email: email,
            savedSites: [],
            createdAt: new Date().toISOString()
        });
        
        console.log("Usuario registrado con ID:", user.uid);
        return { success: true, uid: user.uid };
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        return { success: false, error: error.message };
    }
};

// NUEVO: Iniciar sesión con Firebase Auth
export const iniciarSesion = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Usuario autenticado:", user.email);
        return { success: true, uid: user.uid, user: user };
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        return { success: false, error: error.message };
    }
};

// ACTUALIZADO: Verificar credenciales (DEPRECADO - usar iniciarSesion en su lugar)
// Mantener solo si necesitas compatibilidad con código antiguo
export const verificarCredenciales = async (usuario, contrasena) => {
    console.warn("verificarCredenciales está deprecado. Usa iniciarSesion con email y password.");
    try {
        const usuariosRef = collection(db, "usuarios");
        const q = query(usuariosRef, where("usuario", "==", usuario), where("contrasena", "==", contrasena));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const usuarioDoc = querySnapshot.docs[0];
            const usuarioData = { id: usuarioDoc.id, ...usuarioDoc.data() };
            console.log("Usuario autenticado:", usuarioData);
            return usuarioData;
        } else {
            console.log("Credenciales incorrectas");
            return null;
        }
    } catch (error) {
        console.error("Error al verificar credenciales:", error);
        return null;
    }
};

// Obtener usuario desde Firestore usando el UID de Auth
export const obtenerUsuario = async (usuarioId) => {
    try {
        const usuarioRef = doc(db, "usuarios", usuarioId);
        const usuarioSnap = await getDoc(usuarioRef);

        if (usuarioSnap.exists()) {
            console.log("Datos del usuario:", usuarioSnap.data());
            return usuarioSnap.data();
        } else {
            console.log("No se encontró el usuario en Firestore");
            return null;
        }
    } catch (error) {
        console.error("Error al obtener usuario:", error);
        return null;
    }
};

// Obtener sitios (sin cambios)
export async function obtenerSitios() {
    const sitiosCol = collection(db, "sites");
    const sitiosSnapshot = await getDocs(sitiosCol);
    return sitiosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ACTUALIZADO: Obtener favoritos - ahora retorna solo los IDs
export const obtenerFavoritos = async (usuarioId) => {
    try {
        const usuarioRef = doc(db, "usuarios", usuarioId);
        const usuarioSnap = await getDoc(usuarioRef);
        
        if (usuarioSnap.exists()) {
            const savedSites = usuarioSnap.data().savedSites || [];
            // Extraer solo los IDs de los sitios guardados
            return savedSites.map(site => site.id);
        }
        return [];
    } catch (error) {
        console.error("Error al obtener favoritos:", error);
        return [];
    }
};

// Agregar sitio a favoritos
export const agregarSitio = async (usuarioId, sitioObj) => {
    try {
        const usuarioRef = doc(db, "usuarios", usuarioId);
        await updateDoc(usuarioRef, {
            savedSites: arrayUnion(sitioObj)
        });
        console.log("Sitio agregado a favoritos");
    } catch (error) {
        console.error("Error al agregar sitio:", error);
        throw error;
    }
};

// Quitar sitio de favoritos
export const quitarSitio = async (usuarioId, sitioObj) => {
    try {
        const usuarioRef = doc(db, "usuarios", usuarioId);
        await updateDoc(usuarioRef, {
            savedSites: arrayRemove(sitioObj)
        });
        console.log("Sitio quitado de favoritos");
    } catch (error) {
        console.error("Error al quitar sitio:", error);
        throw error;
    }
};

// NUEVA: Cerrar sesión
export const cerrarSesion = async () => {
    try {
        await auth.signOut();
        console.log("Sesión cerrada");
        return { success: true };
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        return { success: false, error: error.message };
    }
};
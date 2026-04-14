declare module '../services/firebaseFunctions' {
  export const registrarSitio: (sitio: any) => Promise<void>;
  export const registrarUsuario: (email: string, password: string, nombre: string, usuario: string) => Promise<any>;
  export const iniciarSesion: (email: string, password: string) => Promise<any>;
  export const verificarCredenciales: (usuario: string, contrasena: string) => Promise<any>;
  export const obtenerUsuario: (usuarioId: string) => Promise<any>;
  export function obtenerSitios(): Promise<any[]>;
  export const obtenerFavoritos: (usuarioId: string) => Promise<string[]>;
  export const agregarSitio: (usuarioId: string, sitioObj: any) => Promise<void>;
  export const quitarSitio: (usuarioId: string, sitioObj: any) => Promise<void>;
  export const cerrarSesion: () => Promise<any>;
}

declare module '../services/firebaseFunctions.js' {
  export const registrarSitio: (sitio: any) => Promise<void>;
  export const registrarUsuario: (email: string, password: string, nombre: string, usuario: string) => Promise<any>;
  export const iniciarSesion: (email: string, password: string) => Promise<any>;
  export const verificarCredenciales: (usuario: string, contrasena: string) => Promise<any>;
  export const obtenerUsuario: (usuarioId: string) => Promise<any>;
  export function obtenerSitios(): Promise<any[]>;
  export const obtenerFavoritos: (usuarioId: string) => Promise<string[]>;
  export const agregarSitio: (usuarioId: string, sitioObj: any) => Promise<void>;
  export const quitarSitio: (usuarioId: string, sitioObj: any) => Promise<void>;
  export const cerrarSesion: () => Promise<any>;
}

declare module '../firebaseConfig' {
  import { Firestore } from 'firebase/firestore';
  import { Auth } from 'firebase/auth';
  export const db: Firestore;
  export const auth: Auth;
}

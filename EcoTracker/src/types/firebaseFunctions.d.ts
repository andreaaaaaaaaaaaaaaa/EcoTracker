declare module "../services/firebaseFunctions" {
  export function registrarSitio(site: any): Promise<any>;
  export function obtenerSitios(): Promise<any[]>;
  export function agregarSitio(userId: string, site: any): Promise<void>;
  export function obtenerFavoritos(userId: string): Promise<string[]>;
  export function quitarSitio(userId: string, site: any): Promise<void>;
  export function signInWithEmail(email: string, password: string): Promise<any>;
  export function signUpWithEmail(email: string, password: string): Promise<any>;
}
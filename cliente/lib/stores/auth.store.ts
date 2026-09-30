import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Usuario } from "@/lib/types/cuentas";

type EstadoAutenticacion = {
  token: string | null;
  usuario: Usuario | null;
  /** Indica que Zustand ya rehidrató el store desde localStorage. */
  hidratado: boolean;
  iniciarSesion: (token: string, usuario: Usuario) => void;
  actualizarUsuario: (usuario: Usuario) => void;
  cerrarSesion: () => void;
  marcarHidrataado: () => void;
};

export const useAuthStore = create<EstadoAutenticacion>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      hidratado: false,
      iniciarSesion: (token, usuario) => set({ token, usuario, hidratado: true }),
      actualizarUsuario: (usuario) => set({ usuario }),
      cerrarSesion: () => set({ token: null, usuario: null }),
      marcarHidrataado: () => set({ hidratado: true }),
    }),
    {
      name: "tienda-cuentas",
      partialize: (estado) => ({ token: estado.token, usuario: estado.usuario }),
      onRehydrateStorage: () => (estado) => estado?.marcarHidrataado(),
    },
  ),
);

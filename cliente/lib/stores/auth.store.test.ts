import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/lib/stores/auth.store";
import { loginSchema, registroSchema, restablecerContrasenaSchema } from "@/lib/validations/auth.schema";
import { actualizarPerfilSchema } from "@/lib/validations/usuario.schema";

const USUARIO = { id: 1, nombre: "Ana Pérez", email: "ana@tienda.com" };

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, usuario: null, hidratado: true });
  });

  it("inicia sesión guardando token y usuario", () => {
    useAuthStore.getState().iniciarSesion("token-abc", USUARIO);

    const estado = useAuthStore.getState();
    expect(estado.token).toBe("token-abc");
    expect(estado.usuario).toEqual(USUARIO);
  });

  it("actualiza el usuario conservando el token", () => {
    useAuthStore.getState().iniciarSesion("token-abc", USUARIO);

    useAuthStore.getState().actualizarUsuario({ id: 1, nombre: "Ana María", email: "nuevo@tienda.com" });

    const estado = useAuthStore.getState();
    expect(estado.token).toBe("token-abc");
    expect(estado.usuario?.nombre).toBe("Ana María");
  });

  it("cierra la sesión eliminando token y usuario", () => {
    useAuthStore.getState().iniciarSesion("token-abc", USUARIO);

    useAuthStore.getState().cerrarSesion();

    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().usuario).toBeNull();
  });
});

describe("Esquemas de validación", () => {
  it("login exige correo válido y contraseña", () => {
    expect(loginSchema.safeParse({ email: "correo-invalido", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "ana@tienda.com", password: "ClaveSegura1" }).success).toBe(
      true,
    );
  });

  it("registro exige contraseña de al menos 8 caracteres", () => {
    const resultado = registroSchema.safeParse({
      nombre: "Ana",
      email: "ana@tienda.com",
      password: "corta",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toContain("8 caracteres");
    }
  });

  it("restablecer exige que ambas contraseñas coincidan", () => {
    const resultado = restablecerContrasenaSchema.safeParse({
      password: "NuevaClave2",
      confirmacion: "OtraClave3",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues[0].message).toBe("Las contraseñas no coinciden");
    }
  });

  it("perfil acepta contraseña vacía pero rechaza una corta", () => {
    const base = { nombre: "Ana María", email: "ana@tienda.com" };

    expect(actualizarPerfilSchema.safeParse({ ...base, password: "" }).success).toBe(true);
    expect(actualizarPerfilSchema.safeParse({ ...base, password: "123" }).success).toBe(false);
  });
});

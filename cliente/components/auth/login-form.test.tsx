import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/auth/login-form";
import { useAuthStore } from "@/lib/stores/auth.store";
import { renderConProveedores } from "@/tests/render-con-proveedor";

const { push, toastSuccess, toastError, iniciarSesion } = vi.hoisted(() => ({
  push: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  iniciarSesion: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: toastError } }));
vi.mock("@/lib/services/auth.service", () => ({
  iniciarSesion: (dto: unknown) => iniciarSesion(dto),
}));

describe("LoginForm (CU-02)", () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, usuario: null, hidratado: true });
  });

  it("muestra los campos y los enlaces de acceso", () => {
    renderConProveedores(<LoginForm />);

    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "¿Olvidaste tu contraseña?" })).toHaveAttribute(
      "href",
      "/recuperar-contrasena",
    );
    expect(screen.getByRole("link", { name: "Regístrate" })).toHaveAttribute("href", "/registro");
  });

  it("muestra los mensajes de validación y no llama a la API", async () => {
    const usuario = userEvent.setup();
    renderConProveedores(<LoginForm />);

    await usuario.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText("El correo electrónico no tiene un formato válido"),
    ).toBeInTheDocument();
    expect(screen.getByText("La contraseña es obligatoria")).toBeInTheDocument();
    expect(iniciarSesion).not.toHaveBeenCalled();
  });

  it("inicia sesión, guarda la sesión en el store y redirige al panel", async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockResolvedValue({
      access_token: "token-abc",
      token_type: "Bearer",
      expires_in: 3600,
      user: { id: 1, nombre: "Ana Pérez", email: "ana@tienda.com" },
    });
    renderConProveedores(<LoginForm />);

    await usuario.type(screen.getByLabelText("Correo electrónico"), "ana@tienda.com");
    await usuario.type(screen.getByLabelText("Contraseña"), "ClaveSegura1");
    await usuario.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(iniciarSesion).toHaveBeenCalledTimes(1));
    expect(iniciarSesion).toHaveBeenCalledWith({
      email: "ana@tienda.com",
      password: "ClaveSegura1",
    });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
    await waitFor(() => expect(useAuthStore.getState().token).toBe("token-abc"));
    expect(useAuthStore.getState().usuario?.email).toBe("ana@tienda.com");
  });

  it("muestra el mensaje de error devuelto por la API sin cambiar de pantalla", async () => {
    const usuario = userEvent.setup();
    iniciarSesion.mockRejectedValue(new Error("Usuario o contraseña incorrectos"));
    renderConProveedores(<LoginForm />);

    await usuario.type(screen.getByLabelText("Correo electrónico"), "ana@tienda.com");
    await usuario.type(screen.getByLabelText("Contraseña"), "ClaveSegura1");
    await usuario.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Usuario o contraseña incorrectos"));
    expect(push).not.toHaveBeenCalled();
    expect(useAuthStore.getState().token).toBeNull();
  });
});

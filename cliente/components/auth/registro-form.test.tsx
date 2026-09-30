import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RegistroForm } from "@/components/auth/registro-form";
import { renderConProveedores } from "@/tests/render-con-proveedor";

const { push, toastSuccess, toastError, registrar } = vi.hoisted(() => ({
  push: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  registrar: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: toastSuccess, error: toastError } }));
vi.mock("@/lib/services/auth.service", () => ({
  registrar: (dto: unknown) => registrar(dto),
}));

const completarFormulario = async (usuario: ReturnType<typeof userEvent.setup>) => {
  await usuario.type(screen.getByLabelText("Nombre completo"), "Ana Pérez");
  await usuario.type(screen.getByLabelText("Correo electrónico"), "ana@tienda.com");
  await usuario.type(screen.getByLabelText("Contraseña"), "ClaveSegura1");
  await usuario.click(screen.getByRole("button", { name: "Registrarme" }));
};

describe("RegistroForm (CU-01)", () => {
  it("muestra el formulario con la política de contraseña", () => {
    renderConProveedores(<RegistroForm />);

    expect(screen.getByLabelText("Nombre completo")).toBeInTheDocument();
    expect(screen.getByText("Debe tener al menos 8 caracteres.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicia sesión" })).toHaveAttribute("href", "/login");
  });

  it("exige correo válido, nombre y contraseña de 8 caracteres", async () => {
    const usuario = userEvent.setup();
    renderConProveedores(<RegistroForm />);

    await usuario.type(screen.getByLabelText("Nombre completo"), "A");
    await usuario.type(screen.getByLabelText("Correo electrónico"), "correo-invalido");
    await usuario.type(screen.getByLabelText("Contraseña"), "123");
    await usuario.click(screen.getByRole("button", { name: "Registrarme" }));

    expect(await screen.findByText("El nombre debe tener al menos 2 caracteres")).toBeInTheDocument();
    expect(
      screen.getByText("El correo electrónico no tiene un formato válido"),
    ).toBeInTheDocument();
    expect(screen.getByText("La contraseña debe tener al menos 8 caracteres")).toBeInTheDocument();
    expect(registrar).not.toHaveBeenCalled();
  });

  it("registra la cuenta y redirige al inicio de sesión", async () => {
    const usuario = userEvent.setup();
    registrar.mockResolvedValue({ mensaje: "Cuenta registrada" });
    renderConProveedores(<RegistroForm />);

    await completarFormulario(usuario);

    await waitFor(() => expect(registrar).toHaveBeenCalledTimes(1));
    expect(registrar).toHaveBeenCalledWith({
      nombre: "Ana Pérez",
      email: "ana@tienda.com",
      password: "ClaveSegura1",
    });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/login"));
    expect(toastSuccess).toHaveBeenCalledWith("Cuenta registrada correctamente");
  });

  it("informa el conflicto cuando el correo ya está registrado (E1)", async () => {
    const usuario = userEvent.setup();
    registrar.mockRejectedValue(new Error("El correo electrónico ya se encuentra registrado"));
    renderConProveedores(<RegistroForm />);

    await completarFormulario(usuario);

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith("El correo electrónico ya se encuentra registrado"),
    );
    expect(push).not.toHaveBeenCalled();
  });
});

import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import { BcryptHashService, HashServiceInterface } from "./hash.service.js";
import { JsonWebTokenService, PURPOSE_PASSWORD_RESET } from "./jwt.service.js";
import { JwtServiceInterface } from "./jwt.service.js";
import { MailServiceInterface, NodemailerMailService } from "./mail.service.js";

describe("BcryptHashService", () => {
  const servicio = new BcryptHashService(4);

  it("genera un hash que no coincide con la contraseña en texto plano", async () => {
    const hash = await servicio.hash("ClaveSegura1");

    expect(hash).not.toBe("ClaveSegura1");
    expect(await servicio.compare("ClaveSegura1", hash)).toBe(true);
  });

  it("genera hashes distintos para la misma contraseña", async () => {
    const [uno, otro] = await Promise.all([
      servicio.hash("ClaveSegura1"),
      servicio.hash("ClaveSegura1"),
    ]);

    expect(uno).not.toBe(otro);
  });

  it("devuelve false cuando la contraseña no coincide", async () => {
    const hash = await servicio.hash("ClaveSegura1");

    expect(await servicio.compare("OtraClave9", hash)).toBe(false);
  });

  it("devuelve false cuando no hay hash almacenado", async () => {
    expect(await servicio.compare("ClaveSegura1", null)).toBe(false);
  });
});

describe("JsonWebTokenService", () => {
  const servicio = new JsonWebTokenService({
    secret: "secreto",
    recoverySecret: "secreto-recuperacion",
    expiresIn: "1h",
  });

  it("firma y verifica el token de sesión", async () => {
    const token = await servicio.firmarSesion({ userId: 5, email: "ana@tienda.com" });

    expect(servicio.verificarSesion(token)).toEqual({ userId: 5, email: "ana@tienda.com" });
  });

  it("rechaza un token de sesión firmado con otra clave", () => {
    const tokenAjeno = jwt.sign({ sub: "5", email: "ana@tienda.com" }, "otra-clave", {
      expiresIn: "1h",
    });

    expect(() => servicio.verificarSesion(tokenAjeno)).toThrow();
  });

  it("firma el token de recuperación con el propósito esperado", async () => {
    const token = await servicio.firmarTokenRecuperacion({ userId: 5 }, 30);

    expect(servicio.verificarTokenRecuperacion(token)).toEqual({
      userId: 5,
      purpose: PURPOSE_PASSWORD_RESET,
    });
  });

  it("rechaza un token sin el propósito de recuperación", () => {
    const tokenSesion = jwt.sign({ sub: "5" }, "secreto-recuperacion", { expiresIn: "1h" });

    expect(() => servicio.verificarTokenRecuperacion(tokenSesion)).toThrow(
      "Propósito de token inválido",
    );
  });
});

describe("NodemailerMailService", () => {
  it("envía el correo de recuperación con el enlace y el remitente configurado", async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: "1" });
    const servicio = new NodemailerMailService({
      host: "smtp.test",
      port: 587,
      secure: false,
      user: "user",
      pass: "pass",
      from: "no-reply@tienda.local",
      transport: { sendMail },
    });

    await servicio.enviarRecuperacionContrasena({
      email: "ana@tienda.com",
      nombre: "Ana",
      enlace: "http://localhost:3000/restablecer-contrasena?token=abc",
    });

    expect(sendMail).toHaveBeenCalledTimes(1);
    const [opciones] = sendMail.mock.calls[0];
    expect(opciones.from).toBe("no-reply@tienda.local");
    expect(opciones.to).toBe("ana@tienda.com");
    expect(opciones.subject).toBe("Recuperación de contraseña");
    expect(opciones.text).toContain("http://localhost:3000/restablecer-contrasena?token=abc");
    expect(opciones.html).toContain("Restablecer contraseña");
  });

  it("propaga el error cuando el transporte falla", async () => {
    const servicio = new NodemailerMailService({
      from: "no-reply@tienda.local",
      transport: { sendMail: vi.fn().mockRejectedValue(new Error("SMTP no disponible")) },
    });

    await expect(
      servicio.enviarRecuperacionContrasena({ email: "a@b.com", nombre: "A", enlace: "x" }),
    ).rejects.toThrow("SMTP no disponible");
  });
});

describe("Interfaces sin implementación concreta", () => {
  it("exigen una implementación explícita", async () => {
    class HashVacio extends HashServiceInterface {}
    class JwtVacio extends JwtServiceInterface {}
    class MailVacio extends MailServiceInterface {}

    await expect(new HashVacio().hash("x")).rejects.toThrow("No implementado");
    await expect(new JwtVacio().firmarSesion({})).rejects.toThrow("No implementado");
    await expect(new MailVacio().enviarRecuperacionContrasena({})).rejects.toThrow("No implementado");
  });
});

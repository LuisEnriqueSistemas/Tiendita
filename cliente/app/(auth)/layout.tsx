import { GuardarSesion } from "@/components/layout/guardar-sesion";

/** Evita mostrar el login cuando ya existe una sesión activa. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <GuardarSesion requiereSesion={false}>{children}</GuardarSesion>;
}

import { Navbar } from "@/components/layout/navbar";
import { GuardarSesion } from "@/components/layout/guardar-sesion";
import { NavLateral } from "@/components/layout/nav-lateral";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <GuardarSesion requiereSesion>
      <div className="grid min-h-screen grid-rows-[auto_1fr]">
        <Navbar />
        <div className="grid grid-cols-1 overflow-hidden md:grid-cols-[auto_1fr]">
          <aside className="hidden border-r border-border p-3 md:block">
            <NavLateral />
          </aside>
          <main className="overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </GuardarSesion>
  );
}

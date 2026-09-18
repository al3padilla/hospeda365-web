import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppFloat from "./WhatsAppFloat";

type PageShellProps = {
  children: ReactNode;
  /** Mostrar botón flotante de WhatsApp (default: true). */
  whatsapp?: boolean;
};

/** Layout común: Navbar + contenido + Footer. */
export default function PageShell({
  children,
  whatsapp = true,
}: PageShellProps) {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Navbar />
      {children}
      {whatsapp ? <WhatsAppFloat /> : null}
      <Footer />
    </main>
  );
}

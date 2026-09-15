import type { Metadata } from "next";
import { Fraunces, Great_Vibes, Outfit } from "next/font/google";
import Proveedores from "../components/Proveedores";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hotel Terra Azul | Hospeda365",
  description:
    "Reserva tu estancia en Hotel Terra Azul. Habitaciones frente al mar, check-in sencillo y atención personalizada.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${outfit.variable} ${fraunces.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Proveedores>{children}</Proveedores>
      </body>
    </html>
  );
}

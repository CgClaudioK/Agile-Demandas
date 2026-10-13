import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agile Demands",
  description: "Gestão de demandas internas",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

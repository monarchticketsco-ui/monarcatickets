import { redirect } from "next/navigation";

// Pantalla retirada: los eventos y ordenes viven en FourVenues (motor
// unico), ya no en tablas locales de Monarca.
export default function Retirada() {
  redirect("/panel");
}

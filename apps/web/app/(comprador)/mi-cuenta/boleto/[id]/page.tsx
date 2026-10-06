import { redirect } from "next/navigation";

// Vista retirada: las entradas se muestran en /mi-cuenta/entradas (datos de FourVenues).
export default function Retirada() {
  redirect("/mi-cuenta/entradas");
}

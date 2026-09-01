import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Monarca Tickets</h1>
      <p>Boletos para eventos en Colombia.</p>
      <Link href="/eventos">Ver eventos</Link>
    </main>
  );
}

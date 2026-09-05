import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { BoletoView } from "./boleto-view";

type BoletoConDetalle = {
  id: string;
  qr_signed: string;
  status: string;
  created_at: string;
  holder_name: string | null;
  holder_document: string | null;
  order_items: {
    quantity: number;
    unit_price_cop: number;
    ticket_types: { name: string } | null;
    orders: {
      id: string;
      status: string;
      events: { name: string; venue: string; city: string; starts_at: string } | null;
    } | null;
  } | null;
};

export default async function BoletoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // RLS (tickets_select_own_or_staff) ya garantiza que solo el dueno del
  // boleto (o staff/admin) pueda leer esta fila — no hace falta filtrar por
  // holder_user_id aqui a mano.
  const { data } = await supabase
    .from("tickets")
    .select(
      "id, qr_signed, status, created_at, holder_name, holder_document, order_items(quantity, unit_price_cop, ticket_types(name), orders(id, status, events(name, venue, city, starts_at)))"
    )
    .eq("id", id)
    .single();

  const boleto = data as unknown as BoletoConDetalle | null;
  const orden = boleto?.order_items?.orders;

  if (!boleto || !orden || orden.status !== "pagada") notFound();

  const qrDataUrl = await QRCode.toDataURL(boleto.qr_signed, { margin: 1, width: 480 });
  const serial = boleto.id.split("-")[0].toUpperCase();

  return (
    <main className="container">
      <BoletoView
        evento={orden.events}
        tipoBoleto={boleto.order_items?.ticket_types?.name ?? "General"}
        precio={boleto.order_items?.unit_price_cop ?? 0}
        holderName={boleto.holder_name}
        holderDocument={boleto.holder_document}
        estado={boleto.status}
        serial={serial}
        qrDataUrl={qrDataUrl}
        ordenId={orden.id}
      />
    </main>
  );
}

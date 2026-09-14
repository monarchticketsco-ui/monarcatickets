// Calculo del "Ticket Service": el % configurado por organizador
// (organizers.commission_rate, ver ficha del organizador en el CRM) que
// se suma al precio del boleto al momento de pagar. El comprador paga
// precio + Ticket Service como un solo cargo a Bold; el organizador solo
// recibe el precio base del boleto (ver orders.ticket_service_cop,
// migracion 0012).
export function calcularTotalConTicketService(subtotalCop: number, ticketServiceRate: number) {
  const ticketServiceCop = Math.round(subtotalCop * (ticketServiceRate / 100));
  return { subtotalCop, ticketServiceCop, totalCop: subtotalCop + ticketServiceCop };
}

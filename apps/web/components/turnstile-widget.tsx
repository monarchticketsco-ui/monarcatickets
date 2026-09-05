"use client";

import Script from "next/script";

// Widget de Cloudflare Turnstile (CAPTCHA). Se renderiza solo si hay una
// site key configurada (NEXT_PUBLIC_TURNSTILE_SITE_KEY) -- si no existe,
// el formulario funciona igual, sin captcha (para no romper login/signup
// mientras no este configurado). El "modo implicito" de Turnstile
// detecta el div con clase "cf-turnstile" solo y crea automaticamente un
// input oculto con el token, listo para viajar con el resto del form.
export function TurnstileWidget({ siteKey, action }: { siteKey: string; action: string }) {
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-action={action}
        data-response-field-name="captchaToken"
        style={{ margin: "4px 0 12px" }}
      />
    </>
  );
}

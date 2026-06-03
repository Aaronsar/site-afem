/* ───────────────────────────────────────────────────────────────────────
   Meta Pixel — AFEM
   Pixel ID : 1041254263271361
   Chargé sur toutes les pages. Déclenche automatiquement PageView.
   Pour les conversions, voir fbq('track', 'Lead') dans le formulaire.
   ─────────────────────────────────────────────────────────────────────── */
(function () {
  if (window.fbq) return; // déjà initialisé
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', '1041254263271361');
  window.fbq('track', 'PageView');
})();

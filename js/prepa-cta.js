/* ───────────────────────────────────────────────────────────────────────
   AFEM — CTA "Recevoir le rapport complet des prépas de {Ville}"
   Injecté sur les pages statiques /prepas-medecine/{ville}.html
   Ouvre le formulaire de contact AFEM (HubSpot) dans un modal.
   ─────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var m = location.pathname.match(/\/prepas-medecine\/([a-z0-9-]+)/i);
  if (!m || m[1] === '_template' || m[1] === 'index') return;
  var slug = m[1].replace(/\.html$/, '');

  var city = slug.split('-').map(function (w) {
    return w ? w.charAt(0).toUpperCase() + w.slice(1) : w;
  }).join('-');

  function ctaHtml(variant) {
    var label = 'Recevoir le rapport complet des prépas de ' + city;
    var wrapCls = 'afem-prepa-cta' + (variant === 'hero' ? ' afem-prepa-cta-hero' : '');
    var kicker = variant === 'hero'
      ? 'Comparatif complet · tarifs · avis · 100 % gratuit'
      : 'Gratuit, sans engagement';
    return '<div class="' + wrapCls + '">'
      + '<p class="afem-prepa-cta-kicker">' + kicker + '</p>'
      + '<button type="button" class="btn btn-primary btn-lg afem-prepa-cta-btn" data-prepa-cta>'
      + '\u{1F4C4} ' + label + '</button>'
      + '</div>';
  }

  function injectStyles() {
    if (document.getElementById('afem-prepa-cta-style')) return;
    var css = ''
      + '.afem-prepa-cta{margin:28px 0;padding:30px 24px;background:linear-gradient(135deg,#e8f5ec,#fff);border:1px solid rgba(101,189,125,.32);border-radius:18px;text-align:center;box-shadow:0 8px 28px rgba(101,189,125,.12)}'
      + '.afem-prepa-cta-hero{margin:24px 0 8px}'
      + '.afem-prepa-cta-kicker{font-size:13px;font-weight:600;color:#479143;margin:0 0 14px;text-transform:uppercase;letter-spacing:.04em}'
      + '.afem-prepa-cta-btn{cursor:pointer;max-width:100%;white-space:normal;line-height:1.3}'
      + '.prepa-lead-header{text-align:center;margin-bottom:18px}'
      + '.prepa-lead-icon{width:64px;height:64px;border-radius:50%;background:#e8f5ec;display:flex;align-items:center;justify-content:center;margin:0 auto 14px}'
      + '.prepa-lead-header h3{font-size:22px;margin:0 0 8px;color:#212326}'
      + '.prepa-lead-header p{color:#5a5d63;font-size:15px;line-height:1.5;margin:0}';
    var st = document.createElement('style');
    st.id = 'afem-prepa-cta-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  function injectModal() {
    if (document.getElementById('prepa-lead-modal')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = ''
      + '<div class="modal-overlay" id="prepa-lead-modal">'
      + '  <div class="modal-content prepa-lead-modal-content">'
      + '    <button class="modal-close" aria-label="Fermer">&times;</button>'
      + '    <div class="prepa-lead-header">'
      + '      <div class="prepa-lead-icon">'
      + '        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#479143" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>'
      + '      </div>'
      + '      <h3 id="prepa-lead-title">Reçois le rapport complet des prépas de ' + city + '</h3>'
      + '      <p>Comparatif détaillé, tarifs, avis et conseils pour bien choisir. Laisse tes coordonnées, on t\'envoie tout par mail (gratuit).</p>'
      + '    </div>'
      + '    <div id="prepa-hubspot-form"></div>'
      + '  </div>'
      + '</div>';
    document.body.appendChild(wrap.firstElementChild);
  }

  function init() {
    injectStyles();
    injectModal();

    // CTA hero : juste après le hero de la page
    var hero = document.querySelector('.fac-hero') || document.querySelector('.page-header');
    if (hero) hero.insertAdjacentHTML('afterend', ctaHtml('hero'));

    // CTA milieu/bas : juste avant la section CTA generique ou le footer
    var anchor = document.querySelector('.cta-section') || document.querySelector('footer');
    if (anchor) {
      anchor.insertAdjacentHTML('beforebegin',
        '<div class="container" style="max-width:900px;">' + ctaHtml('mid') + '</div>');
    }

    // Modal + HubSpot
    var modal = document.getElementById('prepa-lead-modal');
    var hsLoaded = false;
    function openModal() {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (!hsLoaded) {
        hsLoaded = true;
        (function createHs() {
          if (window.hbspt && window.hbspt.forms) {
            window.hbspt.forms.create({
              portalId: '26711031',
              formId: '89c3a74e-207c-4234-9e69-d2f26321577c',
              region: 'eu1',
              target: '#prepa-hubspot-form'
            });
          } else { setTimeout(createHs, 300); }
        })();
      }
      if (window.fbq) { try { window.fbq('trackCustom', 'PrepaReportCTA', { ville: city }); } catch (e) {} }
    }
    function closeModal() { modal.classList.remove('active'); document.body.style.overflow = ''; }

    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-prepa-cta]') : null;
      if (t) { e.preventDefault(); openModal(); }
    });
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    var cb = modal.querySelector('.modal-close');
    if (cb) cb.addEventListener('click', closeModal);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

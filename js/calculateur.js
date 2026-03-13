/**
 * Calculateur de réussite PASS/LAS — AFEM
 * Estime les chances de réussite à partir du profil scolaire et des données officielles.
 */

(function () {
  'use strict';

  // State
  const state = {
    fac: null,
    parcours: null,
    classe: null,
    mention: null,
    spe1: null,
    note1: null,
    spe2: null,
    note2: null,
    heures: null,
    prepa: null,
    regularite: null,
  };

  // DOM refs
  const facSelect = document.getElementById('calc-fac-select');
  const fieldParcours = document.getElementById('field-parcours');
  const fieldMention = document.getElementById('field-mention');
  const fieldSpe1 = document.getElementById('field-spe1');
  const fieldSpe2 = document.getElementById('field-spe2');
  const fieldPrepa = document.getElementById('field-prepa');
  const fieldRegularity = document.getElementById('field-regularity');
  const submitBtn = document.getElementById('calc-submit');
  const resultsPanel = document.getElementById('calc-results');
  const stepDots = document.querySelectorAll('.calc-step-dot');
  const tabContents = document.querySelectorAll('.calc-tab-content');
  const nextToProfil = document.getElementById('next-to-profil');
  const nextToMethode = document.getElementById('next-to-methode');

  // Scientific specialties relevant to medicine
  const SCIENCE_SPES = ['physique-chimie', 'svt', 'mathematiques', 'biologie-ecologie', 'nsi'];

  // ─── Faculty select ─────────────────────────────────────────────
  function initFacSelect() {
    const facs = window.FACS_DATA || [];
    // Sort alphabetically by city then name
    const sorted = facs.slice().sort(function (a, b) {
      if (a.city < b.city) return -1;
      if (a.city > b.city) return 1;
      return a.name.localeCompare(b.name);
    });
    // Count facs per city to detect multi-fac cities
    var cityCount = {};
    sorted.forEach(function (f) { cityCount[f.city] = (cityCount[f.city] || 0) + 1; });

    sorted.forEach(function (f) {
      var opt = document.createElement('option');
      opt.value = f.id;
      // Multi-fac cities (Paris): show fac name, others: just city name
      opt.textContent = cityCount[f.city] > 1 ? f.name : f.city;
      facSelect.appendChild(opt);
    });

    facSelect.addEventListener('change', function () {
      var fac = facs.find(function (f) { return f.id === facSelect.value; });
      if (fac) selectFac(fac);
    });
  }

  function selectFac(fac) {
    state.fac = fac;

    // Show parcours options
    fieldParcours.style.display = '';

    // Check which parcours are available
    const parcoursOptions = fieldParcours.querySelectorAll('.calc-option');
    parcoursOptions.forEach(btn => {
      const val = btn.dataset.value;
      if (val === 'pass' && !fac.pass) {
        btn.disabled = true;
        btn.style.opacity = '0.4';
        btn.title = 'PASS non disponible dans cette fac';
      } else if (val === 'las' && !fac.las) {
        btn.disabled = true;
        btn.style.opacity = '0.4';
        btn.title = 'LAS non disponible dans cette fac';
      } else {
        btn.disabled = false;
        btn.style.opacity = '';
        btn.title = '';
      }
    });

    // Auto-select if only one parcours available
    if (fac.pass && !fac.las) {
      selectParcours('pass');
      parcoursOptions[0].classList.add('selected');
    } else if (!fac.pass && fac.las) {
      selectParcours('las');
      parcoursOptions[1].classList.add('selected');
    }

    updateResults();
  }

  function selectParcours(parcours) {
    state.parcours = parcours;
    // Show next button instead of auto-advancing
    nextToProfil.style.display = '';
    updateResults();
  }

  // ─── Tab navigation ─────────────────────────────────────────────
  const tabOrder = ['filiere', 'profil', 'methode'];

  function activateTab(tabName) {
    const idx = tabOrder.indexOf(tabName);
    stepDots.forEach(d => {
      const dotIdx = tabOrder.indexOf(d.dataset.tab);
      d.classList.remove('active', 'completed');
      if (dotIdx === idx) d.classList.add('active');
      else if (dotIdx < idx) d.classList.add('completed');
    });
    tabContents.forEach(tc => tc.classList.toggle('active', tc.id === 'tab-' + tabName));
  }

  // Back buttons
  document.querySelectorAll('.calc-back-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      activateTab(this.dataset.target);
    });
  });

  // Next buttons
  nextToProfil.addEventListener('click', function () {
    activateTab('profil');
  });
  nextToMethode.addEventListener('click', function () {
    activateTab('methode');
  });

  stepDots.forEach(dot => {
    dot.addEventListener('click', function () {
      activateTab(this.dataset.tab);
    });
  });

  // ─── Option buttons ─────────────────────────────────────────────
  document.querySelectorAll('.calc-options').forEach(group => {
    group.querySelectorAll('.calc-option').forEach(btn => {
      btn.addEventListener('click', function () {
        if (this.disabled) return;
        // Deselect siblings
        group.querySelectorAll('.calc-option').forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');

        // Determine which field this belongs to
        const field = this.closest('.calc-field');
        const fieldId = field ? field.id : '';
        const value = this.dataset.value;

        if (fieldId === 'field-parcours') {
          selectParcours(value);
        } else if (fieldId === 'field-mention') {
          state.mention = value;
          fieldSpe1.style.display = '';
          updateResults();
        } else if (field && field.querySelector('[id*="heures"]') === null && fieldId === '') {
          // Heures de travail (first field in methode tab, no ID)
          const parentTab = this.closest('.calc-tab-content');
          if (parentTab && parentTab.id === 'tab-methode') {
            const allFields = parentTab.querySelectorAll('.calc-field');
            const fieldIndex = Array.from(allFields).indexOf(field);
            if (fieldIndex === 0) {
              state.heures = value;
              fieldPrepa.style.display = '';
              updateResults();
            } else if (fieldId === 'field-prepa') {
              state.prepa = value;
              fieldRegularity.style.display = '';
              updateResults();
            } else if (fieldId === 'field-regularity') {
              state.regularite = value;
              submitBtn.style.display = '';
              updateResults();
            }
          }
        } else if (fieldId === 'field-prepa') {
          state.prepa = value;
          fieldRegularity.style.display = '';
          updateResults();
        } else if (fieldId === 'field-regularity') {
          state.regularite = value;
          submitBtn.style.display = '';
          updateResults();
        }
      });
    });
  });

  // Handle heures (first field in methode tab has no id, use event delegation)
  const methodeTab = document.getElementById('tab-methode');
  if (methodeTab) {
    const firstField = methodeTab.querySelector('.calc-field');
    if (firstField) {
      firstField.querySelectorAll('.calc-option').forEach(btn => {
        btn.addEventListener('click', function () {
          firstField.querySelectorAll('.calc-option').forEach(b => b.classList.remove('selected'));
          this.classList.add('selected');
          state.heures = this.dataset.value;
          fieldPrepa.style.display = '';
          updateResults();
        });
      });
    }
  }

  // ─── Select dropdowns ──────────────────────────────────────────
  const classeSelect = document.getElementById('calc-classe');
  classeSelect.addEventListener('change', function () {
    state.classe = this.value;
    if (this.value === 'terminale' || this.value === 'premiere') {
      fieldMention.style.display = '';
    } else {
      fieldMention.style.display = 'none';
      fieldSpe1.style.display = '';
    }
    updateResults();
  });

  const spe1Select = document.getElementById('calc-spe1');
  const spe2Select = document.getElementById('calc-spe2');
  const note1Input = document.getElementById('calc-note1');
  const note2Input = document.getElementById('calc-note2');

  spe1Select.addEventListener('change', function () {
    state.spe1 = this.value;
    fieldSpe2.style.display = '';
    // Filter spe2 options
    spe2Select.querySelectorAll('option').forEach(opt => {
      if (opt.value && opt.value === this.value) {
        opt.style.display = 'none';
      } else {
        opt.style.display = '';
      }
    });
    updateResults();
  });

  note1Input.addEventListener('input', function () {
    state.note1 = parseFloat(this.value) || null;
    if (state.note1 && state.note2) nextToMethode.style.display = '';
    updateResults();
  });

  spe2Select.addEventListener('change', function () {
    state.spe2 = this.value;
    updateResults();
  });

  note2Input.addEventListener('input', function () {
    state.note2 = parseFloat(this.value) || null;
    // Show next button when both notes are filled
    if (state.note1 && state.note2) {
      nextToMethode.style.display = '';
    }
    updateResults();
  });

  // Also check note1 to show next button
  function checkProfilComplete() {
    if (state.note1 && state.note2) {
      nextToMethode.style.display = '';
    }
  }

  // ─── Lead capture modal ────────────────────────────────────────
  const leadModal = document.getElementById('calc-lead-modal');
  const leadFormContainer = document.getElementById('calc-hubspot-form');
  let hubspotFormLoaded = false;
  let resultsUnlocked = false;

  function openLeadModal() {
    leadModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Load HubSpot form only once
    if (!hubspotFormLoaded) {
      hubspotFormLoaded = true;
      function createHsForm() {
        if (window.hbspt && window.hbspt.forms) {
          window.hbspt.forms.create({
            portalId: '26711031',
            formId: '89c3a74e-207c-4234-9e69-d2f26321577c',
            region: 'eu1',
            target: '#calc-hubspot-form',
            onFormSubmitted: function () {
              resultsUnlocked = true;
              closeLeadModal();
              updateResults(true);
              if (window.innerWidth < 900) {
                resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          });
        } else {
          // HubSpot not loaded yet, retry
          setTimeout(createHsForm, 300);
        }
      }
      createHsForm();
    }
  }

  function closeLeadModal() {
    leadModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  leadModal.addEventListener('click', function (e) {
    if (e.target === leadModal) closeLeadModal();
  });

  leadModal.querySelector('.modal-close').addEventListener('click', closeLeadModal);

  // ─── Submit ─────────────────────────────────────────────────────
  submitBtn.addEventListener('click', function () {
    if (resultsUnlocked) {
      updateResults(true);
      if (window.innerWidth < 900) {
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      openLeadModal();
    }
  });

  // ─── Calculation Engine ─────────────────────────────────────────
  function calculateScore() {
    if (!state.fac || !state.parcours) return null;

    const data = state.parcours === 'pass' ? state.fac.pass : state.fac.las;
    if (!data) return null;

    // Base success rate from fac data
    let baseRate = data.taux_reussite || 0;

    // If no taux_reussite, calculate from places/etudiants
    if (!baseRate && data.etudiants && data.places_mmopk) {
      baseRate = (data.places_mmopk / data.etudiants) * 100;
    }

    let score = baseRate;
    let factors = [];

    // ─── Factor 1: Mention au bac (±10 points max) ───
    if (state.mention) {
      const mentionBonus = { '0': -5, 'ab': -1, 'b': 3, 'tb': 7, 'tbf': 10 };
      const bonus = mentionBonus[state.mention] || 0;
      score += bonus;
      factors.push({
        label: 'Mention au bac',
        value: bonus,
        detail: bonus > 0 ? 'Bon indicateur de réussite' : bonus < 0 ? 'Les mentions élevées sont corrélées à la réussite' : 'Impact neutre'
      });
    }

    // ─── Factor 2: Spécialités scientifiques (±8 points max) ───
    let speBonus = 0;
    if (state.spe1) {
      if (SCIENCE_SPES.includes(state.spe1)) speBonus += 4;
      else speBonus -= 2;
    }
    if (state.spe2) {
      if (SCIENCE_SPES.includes(state.spe2)) speBonus += 4;
      else speBonus -= 2;
    }
    if (state.spe1 && state.spe2) {
      score += speBonus;
      factors.push({
        label: 'Spécialités',
        value: speBonus,
        detail: speBonus > 0 ? 'Spécialités scientifiques adaptées au programme PASS/LAS' : 'Spécialités moins directement liées au programme'
      });
    }

    // ─── Factor 3: Notes moyennes (±8 points max) ───
    if (state.note1 && state.note2) {
      const avgNote = (state.note1 + state.note2) / 2;
      let noteBonus = 0;
      if (avgNote >= 18) noteBonus = 8;
      else if (avgNote >= 16) noteBonus = 6;
      else if (avgNote >= 14) noteBonus = 3;
      else if (avgNote >= 12) noteBonus = 0;
      else if (avgNote >= 10) noteBonus = -3;
      else noteBonus = -6;

      score += noteBonus;
      factors.push({
        label: 'Notes en spécialités',
        value: noteBonus,
        detail: 'Moyenne de ' + avgNote.toFixed(1) + '/20 en spécialités'
      });
    }

    // ─── Factor 4: Heures de travail (±6 points max) ───
    if (state.heures) {
      const heuresBonus = { 'lt3': -4, '3-5': 0, '5-7': 3, 'gt7': 6 };
      const bonus = heuresBonus[state.heures] || 0;
      score += bonus;
      factors.push({
        label: 'Temps de travail',
        value: bonus,
        detail: bonus >= 3 ? 'Volume horaire solide pour réussir' : bonus < 0 ? 'Un volume horaire plus important est recommandé' : 'Volume correct'
      });
    }

    // ─── Factor 5: Prépa (±3 points) ───
    if (state.prepa) {
      const prepaBonus = { 'oui': 3, 'non': -1, 'indecis': 0 };
      const bonus = prepaBonus[state.prepa] || 0;
      score += bonus;
      factors.push({
        label: 'Prépa médecine',
        value: bonus,
        detail: state.prepa === 'oui' ? 'La prépa augmente statistiquement les chances' : 'Le tutorat gratuit reste une bonne alternative'
      });
    }

    // ─── Factor 6: Régularité (±4 points) ───
    if (state.regularite) {
      const regBonus = { 'tres-regulier': 4, 'assez-regulier': 1, 'irregular': -3 };
      const bonus = regBonus[state.regularite] || 0;
      score += bonus;
      factors.push({
        label: 'Régularité',
        value: bonus,
        detail: bonus >= 3 ? 'La régularité est le facteur clé en PASS/LAS' : bonus < 0 ? 'La régularité est essentielle — travaille à l\'améliorer' : 'Marge de progression possible'
      });
    }

    // Clamp between 2 and 95
    score = Math.max(2, Math.min(95, score));

    return { score: Math.round(score * 10) / 10, factors: factors, baseRate: baseRate };
  }

  // ─── Update Results Panel ───────────────────────────────────────
  function updateResults(final) {
    const result = calculateScore();

    if (!result) {
      resultsPanel.innerHTML = '<div class="calc-results-placeholder">' +
        '<div class="calc-placeholder-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="1.5"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div>' +
        '<h3>Tes résultats apparaîtront ici</h3>' +
        '<p>Sélectionne ta fac et ta filière pour voir ton taux de réussite estimé.</p>' +
        '<div class="calc-placeholder-features">' +
        '<div class="calc-ph-feat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Taux personnalisé</div>' +
        '<div class="calc-ph-feat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Répartition MMOPK</div>' +
        '<div class="calc-ph-feat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Conseils adaptés</div>' +
        '</div></div>';
      return;
    }

    const fac = state.fac;
    const data = state.parcours === 'pass' ? fac.pass : fac.las;
    const scoreColor = result.score >= 40 ? 'var(--green)' : result.score >= 25 ? '#e8a838' : '#e05252';
    const parcoursLabel = state.parcours.toUpperCase();

    let html = '';

    // Header: Taux de réussite
    html += '<div class="calc-result-header">';
    html += '<h3>Taux de réussite estimé</h3>';
    html += '<div class="calc-score-display">';
    html += '<div class="calc-score-bar"><div class="calc-score-fill" style="width:' + Math.min(result.score, 100) + '%;background:' + scoreColor + '"></div></div>';
    html += '<div class="calc-score-row">';
    html += '<span class="calc-score-label">' + parcoursLabel + '</span>';
    html += '<span class="calc-score-value" style="color:' + scoreColor + '">' + result.score + '%</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // Fac info
    if (data) {
      html += '<div class="calc-fac-info">';
      html += '<p>À <strong>' + fac.name + '</strong>, il y a <strong>' + (data.etudiants || '?') + ' étudiants</strong> en ' + parcoursLabel;
      html += ' pour <strong>' + (data.places_mmopk || '?') + ' places</strong> en 2e année (filières MMOPK).</p>';
      html += '<p class="calc-base-note">Taux de base : ' + result.baseRate.toFixed(1) + '% — ajusté selon ton profil.</p>';
      html += '</div>';

      // Répartition MMOPK
      const fields = [
        { key: 'places_med', label: 'Médecine', emoji: '🩺' },
        { key: 'places_pharma', label: 'Pharmacie', emoji: '💊' },
        { key: 'places_odonto', label: 'Odontologie', emoji: '🦷' },
        { key: 'places_sage_femme', label: 'Maïeutique', emoji: '👶' },
        { key: 'places_kine', label: 'Kinésithérapie', emoji: '🏃' }
      ];

      const totalPlaces = data.places_mmopk || 1;
      let hasPlaces = false;
      let placesHtml = '<div class="calc-repartition"><h4>Répartition des places</h4>';

      fields.forEach(f => {
        const places = data[f.key] || 0;
        if (places > 0) {
          hasPlaces = true;
          const pct = ((places / totalPlaces) * 100).toFixed(1);
          placesHtml += '<div class="calc-rep-row">';
          placesHtml += '<span class="calc-rep-label">' + f.emoji + ' ' + f.label + '</span>';
          placesHtml += '<span class="calc-rep-value">' + places + ' places (' + pct + '%)</span>';
          placesHtml += '</div>';
        }
      });

      placesHtml += '</div>';
      if (hasPlaces) html += placesHtml;
    }

    // Factors breakdown
    if (result.factors.length > 0 && final) {
      html += '<div class="calc-factors">';
      html += '<h4>Détail du calcul</h4>';
      result.factors.forEach(f => {
        const sign = f.value > 0 ? '+' : '';
        const cls = f.value > 0 ? 'positive' : f.value < 0 ? 'negative' : 'neutral';
        html += '<div class="calc-factor ' + cls + '">';
        html += '<div class="calc-factor-header">';
        html += '<span class="calc-factor-label">' + f.label + '</span>';
        html += '<span class="calc-factor-value">' + sign + f.value + ' pts</span>';
        html += '</div>';
        html += '<span class="calc-factor-detail">' + f.detail + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    // CTA
    if (final) {
      html += '<div class="calc-cta">';
      html += '<p>Envie d\'aller plus loin ? Découvre nos outils pour maximiser tes chances.</p>';
      html += '<div class="calc-cta-buttons">';
      html += '<a href="quizz.html" class="btn btn-primary">Quizz de compatibilité →</a>';
      html += '<a href="coaching.html" class="btn btn-secondary">Coaching PASS/LAS</a>';
      html += '</div>';
      html += '</div>';
    }

    resultsPanel.innerHTML = html;
  }

  // ─── Init ───────────────────────────────────────────────────────
  function init() {
    if (!window.FACS_DATA) {
      console.warn('FACS_DATA not loaded');
      return;
    }
    initFacSelect();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

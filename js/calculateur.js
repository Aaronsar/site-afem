/**
 * Calculateur de réussite PASS/LAS — AFEM
 * Flow : Étapes 1-2 → Formulaire HubSpot → Étape 3 → Dévoiler l'analyse → Coup de coeur
 */

(function () {
  'use strict';

  // ─── Coup de coeur + autres prépas par ville ───────────────────
  var COUPS_DE_COEUR = {
    'paris': {
      name: 'Diploma Santé',
      link: 'prepa-diploma-sante.html',
      desc: 'La prépa médecine de référence à Paris — accompagnement complet, professeurs issus des facs parisiennes et résultats prouvés.',
      others: [
        { name: 'Médisup Sciences', price: 'à partir de 8 700€' },
        { name: 'Antémed-Epsilon', price: '7 400 – 8 500€' },
        { name: 'CPCM', price: '6 100 – 7 200€' }
      ]
    },
    'marseille': {
      name: 'Medibox',
      link: 'prepa-medibox.html',
      desc: 'Prépa en ligne avec 76% d\'admissibilité en médecine. Formule Réussite dès 690€/an, adaptée à ta fac.',
      others: [
        { name: 'Sup Provence', price: 'non communiqué' },
        { name: 'MDEP', price: '3 500€' },
        { name: 'Cours Galien', price: 'non communiqué' },
        { name: 'CLM Laennec', price: 'non communiqué' }
      ]
    },
    'montpellier': {
      name: 'Medibox',
      link: 'prepa-medibox.html',
      desc: 'Prépa en ligne avec 76% d\'admissibilité en médecine. Formule Réussite dès 690€/an, adaptée à ta fac.',
      others: [
        { name: 'Cours Agora', price: 'non communiqué' },
        { name: 'ParcoursMed', price: 'non communiqué' }
      ]
    },
    'lille': {
      name: 'Medibox',
      link: 'prepa-medibox.html',
      desc: 'Prépa en ligne avec 76% d\'admissibilité en médecine. Formule Réussite dès 790€/an, adaptée à ta fac.',
      others: [
        { name: 'CAPPEC', price: '5 900 – 7 800€' },
        { name: 'SupMédical', price: '8 590€' },
        { name: 'Cours Galien', price: 'non communiqué' }
      ]
    },
    'bordeaux': {
      name: 'Medibox',
      link: 'prepa-medibox.html',
      desc: 'Prépa en ligne avec 76% d\'admissibilité en médecine. Formule Réussite dès 790€/an, adaptée à ta fac.',
      others: [
        { name: 'MMPP', price: '4 590€' },
        { name: 'Médical Sciences', price: '799€/mois' },
        { name: 'Cours Galien', price: 'non communiqué' },
        { name: 'Cours Accès', price: 'non communiqué' }
      ]
    }
  };

  function getCityKey(fac) {
    if (!fac || !fac.city) return null;
    var city = fac.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (city.indexOf('paris') !== -1) return 'paris';
    if (city.indexOf('marseille') !== -1) return 'marseille';
    if (city.indexOf('montpellier') !== -1) return 'montpellier';
    if (city.indexOf('lille') !== -1) return 'lille';
    if (city.indexOf('bordeaux') !== -1) return 'bordeaux';
    return null;
  }

  // ─── State ────────────────────────────────────────────────────
  var state = {
    fac: null, parcours: null, classe: null, mention: null,
    spe1: null, note1: null, spe2: null, note2: null,
    heures: null, prepa: null, regularite: null,
  };

  // ─── DOM refs ─────────────────────────────────────────────────
  var facSelect = document.getElementById('calc-fac-select');
  var fieldParcours = document.getElementById('field-parcours');
  var fieldMention = document.getElementById('field-mention');
  var fieldSpe1 = document.getElementById('field-spe1');
  var fieldSpe2 = document.getElementById('field-spe2');
  var fieldPrepa = document.getElementById('field-prepa');
  var fieldRegularity = document.getElementById('field-regularity');
  var resultsPanel = document.getElementById('calc-results');
  var stepDots = document.querySelectorAll('.calc-step-dot');
  var tabContents = document.querySelectorAll('.calc-tab-content');
  var nextToProfil = document.getElementById('next-to-profil');
  var nextToMethode = document.getElementById('next-to-methode');
  var devoilerBtn = document.getElementById('calc-devoiler');

  // Lead modal
  var leadModal = document.getElementById('calc-lead-modal');
  var leadFormContainer = document.getElementById('calc-hubspot-form');

  // Coup de coeur modal
  var cdcModal = document.getElementById('cdc-modal');
  var cdcStepInterest = document.getElementById('cdc-step-interest');
  var cdcStepContact = document.getElementById('cdc-step-contact');
  var cdcStepConfirm = document.getElementById('cdc-step-confirm');

  var SCIENCE_SPES = ['physique-chimie', 'svt', 'mathematiques', 'biologie-ecologie', 'nsi'];

  var hubspotFormLoaded = false;
  var formSubmitted = false;
  var resultsUnlocked = false;

  // ─── Faculty select ─────────────────────────────────────────
  function initFacSelect() {
    var facs = window.FACS_DATA || [];
    var sorted = facs.slice().sort(function (a, b) {
      if (a.city < b.city) return -1;
      if (a.city > b.city) return 1;
      return a.name.localeCompare(b.name);
    });
    var cityCount = {};
    sorted.forEach(function (f) { cityCount[f.city] = (cityCount[f.city] || 0) + 1; });

    sorted.forEach(function (f) {
      var opt = document.createElement('option');
      opt.value = f.id;
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
    fieldParcours.style.display = '';

    var parcoursOptions = fieldParcours.querySelectorAll('.calc-option');
    parcoursOptions.forEach(function (btn) {
      var val = btn.dataset.value;
      if (val === 'pass' && !fac.pass) {
        btn.disabled = true; btn.style.opacity = '0.4';
        btn.title = 'PASS non disponible dans cette fac';
      } else if (val === 'las' && !fac.las) {
        btn.disabled = true; btn.style.opacity = '0.4';
        btn.title = 'LAS non disponible dans cette fac';
      } else {
        btn.disabled = false; btn.style.opacity = ''; btn.title = '';
      }
    });

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
    nextToProfil.style.display = '';
    updateResults();
  }

  // ─── Tab navigation ─────────────────────────────────────────
  var tabOrder = ['filiere', 'profil', 'methode'];

  function activateTab(tabName) {
    var idx = tabOrder.indexOf(tabName);
    stepDots.forEach(function (d) {
      var dotIdx = tabOrder.indexOf(d.dataset.tab);
      d.classList.remove('active', 'completed');
      if (dotIdx === idx) d.classList.add('active');
      else if (dotIdx < idx) d.classList.add('completed');
    });
    tabContents.forEach(function (tc) {
      tc.classList.toggle('active', tc.id === 'tab-' + tabName);
    });
  }

  // Back buttons
  document.querySelectorAll('.calc-back-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      activateTab(this.dataset.target);
    });
  });

  // Next button step 1 → step 2
  nextToProfil.addEventListener('click', function () {
    activateTab('profil');
  });

  // Next button step 2 → HubSpot form (NEW FLOW)
  nextToMethode.addEventListener('click', function () {
    if (formSubmitted) {
      // Already submitted, just go to step 3
      activateTab('methode');
    } else {
      openLeadModal();
    }
  });

  // Step dots clickable (but step 3 only if form submitted)
  stepDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var target = this.dataset.tab;
      if (target === 'methode' && !formSubmitted) return;
      activateTab(target);
    });
  });

  // ─── Option buttons ─────────────────────────────────────────
  document.querySelectorAll('.calc-options').forEach(function (group) {
    group.querySelectorAll('.calc-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (this.disabled) return;
        group.querySelectorAll('.calc-option').forEach(function (b) { b.classList.remove('selected'); });
        this.classList.add('selected');

        var field = this.closest('.calc-field');
        var fieldId = field ? field.id : '';
        var value = this.dataset.value;

        if (fieldId === 'field-parcours') {
          selectParcours(value);
        } else if (fieldId === 'field-mention') {
          state.mention = value;
          fieldSpe1.style.display = '';
          updateResults();
        } else if (fieldId === 'field-prepa') {
          state.prepa = value;
          fieldRegularity.style.display = '';
          updateResults();
        } else if (fieldId === 'field-regularity') {
          state.regularite = value;
          devoilerBtn.style.display = '';
          updateResults();
        }
      });
    });
  });

  // Handle heures (first field in methode tab has no id)
  var methodeTab = document.getElementById('tab-methode');
  if (methodeTab) {
    var fields = methodeTab.querySelectorAll('.calc-field');
    var firstField = fields[0];
    if (firstField && !firstField.id) {
      firstField.querySelectorAll('.calc-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          firstField.querySelectorAll('.calc-option').forEach(function (b) { b.classList.remove('selected'); });
          this.classList.add('selected');
          state.heures = this.dataset.value;
          fieldPrepa.style.display = '';
          updateResults();
        });
      });
    }
  }

  // ─── Select dropdowns ──────────────────────────────────────
  var classeSelect = document.getElementById('calc-classe');
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

  var spe1Select = document.getElementById('calc-spe1');
  var spe2Select = document.getElementById('calc-spe2');
  var note1Input = document.getElementById('calc-note1');
  var note2Input = document.getElementById('calc-note2');

  spe1Select.addEventListener('change', function () {
    state.spe1 = this.value;
    fieldSpe2.style.display = '';
    spe2Select.querySelectorAll('option').forEach(function (opt) {
      opt.style.display = (opt.value && opt.value === spe1Select.value) ? 'none' : '';
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
    if (state.note1 && state.note2) nextToMethode.style.display = '';
    updateResults();
  });

  // ─── Lead capture modal ──────────────────────────────────────
  function openLeadModal() {
    leadModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (!hubspotFormLoaded) {
      hubspotFormLoaded = true;
      function createHsForm() {
        if (window.hbspt && window.hbspt.forms) {
          window.hbspt.forms.create({
            portalId: '26711031',
            formId: '89c3a74e-207c-4234-9e69-d2f26321577c',
            region: 'eu1',
            target: '#calc-hubspot-form',
            redirectUrl: '',
            onFormSubmitted: function () {
              formSubmitted = true;
              closeLeadModal();
              // Advance to step 3
              activateTab('methode');
              updateResults();
            }
          });
        } else {
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

  // ─── Dévoiler l'analyse ──────────────────────────────────────
  devoilerBtn.addEventListener('click', function () {
    var cityKey = getCityKey(state.fac);
    var cdc = cityKey ? COUPS_DE_COEUR[cityKey] : null;

    if (cdc) {
      openCdcModal(cdc, state.fac.city);
    } else {
      revealResults();
    }
  });

  function revealResults() {
    resultsUnlocked = true;
    resultsPanel.classList.remove('calc-results-blurred');
    updateResults(true);
    if (window.innerWidth < 900) {
      resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ─── Coup de coeur modal ─────────────────────────────────────
  function openCdcModal(cdc, city) {
    // Populate coup de coeur
    document.getElementById('cdc-city').textContent = city;
    document.getElementById('cdc-prepa-name').textContent = cdc.name;
    document.getElementById('cdc-prepa-desc').textContent = cdc.desc;
    document.getElementById('cdc-prepa-link').href = cdc.link;

    // Populate other prépas
    var othersContainer = document.getElementById('cdc-others');
    if (othersContainer) {
      if (cdc.others && cdc.others.length > 0) {
        var html = '<p class="cdc-others-title">Autres prépas à ' + city + '</p>';
        html += '<div class="cdc-others-list">';
        cdc.others.forEach(function (p) {
          html += '<div class="cdc-other-item"><span class="cdc-other-name">' + p.name + '</span>';
          html += '<span class="cdc-other-price">' + p.price + '</span></div>';
        });
        html += '</div>';
        othersContainer.innerHTML = html;
        othersContainer.style.display = '';
      } else {
        othersContainer.style.display = 'none';
      }
    }

    // Reset to step 1
    showCdcStep('interest');

    cdcModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCdcModal() {
    cdcModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showCdcStep(step) {
    [cdcStepInterest, cdcStepContact, cdcStepConfirm].forEach(function (el) {
      el.classList.remove('active');
    });
    document.getElementById('cdc-step-' + step).classList.add('active');
  }

  // Close
  cdcModal.addEventListener('click', function (e) {
    if (e.target === cdcModal) { closeCdcModal(); revealResults(); }
  });
  document.getElementById('cdc-close').addEventListener('click', function () {
    closeCdcModal(); revealResults();
  });

  // "Non merci" → reveal results
  document.getElementById('cdc-no').addEventListener('click', function () {
    closeCdcModal();
    revealResults();
  });

  // "Oui, je veux échanger" → step 2
  document.getElementById('cdc-yes').addEventListener('click', function () {
    showCdcStep('contact');
  });

  // Contact method selection
  var cdcPhoneField = document.getElementById('cdc-phone-field');
  document.querySelectorAll('.cdc-method').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.cdc-method').forEach(function (b) { b.classList.remove('selected'); });
      this.classList.add('selected');
      cdcPhoneField.style.display = '';
    });
  });

  // Phone + consent → enable submit
  var cdcPhone = document.getElementById('cdc-phone');
  var cdcConsent = document.getElementById('cdc-consent');
  var cdcSubmitBtn = document.getElementById('cdc-submit');

  function checkCdcSubmit() {
    var phoneVal = cdcPhone.value.replace(/\s/g, '');
    var valid = phoneVal.length >= 10 && cdcConsent.checked;
    cdcSubmitBtn.disabled = !valid;
  }

  cdcPhone.addEventListener('input', checkCdcSubmit);
  cdcConsent.addEventListener('change', checkCdcSubmit);

  // Submit contact form via HubSpot Forms API
  cdcSubmitBtn.addEventListener('click', function () {
    if (this.disabled) return;
    cdcSubmitBtn.disabled = true;
    cdcSubmitBtn.textContent = 'Envoi en cours…';

    // Collect data
    var contactData = {
      questions: document.getElementById('cdc-questions').value,
      method: document.querySelector('.cdc-method.selected') ? document.querySelector('.cdc-method.selected').dataset.value : '',
      phone: cdcPhone.value,
      when: document.getElementById('cdc-when').value,
      city: state.fac ? state.fac.city : '',
      prepa: document.getElementById('cdc-prepa-name').textContent
    };

    // Get email from HubSpot cookie if available
    var hutk = '';
    try {
      var match = document.cookie.match(/hubspotutk=([^;]+)/);
      if (match) hutk = match[1];
    } catch (e) {}

    // Build HubSpot form submission
    var payload = {
      fields: [
        { name: 'phone', value: contactData.phone },
        { name: 'afem_questions_echange', value: contactData.questions },
        { name: 'afem_methode_contact', value: contactData.method },
        { name: 'afem_creneau_contact', value: contactData.when },
        { name: 'afem_prepa_recommandee', value: contactData.prepa },
        { name: 'afem_ville_fac', value: contactData.city }
      ],
      context: {
        pageUri: window.location.href,
        pageName: document.title
      }
    };
    if (hutk) payload.context.hutk = hutk;

    fetch('https://api.hsforms-eu1.com/submissions/v3/integration/submit/26711031/a6ec3207-7934-4af8-83ca-15b85e8a48b8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function () {
      showCdcStep('confirm');
    }).catch(function () {
      // Even on error, show confirmation to not block user
      showCdcStep('confirm');
    });
  });

  // "Voir mon analyse" from confirmation
  document.getElementById('cdc-see-results').addEventListener('click', function () {
    closeCdcModal();
    revealResults();
  });

  // ─── Calculation Engine ─────────────────────────────────────
  function calculateScore() {
    if (!state.fac || !state.parcours) return null;

    var data = state.parcours === 'pass' ? state.fac.pass : state.fac.las;
    if (!data) return null;

    var baseRate = data.taux_reussite || 0;
    if (!baseRate && data.etudiants && data.places_mmopk) {
      baseRate = (data.places_mmopk / data.etudiants) * 100;
    }

    var score = baseRate;
    var factors = [];

    // Factor 1: Mention au bac
    if (state.mention) {
      var mentionBonus = { '0': -5, 'ab': -1, 'b': 3, 'tb': 7, 'tbf': 10 };
      var mb = mentionBonus[state.mention] || 0;
      score += mb;
      factors.push({
        label: 'Mention au bac', value: mb,
        detail: mb > 0 ? 'Bon indicateur de réussite' : mb < 0 ? 'Les mentions élevées sont corrélées à la réussite' : 'Impact neutre'
      });
    }

    // Factor 2: Spécialités scientifiques
    var speBonus = 0;
    if (state.spe1) { speBonus += SCIENCE_SPES.indexOf(state.spe1) !== -1 ? 4 : -2; }
    if (state.spe2) { speBonus += SCIENCE_SPES.indexOf(state.spe2) !== -1 ? 4 : -2; }
    if (state.spe1 && state.spe2) {
      score += speBonus;
      factors.push({
        label: 'Spécialités', value: speBonus,
        detail: speBonus > 0 ? 'Spécialités scientifiques adaptées au programme PASS/LAS' : 'Spécialités moins directement liées au programme'
      });
    }

    // Factor 3: Notes moyennes
    if (state.note1 && state.note2) {
      var avgNote = (state.note1 + state.note2) / 2;
      var noteBonus = avgNote >= 18 ? 8 : avgNote >= 16 ? 6 : avgNote >= 14 ? 3 : avgNote >= 12 ? 0 : avgNote >= 10 ? -3 : -6;
      score += noteBonus;
      factors.push({
        label: 'Notes en spécialités', value: noteBonus,
        detail: 'Moyenne de ' + avgNote.toFixed(1) + '/20 en spécialités'
      });
    }

    // Factor 4: Heures de travail
    if (state.heures) {
      var heuresBonus = { 'lt3': -4, '3-5': 0, '5-7': 3, 'gt7': 6 };
      var hb = heuresBonus[state.heures] || 0;
      score += hb;
      factors.push({
        label: 'Temps de travail', value: hb,
        detail: hb >= 3 ? 'Volume horaire solide pour réussir' : hb < 0 ? 'Un volume horaire plus important est recommandé' : 'Volume correct'
      });
    }

    // Factor 5: Prépa
    if (state.prepa) {
      var prepaBonus = { 'oui': 3, 'non': -1, 'indecis': 0 };
      var pb = prepaBonus[state.prepa] || 0;
      score += pb;
      factors.push({
        label: 'Prépa médecine', value: pb,
        detail: state.prepa === 'oui' ? 'La prépa augmente statistiquement les chances' : 'Le tutorat gratuit reste une bonne alternative'
      });
    }

    // Factor 6: Régularité
    if (state.regularite) {
      var regBonus = { 'tres-regulier': 4, 'assez-regulier': 1, 'irregular': -3 };
      var rb = regBonus[state.regularite] || 0;
      score += rb;
      factors.push({
        label: 'Régularité', value: rb,
        detail: rb >= 3 ? 'La régularité est le facteur clé en PASS/LAS' : rb < 0 ? 'La régularité est essentielle — travaille à l\'améliorer' : 'Marge de progression possible'
      });
    }

    score = Math.max(2, Math.min(95, score));
    return { score: Math.round(score * 10) / 10, factors: factors, baseRate: baseRate };
  }

  // ─── Update Results Panel ───────────────────────────────────
  function updateResults(final) {
    var result = calculateScore();

    resultsPanel.classList.remove('calc-results-blurred');

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

    var fac = state.fac;
    var data = state.parcours === 'pass' ? fac.pass : fac.las;
    var scoreColor = result.score >= 40 ? 'var(--green)' : result.score >= 25 ? '#e8a838' : '#e05252';
    var parcoursLabel = state.parcours.toUpperCase();

    var html = '';

    // Score display — only show actual score after reveal, teaser before
    html += '<div class="calc-result-header">';
    html += '<h3>Taux de réussite estimé</h3>';
    html += '<div class="calc-score-display">';
    if (resultsUnlocked) {
      html += '<div class="calc-score-bar"><div class="calc-score-fill" style="width:' + Math.min(result.score, 100) + '%;background:' + scoreColor + '"></div></div>';
      html += '<div class="calc-score-row">';
      html += '<span class="calc-score-label">' + parcoursLabel + '</span>';
      html += '<span class="calc-score-value" style="color:' + scoreColor + '">' + result.score + '%</span>';
      html += '</div>';
    } else {
      html += '<div class="calc-score-bar"><div class="calc-score-fill" style="width:65%;background:#ccc"></div></div>';
      html += '<div class="calc-score-row">';
      html += '<span class="calc-score-label">' + parcoursLabel + '</span>';
      html += '<span class="calc-score-value" style="color:#999">??%</span>';
      html += '</div>';
      html += '<p class="calc-score-teaser">Complète les 3 étapes pour découvrir ton score personnalisé.</p>';
    }
    html += '</div></div>';

    // Fac info
    if (data) {
      html += '<div class="calc-fac-info">';
      html += '<p>À <strong>' + fac.name + '</strong>, il y a <strong>' + (data.etudiants || '?') + ' étudiants</strong> en ' + parcoursLabel;
      html += ' pour <strong>' + (data.places_mmopk || '?') + ' places</strong> en 2e année (filières MMOPK).</p>';
      if (resultsUnlocked) {
        html += '<p class="calc-base-note">Taux de base : ' + result.baseRate.toFixed(1) + '% — ajusté selon ton profil.</p>';
      }
      html += '</div>';

      // MMOPK breakdown
      var mmopkFields = [
        { key: 'places_med', label: 'Médecine', emoji: '🩺' },
        { key: 'places_pharma', label: 'Pharmacie', emoji: '💊' },
        { key: 'places_odonto', label: 'Odontologie', emoji: '🦷' },
        { key: 'places_sage_femme', label: 'Maïeutique', emoji: '👶' },
        { key: 'places_kine', label: 'Kinésithérapie', emoji: '🏃' }
      ];

      var totalPlaces = data.places_mmopk || 1;
      var hasPlaces = false;
      var placesHtml = '<div class="calc-repartition"><h4>Répartition des places</h4>';

      mmopkFields.forEach(function (f) {
        var places = data[f.key] || 0;
        if (places > 0) {
          hasPlaces = true;
          var pct = ((places / totalPlaces) * 100).toFixed(1);
          placesHtml += '<div class="calc-rep-row">';
          placesHtml += '<span class="calc-rep-label">' + f.emoji + ' ' + f.label + '</span>';
          placesHtml += '<span class="calc-rep-value">' + places + ' places (' + pct + '%)</span>';
          placesHtml += '</div>';
        }
      });
      placesHtml += '</div>';
      if (hasPlaces) html += placesHtml;
    }

    // Factors breakdown (only after reveal)
    if (result.factors.length > 0 && final) {
      html += '<div class="calc-factors">';
      html += '<h4>Détail du calcul</h4>';
      result.factors.forEach(function (f) {
        var sign = f.value > 0 ? '+' : '';
        var cls = f.value > 0 ? 'positive' : f.value < 0 ? 'negative' : 'neutral';
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

    // CTA after reveal
    if (final) {
      // Check if coup de coeur for this city
      var cityKey = getCityKey(state.fac);
      var cdc = cityKey ? COUPS_DE_COEUR[cityKey] : null;

      if (cdc) {
        html += '<div class="calc-cdc-inline">';
        html += '<span class="cdc-badge">COUP DE CŒUR AFEM</span>';
        html += '<h4>' + cdc.name + '</h4>';
        html += '<p>' + cdc.desc + '</p>';
        html += '<a href="' + cdc.link + '" class="btn btn-primary btn-sm" target="_blank">Découvrir ' + cdc.name + ' →</a>';
        if (cdc.others && cdc.others.length > 0) {
          html += '<div class="calc-cdc-others">';
          html += '<p class="calc-cdc-others-title">Autres prépas à ' + state.fac.city + '</p>';
          cdc.others.forEach(function (p) {
            html += '<div class="calc-cdc-other-row"><span>' + p.name + '</span><span class="calc-cdc-other-price">' + p.price + '</span></div>';
          });
          html += '</div>';
        }
        html += '</div>';
      }

      html += '<div class="calc-cta">';
      html += '<p>Envie d\'aller plus loin ? Découvre nos outils pour maximiser tes chances.</p>';
      html += '<div class="calc-cta-buttons">';
      html += '<a href="quizz.html" class="btn btn-primary">Quizz de compatibilité →</a>';
      html += '<a href="coaching.html" class="btn btn-secondary">Coaching PASS/LAS</a>';
      html += '</div></div>';
    }

    resultsPanel.innerHTML = html;
  }

  // ─── Init ───────────────────────────────────────────────────
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

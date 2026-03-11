/* ========================================
   AFEM — Quizz x Fac Logic
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const quizContainer = document.getElementById('quiz-container');
  const introSection = document.getElementById('quiz-intro');
  const startBtns = document.querySelectorAll('[data-start-quiz]');
  const progressBar = document.getElementById('quiz-progress-fill');
  const stepIndicator = document.getElementById('quiz-step');
  const questionContainer = document.getElementById('quiz-question-area');
  const prevBtn = document.getElementById('quiz-prev');
  const nextBtn = document.getElementById('quiz-next');
  const resultsSection = document.getElementById('quiz-results');
  const leadSection = document.getElementById('quiz-lead-form');

  if (!quizContainer) return;

  // --- State ---
  let currentStep = 0;
  let answers = {};

  // --- Cities list (for dropdowns) ---
  const CITIES = [
    "Paris", "Lyon", "Marseille", "Toulouse", "Montpellier", "Lille", "Bordeaux",
    "Nantes", "Rennes", "Grenoble", "Rouen", "Nancy", "Clermont-Ferrand",
    "Besançon", "Dijon", "Saint-Étienne", "Limoges", "Tours", "Amiens",
    "Angers", "Orléans", "Brest", "Pointe-à-Pitre", "Saint-Denis (Réunion)",
    "Cayenne", "Corte", "Saclay", "Versailles", "Bobigny", "Créteil",
    "Nice", "Strasbourg", "Reims", "Caen", "Poitiers"
  ].sort();

  const FAC_CITIES = [...new Set(window.FACS_DATA.map(f => f.city))].sort();

  // --- Questions ---
  const questions = [
    {
      id: 'niveau',
      title: 'Quel est votre niveau actuel ?',
      subtitle: 'Cela nous aide à adapter nos recommandations.',
      type: 'single',
      options: [
        { value: 'terminale', label: 'Terminale' },
        { value: 'gap', label: 'Bac obtenu (année de césure)' },
        { value: 'sup', label: 'Déjà en études supérieures' }
      ]
    },
    {
      id: 'ville_residence',
      title: 'Dans quelle ville habitez-vous ?',
      subtitle: 'Pour évaluer la proximité des facultés.',
      type: 'select',
      placeholder: 'Sélectionnez votre ville',
      options: CITIES.map(c => ({ value: c, label: c }))
    },
    {
      id: 'specialites',
      title: 'Quelles sont vos spécialités en Terminale ?',
      subtitle: 'Sélectionnez vos deux spécialités (ou plus).',
      type: 'multi',
      options: [
        { value: 'svt', label: 'SVT' },
        { value: 'physique-chimie', label: 'Physique-Chimie' },
        { value: 'maths', label: 'Mathématiques' },
        { value: 'nsi', label: 'NSI' },
        { value: 'ses', label: 'SES' },
        { value: 'autre', label: 'Autre' }
      ]
    },
    {
      id: 'moyenne_spe1',
      title: 'Quelle est votre moyenne en spécialité 1 ?',
      subtitle: 'Votre meilleure spécialité scientifique.',
      type: 'single',
      options: [
        { value: '<10', label: 'Moins de 10' },
        { value: '10-12', label: '10 - 12' },
        { value: '12-14', label: '12 - 14' },
        { value: '14-16', label: '14 - 16' },
        { value: '16-18', label: '16 - 18' },
        { value: '18+', label: '18 et plus' }
      ]
    },
    {
      id: 'moyenne_spe2',
      title: 'Quelle est votre moyenne en spécialité 2 ?',
      subtitle: 'Votre deuxième spécialité.',
      type: 'single',
      options: [
        { value: '<10', label: 'Moins de 10' },
        { value: '10-12', label: '10 - 12' },
        { value: '12-14', label: '12 - 14' },
        { value: '14-16', label: '14 - 16' },
        { value: '16-18', label: '16 - 18' },
        { value: '18+', label: '18 et plus' }
      ]
    },
    {
      id: 'filiere',
      title: 'Quelle filière vous intéresse ?',
      subtitle: 'La filière influence directement le classement des facs.',
      type: 'single',
      options: [
        { value: 'medecine', label: 'Médecine' },
        { value: 'pharmacie', label: 'Pharmacie' },
        { value: 'odontologie', label: 'Odontologie (Dentaire)' },
        { value: 'sage-femme', label: 'Sage-femme (Maïeutique)' },
        { value: 'kine', label: 'Kinésithérapie' },
        { value: 'indecis', label: 'Je ne sais pas encore' }
      ]
    },
    {
      id: 'parcours',
      title: 'Quel parcours préférez-vous ?',
      subtitle: 'PASS est plus intense mais souvent plus de places. LAS offre un plan B.',
      type: 'single',
      options: [
        { value: 'pass', label: 'PASS' },
        { value: 'las', label: 'LAS' },
        { value: 'indifferent', label: 'Pas de préférence' }
      ]
    },
    {
      id: 'ville_etudes',
      title: 'Dans quelle ville souhaitez-vous étudier ?',
      subtitle: 'Choisissez une ville ou restez flexible.',
      type: 'select',
      placeholder: 'Sélectionnez une ville',
      options: [
        { value: 'peu-importe', label: 'Peu importe' },
        { value: 'rester', label: 'Je veux rester dans ma ville' },
        ...FAC_CITIES.map(c => ({ value: c, label: c }))
      ]
    },
    {
      id: 'taille_promo',
      title: 'Quelle taille de promotion préférez-vous ?',
      subtitle: 'Les petites promos offrent plus de suivi, les grandes plus de diversité.',
      type: 'single',
      options: [
        { value: 'petite', label: 'Petite promo (< 600)' },
        { value: 'moyenne', label: 'Moyenne (600 - 1200)' },
        { value: 'grande', label: 'Grande promo (> 1200)' },
        { value: 'indifferent', label: 'Peu importe' }
      ]
    },
    {
      id: 'priorite',
      title: 'Quelle est votre priorité principale ?',
      subtitle: 'Ce critère aura un poids important dans le calcul.',
      type: 'single',
      options: [
        { value: 'taux', label: 'Taux de réussite élevé' },
        { value: 'reputation', label: 'Grande fac réputée' },
        { value: 'places', label: 'Beaucoup de places en 2e année' }
      ]
    },
    {
      id: 'mobilite',
      title: 'Êtes-vous prêt(e) à déménager ?',
      subtitle: 'Votre mobilité influence les facs que nous pouvons vous recommander.',
      type: 'single',
      options: [
        { value: 'local', label: 'Je veux rester près de chez moi' },
        { value: 'ouvert', label: 'Je suis ouvert(e) à bouger' },
        { value: 'loin', label: 'Je veux partir loin' }
      ]
    },
    {
      id: 'accessibilite',
      title: "L'accessibilité sur Parcoursup est-elle importante ?",
      subtitle: 'Certaines facs sont très demandées et difficiles à intégrer.',
      type: 'single',
      options: [
        { value: 'tres', label: 'Très important' },
        { value: 'moyen', label: 'Moyennement' },
        { value: 'non', label: 'Pas un critère' }
      ]
    },
    {
      id: 'ambiance',
      title: 'Quel type d\'ambiance recherchez-vous ?',
      subtitle: 'L\'environnement de travail peut faire la différence.',
      type: 'single',
      options: [
        { value: 'petit', label: 'Petit effectif et suivi personnalisé' },
        { value: 'grand', label: 'Grand campus et vie étudiante' },
        { value: 'indifferent', label: 'Peu importe' }
      ]
    }
  ];

  const totalSteps = questions.length;

  // --- Render ---
  function renderQuestion(index) {
    const q = questions[index];
    const progress = ((index + 1) / totalSteps) * 100;
    progressBar.style.width = progress + '%';
    stepIndicator.textContent = `Question ${index + 1} sur ${totalSteps}`;

    let html = `<div class="quiz-question">
      <h2>${q.title}</h2>
      <p>${q.subtitle}</p>`;

    if (q.type === 'single') {
      html += '<div class="quiz-options">';
      q.options.forEach(opt => {
        const selected = answers[q.id] === opt.value ? ' selected' : '';
        html += `<button class="quiz-option${selected}" data-value="${opt.value}">${opt.label}</button>`;
      });
      html += '</div>';
    } else if (q.type === 'multi') {
      html += '<div class="quiz-options multi">';
      const currentSelection = answers[q.id] || [];
      q.options.forEach(opt => {
        const selected = currentSelection.includes(opt.value) ? ' selected' : '';
        html += `<button class="quiz-option${selected}" data-value="${opt.value}">
          <span class="quiz-checkbox">${currentSelection.includes(opt.value) ? '✓' : ''}</span>
          ${opt.label}
        </button>`;
      });
      html += '</div>';
    } else if (q.type === 'select') {
      const currentVal = answers[q.id] || '';
      html += `<div class="quiz-select-wrapper">
        <select class="quiz-select" data-question="${q.id}">
          <option value="" disabled ${!currentVal ? 'selected' : ''}>${q.placeholder}</option>`;
      q.options.forEach(opt => {
        html += `<option value="${opt.value}" ${currentVal === opt.value ? 'selected' : ''}>${opt.label}</option>`;
      });
      html += '</select></div>';
    }

    html += '</div>';
    questionContainer.innerHTML = html;

    // Bind events
    if (q.type === 'single') {
      questionContainer.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
          answers[q.id] = btn.dataset.value;
          questionContainer.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          // Auto-advance after small delay
          setTimeout(() => goNext(), 300);
        });
      });
    } else if (q.type === 'multi') {
      questionContainer.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
          if (!answers[q.id]) answers[q.id] = [];
          const val = btn.dataset.value;
          const idx = answers[q.id].indexOf(val);
          if (idx > -1) {
            answers[q.id].splice(idx, 1);
            btn.classList.remove('selected');
            btn.querySelector('.quiz-checkbox').textContent = '';
          } else {
            answers[q.id].push(val);
            btn.classList.add('selected');
            btn.querySelector('.quiz-checkbox').textContent = '✓';
          }
          updateNav();
        });
      });
    } else if (q.type === 'select') {
      const select = questionContainer.querySelector('.quiz-select');
      select.addEventListener('change', () => {
        answers[q.id] = select.value;
        updateNav();
      });
    }

    updateNav();
  }

  function updateNav() {
    prevBtn.style.display = currentStep > 0 ? 'inline-flex' : 'none';
    const q = questions[currentStep];
    const hasAnswer = q.type === 'multi'
      ? (answers[q.id] && answers[q.id].length > 0)
      : !!answers[q.id];
    nextBtn.disabled = !hasAnswer;
    nextBtn.textContent = currentStep === totalSteps - 1 ? 'Voir mes résultats →' : 'Suivant →';
  }

  function goNext() {
    const q = questions[currentStep];
    const hasAnswer = q.type === 'multi'
      ? (answers[q.id] && answers[q.id].length > 0)
      : !!answers[q.id];
    if (!hasAnswer) return;

    if (currentStep < totalSteps - 1) {
      currentStep++;
      renderQuestion(currentStep);
      questionContainer.querySelector('.quiz-question').classList.add('quiz-slide-in');
    } else {
      showLeadForm();
    }
  }

  function goPrev() {
    if (currentStep > 0) {
      currentStep--;
      renderQuestion(currentStep);
    }
  }

  // --- Lead form ---
  function showLeadForm() {
    questionContainer.style.display = 'none';
    document.querySelector('.quiz-nav').style.display = 'none';
    progressBar.style.width = '100%';
    stepIndicator.textContent = 'Dernière étape';
    leadSection.style.display = 'block';

    if (typeof hbspt !== 'undefined') {
      hbspt.forms.create({
        portalId: "26711031",
        formId: "4ad4b96f-94b4-4657-b81f-56f4f16e65f2",
        region: "eu1",
        target: "#quiz-hubspot-form",
        onFormSubmitted: function() {
          showResults();
        }
      });
    }
  }

  // --- Scoring algorithm ---
  function calculateScores() {
    const facs = window.FACS_DATA;
    const scores = facs.map(fac => {
      let score = 0;
      const parcours = answers.parcours || 'indifferent';
      const data = parcours === 'las' ? (fac.las || fac.pass) : fac.pass;
      const filiere = answers.filiere || 'indecis';

      // 1. Filière (25%) — places in chosen field
      const filiereMap = {
        medecine: 'places_med',
        pharmacie: 'places_pharma',
        odontologie: 'places_odonto',
        'sage-femme': 'places_sage_femme',
        kine: 'places_kine'
      };
      if (filiere !== 'indecis' && filiereMap[filiere]) {
        const places = data[filiereMap[filiere]] || 0;
        const maxPlaces = Math.max(...facs.map(f => {
          const d = parcours === 'las' ? (f.las || f.pass) : f.pass;
          return d[filiereMap[filiere]] || 0;
        }));
        score += maxPlaces > 0 ? (places / maxPlaces) * 25 : 12.5;
      } else {
        // Indécis: use total MMOPK places
        const places = data.places_mmopk || 0;
        const maxPlaces = Math.max(...facs.map(f => {
          const d = parcours === 'las' ? (f.las || f.pass) : f.pass;
          return d.places_mmopk || 0;
        }));
        score += maxPlaces > 0 ? (places / maxPlaces) * 25 : 12.5;
      }

      // 2. Taux de réussite (20%)
      const taux = data.taux_reussite || 0;
      const maxTaux = Math.max(...facs.map(f => {
        const d = parcours === 'las' ? (f.las || f.pass) : f.pass;
        return d.taux_reussite || 0;
      }));
      score += maxTaux > 0 ? (taux / maxTaux) * 20 : 10;

      // 3. Localisation (15%)
      const villeEtudes = answers.ville_etudes;
      const villeResidence = answers.ville_residence;
      if (villeEtudes === 'rester' && villeResidence) {
        if (fac.city === villeResidence) score += 15;
        else if (fac.region === getRegionForCity(villeResidence)) score += 10;
        else score += 2;
      } else if (villeEtudes && villeEtudes !== 'peu-importe') {
        if (fac.city === villeEtudes) score += 15;
        else if (fac.region === getRegionForCity(villeEtudes)) score += 8;
        else score += 2;
      } else {
        score += 8; // Peu importe: neutral
      }

      // 4. Taille de promo (10%)
      const taillePreference = answers.taille_promo;
      const nbEtudiants = fac.pass.etudiants || 0;
      if (taillePreference === 'petite' && nbEtudiants < 600) score += 10;
      else if (taillePreference === 'moyenne' && nbEtudiants >= 600 && nbEtudiants <= 1200) score += 10;
      else if (taillePreference === 'grande' && nbEtudiants > 1200) score += 10;
      else if (taillePreference === 'indifferent') score += 7;
      else score += 3;

      // 5. Accessibilité Parcoursup (10%)
      if (answers.accessibilite === 'tres') {
        const admission = fac.pass.pct_admission || 0;
        const maxAdm = Math.max(...facs.map(f => f.pass.pct_admission || 0));
        score += maxAdm > 0 ? (admission / maxAdm) * 10 : 5;
      } else if (answers.accessibilite === 'moyen') {
        score += 5;
      } else {
        score += 7;
      }

      // 6. PASS vs LAS recommandation (10%)
      if (parcours !== 'indifferent') {
        if (parcours === 'pass' && (fac.recommended_path === 'PASS' || fac.recommended_path === 'IDEM')) score += 10;
        else if (parcours === 'las' && (fac.recommended_path === 'LAS' || fac.recommended_path === 'IDEM')) score += 10;
        else score += 4;
      } else {
        score += 7;
      }

      // 7. Priorité bonus (10%)
      if (answers.priorite === 'taux') {
        score += maxTaux > 0 ? (taux / maxTaux) * 10 : 5;
      } else if (answers.priorite === 'places') {
        const totalPlaces = data.places_mmopk || 0;
        const maxP = Math.max(...facs.map(f => {
          const d = parcours === 'las' ? (f.las || f.pass) : f.pass;
          return d.places_mmopk || 0;
        }));
        score += maxP > 0 ? (totalPlaces / maxP) * 10 : 5;
      } else if (answers.priorite === 'reputation') {
        const voeux = fac.pass.voeux_parcoursup || 0;
        const maxV = Math.max(...facs.map(f => f.pass.voeux_parcoursup || 0));
        score += maxV > 0 ? (voeux / maxV) * 10 : 5;
      }

      // Bonus: spécialités scientifiques + bonnes notes → boost compétitives
      const spes = answers.specialites || [];
      const hasSciSpes = spes.includes('svt') || spes.includes('physique-chimie');
      const avgGrade = gradeToNum(answers.moyenne_spe1) + gradeToNum(answers.moyenne_spe2);
      if (hasSciSpes && avgGrade >= 30) {
        // Good student → slight boost for competitive facs
        if (taux < 30) score += 2; // competitive facs are a viable option
      }

      // Mobilité adjustment
      if (answers.mobilite === 'local' && villeResidence) {
        if (fac.city !== villeResidence && fac.region !== getRegionForCity(villeResidence)) {
          score *= 0.7; // Penalize distant facs
        }
      } else if (answers.mobilite === 'loin' && villeResidence) {
        if (fac.city === villeResidence) {
          score *= 0.85; // Slightly penalize home city
        }
      }

      // Ambiance adjustment
      if (answers.ambiance === 'petit' && nbEtudiants > 1000) score *= 0.9;
      if (answers.ambiance === 'grand' && nbEtudiants < 500) score *= 0.9;

      return { fac, score: Math.min(Math.round(score), 100) };
    });

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, 5);
  }

  function gradeToNum(grade) {
    const map = { '<10': 8, '10-12': 11, '12-14': 13, '14-16': 15, '16-18': 17, '18+': 19 };
    return map[grade] || 12;
  }

  function getRegionForCity(city) {
    const regionMap = {
      'Paris': 'Île-de-France', 'Saclay': 'Île-de-France', 'Versailles': 'Île-de-France',
      'Bobigny': 'Île-de-France', 'Créteil': 'Île-de-France',
      'Lyon': 'Auvergne-Rhône-Alpes', 'Grenoble': 'Auvergne-Rhône-Alpes',
      'Saint-Étienne': 'Auvergne-Rhône-Alpes', 'Clermont-Ferrand': 'Auvergne-Rhône-Alpes',
      'Marseille': 'Provence-Alpes-Côte d\'Azur', 'Nice': 'Provence-Alpes-Côte d\'Azur',
      'Toulouse': 'Occitanie', 'Montpellier': 'Occitanie',
      'Lille': 'Hauts-de-France', 'Amiens': 'Hauts-de-France',
      'Bordeaux': 'Nouvelle-Aquitaine', 'Limoges': 'Nouvelle-Aquitaine', 'Poitiers': 'Nouvelle-Aquitaine',
      'Nantes': 'Pays de la Loire', 'Angers': 'Pays de la Loire',
      'Rennes': 'Bretagne', 'Brest': 'Bretagne',
      'Rouen': 'Normandie', 'Caen': 'Normandie',
      'Nancy': 'Grand Est', 'Strasbourg': 'Grand Est', 'Reims': 'Grand Est',
      'Besançon': 'Bourgogne-Franche-Comté', 'Dijon': 'Bourgogne-Franche-Comté',
      'Tours': 'Centre-Val de Loire', 'Orléans': 'Centre-Val de Loire',
      'Corte': 'Corse',
      'Pointe-à-Pitre': 'DOM-TOM', 'Saint-Denis (Réunion)': 'DOM-TOM', 'Cayenne': 'DOM-TOM'
    };
    return regionMap[city] || '';
  }

  // --- Show results ---
  function showResults() {
    leadSection.style.display = 'none';
    document.querySelector('.quiz-progress').style.display = 'none';
    stepIndicator.style.display = 'none';
    resultsSection.style.display = 'block';

    const top5 = calculateScores();
    const parcours = answers.parcours || 'indifferent';
    const filiere = answers.filiere || 'indecis';

    const filiereLabels = {
      medecine: 'Médecine', pharmacie: 'Pharmacie', odontologie: 'Odontologie',
      'sage-femme': 'Sage-femme', kine: 'Kinésithérapie', indecis: 'MMOPK'
    };
    const filiereMap = {
      medecine: 'places_med', pharmacie: 'places_pharma', odontologie: 'places_odonto',
      'sage-femme': 'places_sage_femme', kine: 'places_kine'
    };

    let html = `<div class="quiz-results-header">
      <h2>Votre classement <span class="gradient">personnalisé</span></h2>
      <p>Voici les 5 facultés les plus compatibles avec votre profil.</p>
    </div>
    <div class="quiz-results-grid">`;

    top5.forEach((item, i) => {
      const fac = item.fac;
      const passData = fac.pass;
      const lasData = fac.las;
      const placesField = filiereMap[filiere];
      const placesPass = placesField ? (passData[placesField] || 0) : passData.places_mmopk;
      const placesLas = lasData && placesField ? (lasData[placesField] || 0) : (lasData ? lasData.places_mmopk : 0);

      html += `<div class="quiz-result-card glass-card fade-up">
        <div class="result-rank">#${i + 1}</div>
        <div class="result-header">
          <h3>${fac.name}</h3>
          <span class="result-city">${fac.city}</span>
        </div>
        <div class="score-bar-wrapper">
          <div class="score-bar">
            <div class="score-bar-fill" style="width: ${item.score}%"></div>
          </div>
          <span class="score-value">${item.score}%</span>
        </div>
        <div class="result-stats">
          <div class="result-stat">
            <span class="result-stat-label">Taux réussite PASS</span>
            <span class="result-stat-value">${passData.taux_reussite}%</span>
          </div>
          ${lasData ? `<div class="result-stat">
            <span class="result-stat-label">Taux réussite LAS</span>
            <span class="result-stat-value">${lasData.taux_reussite}%</span>
          </div>` : ''}
          <div class="result-stat">
            <span class="result-stat-label">Places ${filiereLabels[filiere]} (PASS)</span>
            <span class="result-stat-value">${placesPass}</span>
          </div>
          ${lasData ? `<div class="result-stat">
            <span class="result-stat-label">Places ${filiereLabels[filiere]} (LAS)</span>
            <span class="result-stat-value">${placesLas}</span>
          </div>` : ''}
          <div class="result-stat">
            <span class="result-stat-label">Étudiants en PASS</span>
            <span class="result-stat-value">${passData.etudiants}</span>
          </div>
          <div class="result-stat">
            <span class="result-stat-label">Parcours recommandé</span>
            <span class="result-stat-value recommended">${fac.recommended_path}</span>
          </div>
        </div>
      </div>`;
    });

    html += `</div>
    <div class="quiz-results-actions">
      <a href="simulateur.html" class="btn btn-primary btn-lg">Simulez vos chances sur Parcoursup →</a>
      <button class="btn btn-secondary" id="quiz-restart">Recommencer le quizz</button>
    </div>`;

    resultsSection.innerHTML = html;

    // Animate score bars
    setTimeout(() => {
      resultsSection.querySelectorAll('.score-bar-fill').forEach(bar => {
        bar.style.transition = 'width 1s ease';
      });
    }, 100);

    // Fade up animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    resultsSection.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // Restart button
    document.getElementById('quiz-restart').addEventListener('click', restartQuiz);

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function restartQuiz() {
    currentStep = 0;
    answers = {};
    resultsSection.style.display = 'none';
    resultsSection.innerHTML = '';
    questionContainer.style.display = 'block';
    document.querySelector('.quiz-nav').style.display = 'flex';
    document.querySelector('.quiz-progress').style.display = 'block';
    stepIndicator.style.display = 'block';
    renderQuestion(0);
    quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // --- Start quiz ---
  function startQuiz() {
    introSection.style.display = 'none';
    quizContainer.style.display = 'block';
    renderQuestion(0);
    quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // --- Event listeners ---
  startBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    startQuiz();
  }));

  nextBtn.addEventListener('click', goNext);
  prevBtn.addEventListener('click', goPrev);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!quizContainer.style.display || quizContainer.style.display === 'none') return;
    if (e.key === 'ArrowRight' || e.key === 'Enter') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });

});

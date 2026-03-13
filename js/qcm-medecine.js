/**
 * QCM Médecine PASS/LAS — AFEM
 * Flow : Sélection matière → Form gate (1 fois) → QCM 20 questions → Résultats + correction
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'qcm_unlocked';

  var state = {
    subject: null,
    questions: [],
    currentQ: 0,
    answers: [],
    formSubmitted: false,
    hubspotLoaded: false,
    pendingSubject: null
  };

  // ─── DOM refs ─────────────────────────────────────────────
  var selectSection = document.getElementById('qcm-select');
  var container = document.getElementById('qcm-container');
  var resultsSection = document.getElementById('qcm-results');
  var leadModal = document.getElementById('qcm-lead-modal');

  // ─── Init ─────────────────────────────────────────────────
  function init() {
    if (!window.QCM_DATA) { console.warn('QCM_DATA not loaded'); return; }

    // Check localStorage
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      state.formSubmitted = true;
    }

    // Render subject cards
    renderSubjects();

    // Lead modal close
    leadModal.addEventListener('click', function (e) {
      if (e.target === leadModal) closeLeadModal();
    });
    leadModal.querySelector('.modal-close').addEventListener('click', closeLeadModal);
  }

  // ─── Subject grid ─────────────────────────────────────────
  function renderSubjects() {
    var grid = document.getElementById('qcm-subject-grid');
    var data = window.QCM_DATA;
    var keys = Object.keys(data);
    var html = '';

    keys.forEach(function (key) {
      var subject = data[key];
      html += '<div class="qcm-subject-card" data-subject="' + key + '">';
      html += '<span class="qcm-subject-emoji">' + subject.emoji + '</span>';
      html += '<div class="qcm-subject-name">' + subject.label + '</div>';
      html += '<div class="qcm-subject-count">' + subject.questions.length + ' questions</div>';
      html += '</div>';
    });

    grid.innerHTML = html;

    // Click handlers
    grid.querySelectorAll('.qcm-subject-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var key = this.dataset.subject;
        selectSubject(key);
      });
    });
  }

  // ─── Select subject ───────────────────────────────────────
  function selectSubject(key) {
    state.pendingSubject = key;

    if (!state.formSubmitted) {
      openLeadModal();
    } else {
      startQCM(key);
    }
  }

  // ─── Start QCM ────────────────────────────────────────────
  function startQCM(key) {
    var data = window.QCM_DATA[key];
    if (!data) return;

    state.subject = key;
    state.questions = data.questions;
    state.currentQ = 0;
    state.answers = new Array(data.questions.length).fill(null);

    selectSection.style.display = 'none';
    resultsSection.classList.remove('active');
    container.classList.add('active');

    renderQuestion(0);

    // Scroll to top of container
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ─── Render question ──────────────────────────────────────
  function renderQuestion(idx) {
    state.currentQ = idx;
    var q = state.questions[idx];
    var subject = window.QCM_DATA[state.subject];
    var total = state.questions.length;

    var html = '';

    // Progress
    html += '<div class="qcm-progress-wrap">';
    html += '<div class="qcm-progress-info">';
    html += '<span>Question <strong>' + (idx + 1) + '/' + total + '</strong></span>';
    html += '<span>' + subject.emoji + ' ' + subject.label + '</span>';
    html += '</div>';
    html += '<div class="qcm-progress-bar"><div class="qcm-progress-fill" style="width:' + ((idx + 1) / total * 100) + '%"></div></div>';
    html += '</div>';

    // Question card
    html += '<div class="qcm-question-card">';
    html += '<div class="qcm-question-number">Question ' + (idx + 1) + '</div>';
    html += '<div class="qcm-question-text">' + q.question + '</div>';

    if (q.type === 'qcu') {
      html += renderQCU(q, idx);
    } else if (q.type === 'vf') {
      html += renderVF(q, idx);
    }

    html += '</div>';

    // Navigation
    html += '<div class="qcm-nav">';
    if (idx > 0) {
      html += '<button class="btn btn-secondary" id="qcm-prev">&larr; Précédent</button>';
    } else {
      html += '<button class="btn btn-secondary" id="qcm-back-subjects">&larr; Matières</button>';
    }
    var answered = isAnswered(idx);
    if (idx < total - 1) {
      html += '<button class="btn btn-primary" id="qcm-next"' + (answered ? '' : ' disabled') + '>Suivant &rarr;</button>';
    } else {
      html += '<button class="btn btn-primary" id="qcm-finish"' + (answered ? '' : ' disabled') + '>Voir mes résultats &rarr;</button>';
    }
    html += '</div>';

    container.innerHTML = html;

    // Bind events
    bindQuestionEvents(idx);
  }

  // ─── Render QCU ───────────────────────────────────────────
  function renderQCU(q, idx) {
    var html = '<div class="qcm-options">';
    var saved = state.answers[idx];

    q.options.forEach(function (opt, i) {
      var sel = (saved !== null && saved === i) ? ' selected' : '';
      html += '<div class="qcm-option' + sel + '" data-index="' + i + '">';
      html += '<div class="qcm-option-radio"></div>';
      html += '<span>' + opt + '</span>';
      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  // ─── Render VF ────────────────────────────────────────────
  function renderVF(q, idx) {
    var html = '<div class="qcm-vf-items">';
    var saved = state.answers[idx]; // array of true/false/null per item

    q.items.forEach(function (item, i) {
      var savedVal = saved ? saved[i] : null;
      html += '<div class="qcm-vf-item" data-item="' + i + '">';
      html += '<span class="qcm-vf-text">' + item.text + '</span>';
      html += '<div class="qcm-vf-toggles">';
      html += '<button class="qcm-vf-toggle' + (savedVal === true ? ' selected-true' : '') + '" data-val="true">V</button>';
      html += '<button class="qcm-vf-toggle' + (savedVal === false ? ' selected-false' : '') + '" data-val="false">F</button>';
      html += '</div>';
      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  // ─── Check if question is answered ───────────────────────
  function isAnswered(idx) {
    var q = state.questions[idx];
    var ans = state.answers[idx];
    if (q.type === 'qcu') return ans !== null;
    if (q.type === 'vf') return ans && ans.every(function (v) { return v !== null; });
    return false;
  }

  function updateNavState(idx) {
    var btn = document.getElementById('qcm-next') || document.getElementById('qcm-finish');
    if (btn) {
      btn.disabled = !isAnswered(idx);
    }
  }

  // ─── Bind events ──────────────────────────────────────────
  function bindQuestionEvents(idx) {
    var q = state.questions[idx];

    if (q.type === 'qcu') {
      container.querySelectorAll('.qcm-option').forEach(function (opt) {
        opt.addEventListener('click', function () {
          container.querySelectorAll('.qcm-option').forEach(function (o) { o.classList.remove('selected'); });
          this.classList.add('selected');
          state.answers[idx] = parseInt(this.dataset.index);
          updateNavState(idx);
        });
      });
    } else if (q.type === 'vf') {
      if (!state.answers[idx]) {
        state.answers[idx] = new Array(q.items.length).fill(null);
      }
      container.querySelectorAll('.qcm-vf-toggle').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var item = this.closest('.qcm-vf-item');
          var itemIdx = parseInt(item.dataset.item);
          var val = this.dataset.val === 'true';

          // Clear sibling toggle
          item.querySelectorAll('.qcm-vf-toggle').forEach(function (t) {
            t.classList.remove('selected-true', 'selected-false');
          });
          this.classList.add(val ? 'selected-true' : 'selected-false');
          state.answers[idx][itemIdx] = val;
          updateNavState(idx);
        });
      });
    }

    // Navigation
    var prevBtn = document.getElementById('qcm-prev');
    var nextBtn = document.getElementById('qcm-next');
    var finishBtn = document.getElementById('qcm-finish');
    var backBtn = document.getElementById('qcm-back-subjects');

    if (prevBtn) prevBtn.addEventListener('click', function () { renderQuestion(idx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { renderQuestion(idx + 1); });
    if (finishBtn) finishBtn.addEventListener('click', showResults);
    if (backBtn) backBtn.addEventListener('click', backToSubjects);
  }

  // ─── Back to subjects ─────────────────────────────────────
  function backToSubjects() {
    container.classList.remove('active');
    resultsSection.classList.remove('active');
    selectSection.style.display = '';
    selectSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ─── Show results ─────────────────────────────────────────
  function showResults() {
    var score = 0;
    var total = state.questions.length;
    var corrections = [];

    state.questions.forEach(function (q, i) {
      var ans = state.answers[i];
      var isCorrect = false;

      if (q.type === 'qcu') {
        isCorrect = ans === q.answer;
      } else if (q.type === 'vf') {
        if (ans && ans.length === q.items.length) {
          isCorrect = q.items.every(function (item, j) {
            return ans[j] === item.answer;
          });
        }
      }

      if (isCorrect) score++;

      corrections.push({
        question: q,
        answer: ans,
        correct: isCorrect,
        index: i
      });
    });

    container.classList.remove('active');
    resultsSection.classList.add('active');

    var pct = (score / total * 100);
    var scoreColor = pct >= 80 ? 'var(--green)' : pct >= 60 ? '#e8a838' : '#e05252';
    var msg = '';
    if (score >= 16) msg = 'Excellent ! Tu maîtrises bien cette matière.';
    else if (score >= 12) msg = 'Bon niveau, quelques points à revoir.';
    else if (score >= 8) msg = 'Des bases à consolider. Revois les notions clés.';
    else msg = 'Il faut retravailler cette matière en profondeur.';

    var subject = window.QCM_DATA[state.subject];
    var html = '';

    // Score card
    html += '<div class="qcm-score-card">';
    html += '<div class="qcm-score-big" style="color:' + scoreColor + '">' + score + '/' + total + '</div>';
    html += '<div class="qcm-score-total">' + subject.emoji + ' ' + subject.label + '</div>';
    html += '<div class="qcm-score-bar"><div class="qcm-score-fill" style="width:' + pct + '%;background:' + scoreColor + '"></div></div>';
    html += '<div class="qcm-score-msg">' + msg + '</div>';
    html += '</div>';

    // CTA
    html += '<div style="text-align:center;margin-bottom:32px;">';
    html += '<button class="btn btn-primary" id="qcm-retry">' + subject.emoji + ' Refaire ce QCM</button> ';
    html += '<button class="btn btn-secondary" id="qcm-other">Essayer une autre matière</button>';
    html += '</div>';

    // Correction
    html += '<h3 style="margin-bottom:16px;">Correction détaillée</h3>';
    html += '<div class="qcm-correction">';

    corrections.forEach(function (c) {
      var status = c.answer === null ? 'skipped' : c.correct ? 'correct' : 'wrong';
      var badgeText = c.answer === null ? 'Non répondu' : c.correct ? 'Correct' : 'Faux';

      html += '<div class="qcm-correction-item ' + status + '">';
      html += '<div class="qcm-correction-header">';
      html += '<span class="qcm-correction-qnum">Question ' + (c.index + 1) + '</span>';
      html += '<span class="qcm-correction-badge ' + status + '">' + badgeText + '</span>';
      html += '</div>';
      html += '<div class="qcm-correction-question">' + c.question.question + '</div>';

      if (c.question.type === 'qcu') {
        var userAnswer = c.answer !== null ? c.question.options[c.answer] : '—';
        var correctAnswer = c.question.options[c.question.answer];
        html += '<div class="qcm-correction-answer">Ta réponse : <strong>' + userAnswer + '</strong></div>';
        if (!c.correct) {
          html += '<div class="qcm-correction-answer">Bonne réponse : <strong style="color:var(--green)">' + correctAnswer + '</strong></div>';
        }
      } else if (c.question.type === 'vf') {
        c.question.items.forEach(function (item, j) {
          var userVal = c.answer ? c.answer[j] : null;
          var correctVal = item.answer;
          var userStr = userVal === null ? '?' : userVal ? 'V' : 'F';
          var correctStr = correctVal ? 'V' : 'F';
          var itemCorrect = userVal === correctVal;
          var color = userVal === null ? '#999' : itemCorrect ? 'var(--green)' : '#e05252';
          html += '<div class="qcm-correction-answer" style="color:' + color + '">';
          html += item.text + ' → ' + userStr;
          if (!itemCorrect) html += ' (réponse : <strong>' + correctStr + '</strong>)';
          html += '</div>';
        });
      }

      html += '<div class="qcm-correction-explanation">' + c.question.explanation + '</div>';
      html += '</div>';
    });

    html += '</div>';

    // Links
    html += '<div style="text-align:center;margin-top:40px;padding:24px;background:rgba(101,189,125,0.06);border-radius:16px;">';
    html += '<p style="font-weight:600;margin-bottom:12px;">Envie d\'aller plus loin ?</p>';
    html += '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">';
    html += '<a href="calculateur-reussite.html" class="btn btn-primary">Calculateur de réussite</a>';
    html += '<a href="coaching.html" class="btn btn-secondary">Coaching PASS/LAS</a>';
    html += '</div></div>';

    resultsSection.innerHTML = html;
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Bind result buttons
    document.getElementById('qcm-retry').addEventListener('click', function () {
      startQCM(state.subject);
    });
    document.getElementById('qcm-other').addEventListener('click', backToSubjects);
  }

  // ─── Lead modal ───────────────────────────────────────────
  function openLeadModal() {
    leadModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (!state.hubspotLoaded) {
      state.hubspotLoaded = true;
      loadHubspotForm();
    }
  }

  function closeLeadModal() {
    leadModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function loadHubspotForm() {
    function tryCreate() {
      if (window.hbspt && window.hbspt.forms) {
        window.hbspt.forms.create({
          portalId: '26711031',
          formId: 'ea2e7680-8bb3-4364-959d-030adecaef54',
          region: 'eu1',
          target: '#qcm-hubspot-form',
          redirectUrl: '',
          onFormSubmitted: function () {
            state.formSubmitted = true;
            localStorage.setItem(STORAGE_KEY, 'true');
            closeLeadModal();
            if (state.pendingSubject) {
              startQCM(state.pendingSubject);
            }
          }
        });
      } else {
        setTimeout(tryCreate, 300);
      }
    }
    tryCreate();
  }

  // ─── Start ────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* ═══════════════════════════════════════════════════
   AFEM Block Editor — Block-based article content editor
   Adapted from EduMove block system for vanilla JS
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Block Type Registry ─── */
  var BLOCK_TYPES = {
    heading:   { label: 'Titre',       icon: 'T',  color: '#2271b1' },
    paragraph: { label: 'Paragraphe',  icon: 'P',  color: '#00a32a' },
    callout:   { label: 'Encadré',     icon: '!',  color: '#dba617' },
    table:     { label: 'Tableau',     icon: '⊞',  color: '#8e44ad' },
    list:      { label: 'Liste',       icon: '☰',  color: '#e67e22' },
    image:     { label: 'Image',       icon: '▣',  color: '#3498db' },
    grid:      { label: 'Grille',      icon: '⊟',  color: '#1abc9c' },
    faq:       { label: 'FAQ',         icon: '?',  color: '#d63638' }
  };

  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
  function escAttr(s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ─── Main Block Editor Renderer ─── */
  window.renderBlockEditor = function (sections) {
    var blocks = normalizeBlocks(sections);
    var html = '<div id="blocks-list">';
    blocks.forEach(function (block, i) {
      html += renderBlockWrapper(i, block);
    });
    html += '</div>';
    html += renderBlockPicker(-1);
    return html;
  };

  /* Normalize: ensure all sections have a type field */
  function normalizeBlocks(sections) {
    if (!sections || !sections.length) return [];
    return sections.map(function (sec) {
      if (sec.type) return sec;
      // Legacy format: { heading, html } → convert
      var blocks = [];
      if (sec.heading) blocks.push({ type: 'heading', text: sec.heading, level: 'h2' });
      if (sec.html) blocks.push({ type: 'paragraph', html: sec.html });
      return blocks;
    }).reduce(function (flat, item) {
      return flat.concat(Array.isArray(item) ? item : [item]);
    }, []);
  }

  /* ─── Block Wrapper (shared chrome) ─── */
  function renderBlockWrapper(idx, block) {
    var bt = BLOCK_TYPES[block.type] || BLOCK_TYPES.paragraph;
    var html = '<div class="block-item" data-idx="' + idx + '" data-type="' + (block.type || 'paragraph') + '">';
    html += '<div class="block-header">';
    html += '<div class="block-header-left">';
    html += '<span class="block-type-badge" style="background:' + bt.color + '">' + bt.icon + '</span>';
    html += '<span class="block-type-label">' + bt.label + '</span>';
    html += '</div>';
    html += '<div class="block-actions">';
    html += '<button type="button" class="block-btn block-btn-move" onclick="moveBlock(' + idx + ',-1)" title="Monter">&#9650;</button>';
    html += '<button type="button" class="block-btn block-btn-move" onclick="moveBlock(' + idx + ',1)" title="Descendre">&#9660;</button>';
    html += '<button type="button" class="block-btn block-btn-delete" onclick="deleteBlock(' + idx + ')" title="Supprimer">&#10005;</button>';
    html += '</div>';
    html += '</div>';
    html += '<div class="block-body">';
    html += renderBlockContent(idx, block);
    html += '</div>';
    html += renderBlockPicker(idx);
    html += '</div>';
    return html;
  }

  /* ─── Block Content Renderers ─── */
  function renderBlockContent(idx, block) {
    switch (block.type) {
      case 'heading':   return renderHeadingEditor(idx, block);
      case 'paragraph': return renderParagraphEditor(idx, block);
      case 'callout':   return renderCalloutEditor(idx, block);
      case 'table':     return renderTableEditor(idx, block);
      case 'list':      return renderListEditor(idx, block);
      case 'image':     return renderImageEditor(idx, block);
      case 'grid':      return renderGridEditor(idx, block);
      case 'faq':       return renderFaqEditor(idx, block);
      default:          return renderParagraphEditor(idx, block);
    }
  }

  /* ─── Heading ─── */
  function renderHeadingEditor(idx, block) {
    return '<div class="block-heading-editor">' +
      '<select name="block_heading_level_' + idx + '" class="block-select" onchange="markUnsaved()">' +
        '<option value="h2"' + ((block.level || 'h2') === 'h2' ? ' selected' : '') + '>H2</option>' +
        '<option value="h3"' + (block.level === 'h3' ? ' selected' : '') + '>H3</option>' +
      '</select>' +
      '<input type="text" name="block_heading_text_' + idx + '" value="' + escAttr(block.text || '') + '" placeholder="Titre de la section" class="block-input-wide" oninput="markUnsaved()">' +
    '</div>';
  }

  /* ─── Paragraph (with rich text toolbar) ─── */
  function renderParagraphEditor(idx, block) {
    return '<div class="block-paragraph-editor">' +
      '<div class="rich-toolbar">' +
        '<button type="button" class="rich-btn" onclick="execRich(' + idx + ',\'bold\')" title="Gras"><strong>B</strong></button>' +
        '<button type="button" class="rich-btn" onclick="execRich(' + idx + ',\'italic\')" title="Italique"><em>I</em></button>' +
        '<button type="button" class="rich-btn" onclick="execRich(' + idx + ',\'link\')" title="Lien">&#128279;</button>' +
      '</div>' +
      '<div class="rich-editor" contenteditable="true" data-block-idx="' + idx + '" oninput="markUnsaved()">' +
        (block.html || '') +
      '</div>' +
    '</div>';
  }

  /* ─── Callout ─── */
  function renderCalloutEditor(idx, block) {
    return '<div class="block-callout-editor">' +
      '<select name="block_callout_variant_' + idx + '" class="block-select" onchange="markUnsaved()">' +
        '<option value="info"' + ((block.variant || 'info') === 'info' ? ' selected' : '') + '>Info (vert)</option>' +
        '<option value="warning"' + (block.variant === 'warning' ? ' selected' : '') + '>Attention (orange)</option>' +
      '</select>' +
      '<textarea name="block_callout_html_' + idx + '" class="block-textarea" rows="4" oninput="markUnsaved()" placeholder="Contenu de l\'encadré (HTML supporté)...">' + esc(block.html || '') + '</textarea>' +
    '</div>';
  }

  /* ─── Table ─── */
  function renderTableEditor(idx, block) {
    var headers = block.headers || ['Colonne 1', 'Colonne 2'];
    var rows = block.rows || [['', '']];
    var html = '<div class="block-table-editor" id="block-table-' + idx + '">';

    // Headers
    html += '<div class="block-table-row block-table-header-row">';
    headers.forEach(function (h, ci) {
      html += '<input type="text" class="block-table-cell block-table-th" value="' + escAttr(h) + '" placeholder="En-tête" oninput="markUnsaved()">';
    });
    html += '<button type="button" class="block-btn-sm block-btn-add-col" onclick="addTableCol(' + idx + ')" title="Ajouter colonne">+</button>';
    html += '</div>';

    // Rows
    rows.forEach(function (row, ri) {
      html += '<div class="block-table-row" data-row="' + ri + '">';
      row.forEach(function (cell, ci) {
        html += '<input type="text" class="block-table-cell" value="' + escAttr(cell) + '" placeholder="..." oninput="markUnsaved()">';
      });
      html += '<button type="button" class="block-btn-sm block-btn-rm" onclick="removeTableRow(' + idx + ',' + ri + ')" title="Supprimer">&#10005;</button>';
      html += '</div>';
    });

    html += '<div class="block-table-actions">';
    html += '<button type="button" class="btn-add-sm" onclick="addTableRow(' + idx + ')">+ Ligne</button>';
    if (headers.length > 2) {
      html += '<button type="button" class="btn-add-sm btn-add-sm-danger" onclick="removeTableCol(' + idx + ')">- Colonne</button>';
    }
    html += '</div>';
    html += '</div>';
    return html;
  }

  /* ─── List ─── */
  function renderListEditor(idx, block) {
    var items = block.items || [''];
    var style = block.style || 'bullet';
    var html = '<div class="block-list-editor" id="block-list-' + idx + '">';
    html += '<select name="block_list_style_' + idx + '" class="block-select" onchange="markUnsaved()">' +
      '<option value="bullet"' + (style === 'bullet' ? ' selected' : '') + '>Puces</option>' +
      '<option value="numbered"' + (style === 'numbered' ? ' selected' : '') + '>Numérotée</option>' +
    '</select>';

    html += '<div class="block-list-items">';
    items.forEach(function (item, li) {
      var marker = style === 'numbered' ? (li + 1) + '.' : '•';
      html += '<div class="block-list-item">' +
        '<span class="block-list-marker">' + marker + '</span>' +
        '<input type="text" class="block-input-wide" value="' + escAttr(item) + '" placeholder="Élément de liste" oninput="markUnsaved()">' +
        '<button type="button" class="block-btn-sm block-btn-rm" onclick="removeListItem(' + idx + ',' + li + ')">&#10005;</button>' +
      '</div>';
    });
    html += '</div>';
    html += '<button type="button" class="btn-add-sm" onclick="addListItem(' + idx + ')">+ Élément</button>';
    html += '</div>';
    return html;
  }

  /* ─── Image ─── */
  function renderImageEditor(idx, block) {
    return '<div class="block-image-editor">' +
      '<div class="block-field-row">' +
        '<div class="block-field-grow"><label>URL de l\'image</label>' +
        '<input type="url" name="block_image_src_' + idx + '" value="' + escAttr(block.src || '') + '" placeholder="https://..." oninput="markUnsaved()"></div>' +
      '</div>' +
      '<div class="block-field-row">' +
        '<div class="block-field-grow"><label>Texte alternatif (SEO)</label>' +
        '<input type="text" name="block_image_alt_' + idx + '" value="' + escAttr(block.alt || '') + '" placeholder="Description de l\'image" oninput="markUnsaved()"></div>' +
        '<div class="block-field-grow"><label>Légende (optionnel)</label>' +
        '<input type="text" name="block_image_caption_' + idx + '" value="' + escAttr(block.caption || '') + '" placeholder="Légende sous l\'image" oninput="markUnsaved()"></div>' +
      '</div>' +
      (block.src ? '<img src="' + escAttr(block.src) + '" class="block-image-preview" alt="Aperçu">' : '') +
    '</div>';
  }

  /* ─── Grid ─── */
  function renderGridEditor(idx, block) {
    var columns = block.columns || 3;
    var items = block.items || [{ title: '', description: '' }];
    var html = '<div class="block-grid-editor" id="block-grid-' + idx + '">';
    html += '<select name="block_grid_columns_' + idx + '" class="block-select" onchange="markUnsaved()">' +
      '<option value="2"' + (columns === 2 ? ' selected' : '') + '>2 colonnes</option>' +
      '<option value="3"' + (columns === 3 ? ' selected' : '') + '>3 colonnes</option>' +
    '</select>';

    html += '<div class="block-grid-items">';
    items.forEach(function (item, gi) {
      html += '<div class="block-grid-card-editor">' +
        '<div class="block-grid-card-header">' +
          '<span>Carte ' + (gi + 1) + '</span>' +
          '<button type="button" class="block-btn-sm block-btn-rm" onclick="removeGridCard(' + idx + ',' + gi + ')">&#10005;</button>' +
        '</div>' +
        '<input type="text" class="block-input-wide" value="' + escAttr(item.title || '') + '" placeholder="Titre de la carte" oninput="markUnsaved()">' +
        '<textarea class="block-textarea-sm" rows="2" placeholder="Description" oninput="markUnsaved()">' + esc(item.description || '') + '</textarea>' +
      '</div>';
    });
    html += '</div>';
    html += '<button type="button" class="btn-add-sm" onclick="addGridCard(' + idx + ')">+ Carte</button>';
    html += '</div>';
    return html;
  }

  /* ─── FAQ ─── */
  function renderFaqEditor(idx, block) {
    var items = block.items || [{ question: '', answer: '' }];
    var html = '<div class="block-faq-editor" id="block-faq-' + idx + '">';
    items.forEach(function (item, fi) {
      html += '<div class="block-faq-item">' +
        '<div class="block-faq-item-header">' +
          '<span class="block-faq-num">Q' + (fi + 1) + '</span>' +
          '<button type="button" class="block-btn-sm block-btn-rm" onclick="removeFaqItem(' + idx + ',' + fi + ')">&#10005;</button>' +
        '</div>' +
        '<input type="text" class="block-input-wide" value="' + escAttr(item.question || '') + '" placeholder="Question" oninput="markUnsaved()">' +
        '<textarea class="block-textarea-sm" rows="3" placeholder="Réponse" oninput="markUnsaved()">' + esc(item.answer || '') + '</textarea>' +
      '</div>';
    });
    html += '<button type="button" class="btn-add-sm" onclick="addFaqItem(' + idx + ')">+ Question</button>';
    html += '</div>';
    return html;
  }

  /* ─── Block Picker ─── */
  function renderBlockPicker(afterIdx) {
    var html = '<div class="block-picker-zone">';
    html += '<button type="button" class="block-picker-trigger" onclick="togglePicker(this)">+ Ajouter un bloc</button>';
    html += '<div class="block-picker-dropdown" style="display:none">';
    html += '<div class="block-picker-grid">';
    Object.keys(BLOCK_TYPES).forEach(function (type) {
      var bt = BLOCK_TYPES[type];
      html += '<button type="button" class="block-picker-btn" onclick="addBlock(\'' + type + '\',' + afterIdx + ')" title="' + bt.label + '">' +
        '<span class="block-picker-icon" style="background:' + bt.color + '">' + bt.icon + '</span>' +
        '<span>' + bt.label + '</span>' +
      '</button>';
    });
    html += '</div></div></div>';
    return html;
  }

  /* ─── Block Picker Toggle ─── */
  window.togglePicker = function (btn) {
    var dd = btn.nextElementSibling;
    // Close all other pickers
    document.querySelectorAll('.block-picker-dropdown').forEach(function (el) {
      if (el !== dd) el.style.display = 'none';
    });
    dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
  };

  // Close pickers on outside click
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.block-picker-zone')) {
      document.querySelectorAll('.block-picker-dropdown').forEach(function (el) {
        el.style.display = 'none';
      });
    }
  });

  /* ─── Block CRUD Operations ─── */

  window.addBlock = function (type, afterIdx) {
    var list = document.getElementById('blocks-list');
    if (!list) return;

    var defaults = {
      heading:   { type: 'heading', text: '', level: 'h2' },
      paragraph: { type: 'paragraph', html: '' },
      callout:   { type: 'callout', html: '', variant: 'info' },
      table:     { type: 'table', headers: ['Colonne 1', 'Colonne 2', 'Colonne 3'], rows: [['', '', '']] },
      list:      { type: 'list', items: [''], style: 'bullet' },
      image:     { type: 'image', src: '', alt: '', caption: '' },
      grid:      { type: 'grid', columns: 3, items: [{ title: '', description: '' }, { title: '', description: '' }, { title: '', description: '' }] },
      faq:       { type: 'faq', items: [{ question: '', answer: '' }] }
    };

    var block = defaults[type] || defaults.paragraph;
    var newIdx = afterIdx + 1;
    var newHtml = renderBlockWrapper(newIdx, block);

    if (afterIdx < 0) {
      // Insert at beginning
      list.insertAdjacentHTML('afterbegin', newHtml);
    } else {
      var items = list.querySelectorAll('.block-item');
      if (items[afterIdx]) {
        items[afterIdx].insertAdjacentHTML('afterend', newHtml);
      } else {
        list.insertAdjacentHTML('beforeend', newHtml);
      }
    }

    reindexBlocks();
    markUnsaved();

    // Close all pickers
    document.querySelectorAll('.block-picker-dropdown').forEach(function (el) {
      el.style.display = 'none';
    });
  };

  window.deleteBlock = function (idx) {
    var list = document.getElementById('blocks-list');
    if (!list) return;
    var items = list.querySelectorAll('.block-item');
    if (items[idx]) {
      items[idx].remove();
      reindexBlocks();
      markUnsaved();
    }
  };

  window.moveBlock = function (idx, direction) {
    var list = document.getElementById('blocks-list');
    if (!list) return;
    var items = Array.from(list.querySelectorAll('.block-item'));
    var targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    // Collect current blocks, swap, re-render
    var blocks = window.collectAllBlocks();
    var temp = blocks[idx];
    blocks[idx] = blocks[targetIdx];
    blocks[targetIdx] = temp;

    // Re-render
    var html = '';
    blocks.forEach(function (block, i) {
      html += renderBlockWrapper(i, block);
    });
    list.innerHTML = html;
    markUnsaved();
  };

  function reindexBlocks() {
    var list = document.getElementById('blocks-list');
    if (!list) return;
    var items = list.querySelectorAll('.block-item');
    items.forEach(function (item, i) {
      item.setAttribute('data-idx', i);
    });
  }

  /* ─── Block Data Collectors ─── */

  window.collectAllBlocks = function () {
    var list = document.getElementById('blocks-list');
    if (!list) return [];
    var blocks = [];
    list.querySelectorAll('.block-item').forEach(function (el) {
      var type = el.getAttribute('data-type');
      var block = collectBlock(el, type);
      if (block) blocks.push(block);
    });
    return blocks;
  };

  function collectBlock(el, type) {
    switch (type) {
      case 'heading':   return collectHeading(el);
      case 'paragraph': return collectParagraph(el);
      case 'callout':   return collectCallout(el);
      case 'table':     return collectTable(el);
      case 'list':      return collectList(el);
      case 'image':     return collectImage(el);
      case 'grid':      return collectGrid(el);
      case 'faq':       return collectFaq(el);
      default:          return collectParagraph(el);
    }
  }

  function collectHeading(el) {
    var levelSel = el.querySelector('select[name^="block_heading_level_"]');
    var textInp = el.querySelector('input[name^="block_heading_text_"]');
    return {
      type: 'heading',
      level: levelSel ? levelSel.value : 'h2',
      text: textInp ? textInp.value.trim() : ''
    };
  }

  function collectParagraph(el) {
    var editor = el.querySelector('.rich-editor');
    return {
      type: 'paragraph',
      html: editor ? editor.innerHTML.trim() : ''
    };
  }

  function collectCallout(el) {
    var variantSel = el.querySelector('select[name^="block_callout_variant_"]');
    var htmlArea = el.querySelector('textarea[name^="block_callout_html_"]');
    return {
      type: 'callout',
      variant: variantSel ? variantSel.value : 'info',
      html: htmlArea ? htmlArea.value.trim() : ''
    };
  }

  function collectTable(el) {
    var headers = [];
    el.querySelectorAll('.block-table-header-row .block-table-th').forEach(function (inp) {
      headers.push(inp.value.trim());
    });
    var rows = [];
    el.querySelectorAll('.block-table-row[data-row]').forEach(function (row) {
      var cells = [];
      row.querySelectorAll('.block-table-cell').forEach(function (inp) {
        cells.push(inp.value.trim());
      });
      rows.push(cells);
    });
    return { type: 'table', headers: headers, rows: rows };
  }

  function collectList(el) {
    var styleSel = el.querySelector('select[name^="block_list_style_"]');
    var items = [];
    el.querySelectorAll('.block-list-item input').forEach(function (inp) {
      items.push(inp.value.trim());
    });
    return {
      type: 'list',
      style: styleSel ? styleSel.value : 'bullet',
      items: items
    };
  }

  function collectImage(el) {
    var src = el.querySelector('input[name^="block_image_src_"]');
    var alt = el.querySelector('input[name^="block_image_alt_"]');
    var caption = el.querySelector('input[name^="block_image_caption_"]');
    return {
      type: 'image',
      src: src ? src.value.trim() : '',
      alt: alt ? alt.value.trim() : '',
      caption: caption ? caption.value.trim() : ''
    };
  }

  function collectGrid(el) {
    var colSel = el.querySelector('select[name^="block_grid_columns_"]');
    var items = [];
    el.querySelectorAll('.block-grid-card-editor').forEach(function (card) {
      var titleInp = card.querySelector('input');
      var descArea = card.querySelector('textarea');
      items.push({
        title: titleInp ? titleInp.value.trim() : '',
        description: descArea ? descArea.value.trim() : ''
      });
    });
    return {
      type: 'grid',
      columns: colSel ? parseInt(colSel.value) : 3,
      items: items
    };
  }

  function collectFaq(el) {
    var items = [];
    el.querySelectorAll('.block-faq-item').forEach(function (faqEl) {
      var q = faqEl.querySelector('input');
      var a = faqEl.querySelector('textarea');
      items.push({
        question: q ? q.value.trim() : '',
        answer: a ? a.value.trim() : ''
      });
    });
    return { type: 'faq', items: items };
  }

  /* ─── Rich Text Commands ─── */
  window.execRich = function (idx, cmd) {
    var editor = document.querySelector('.rich-editor[data-block-idx="' + idx + '"]');
    if (!editor) return;
    editor.focus();

    if (cmd === 'bold') {
      document.execCommand('bold', false, null);
    } else if (cmd === 'italic') {
      document.execCommand('italic', false, null);
    } else if (cmd === 'link') {
      var sel = window.getSelection();
      var text = sel.toString();
      var url = prompt('URL du lien :', 'https://');
      if (!url) return;
      var isExternal = url.indexOf('http') === 0 && url.indexOf('afem-edu.fr') === -1;
      if (text) {
        var a = '<a href="' + url + '"' + (isExternal ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + text + '</a>';
        document.execCommand('insertHTML', false, a);
      } else {
        var linkText = prompt('Texte du lien :', '');
        if (!linkText) return;
        var a = '<a href="' + url + '"' + (isExternal ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + linkText + '</a>';
        document.execCommand('insertHTML', false, a);
      }
    }
    markUnsaved();
  };

  /* ─── Table Dynamic Operations ─── */
  window.addTableRow = function (blockIdx) {
    var blocks = window.collectAllBlocks();
    var block = blocks[blockIdx];
    if (!block || block.type !== 'table') return;
    var colCount = block.headers.length;
    block.rows.push(new Array(colCount).fill(''));
    rerenderBlock(blockIdx, block);
  };

  window.removeTableRow = function (blockIdx, rowIdx) {
    var blocks = window.collectAllBlocks();
    var block = blocks[blockIdx];
    if (!block || block.type !== 'table' || block.rows.length <= 1) return;
    block.rows.splice(rowIdx, 1);
    rerenderBlock(blockIdx, block);
  };

  window.addTableCol = function (blockIdx) {
    var blocks = window.collectAllBlocks();
    var block = blocks[blockIdx];
    if (!block || block.type !== 'table') return;
    block.headers.push('Colonne ' + (block.headers.length + 1));
    block.rows.forEach(function (row) { row.push(''); });
    rerenderBlock(blockIdx, block);
  };

  window.removeTableCol = function (blockIdx) {
    var blocks = window.collectAllBlocks();
    var block = blocks[blockIdx];
    if (!block || block.type !== 'table' || block.headers.length <= 2) return;
    block.headers.pop();
    block.rows.forEach(function (row) { row.pop(); });
    rerenderBlock(blockIdx, block);
  };

  /* ─── List Dynamic Operations ─── */
  window.addListItem = function (blockIdx) {
    var blocks = window.collectAllBlocks();
    var block = blocks[blockIdx];
    if (!block || block.type !== 'list') return;
    block.items.push('');
    rerenderBlock(blockIdx, block);
  };

  window.removeListItem = function (blockIdx, itemIdx) {
    var blocks = window.collectAllBlocks();
    var block = blocks[blockIdx];
    if (!block || block.type !== 'list' || block.items.length <= 1) return;
    block.items.splice(itemIdx, 1);
    rerenderBlock(blockIdx, block);
  };

  /* ─── Grid Dynamic Operations ─── */
  window.addGridCard = function (blockIdx) {
    var blocks = window.collectAllBlocks();
    var block = blocks[blockIdx];
    if (!block || block.type !== 'grid') return;
    block.items.push({ title: '', description: '' });
    rerenderBlock(blockIdx, block);
  };

  window.removeGridCard = function (blockIdx, cardIdx) {
    var blocks = window.collectAllBlocks();
    var block = blocks[blockIdx];
    if (!block || block.type !== 'grid' || block.items.length <= 1) return;
    block.items.splice(cardIdx, 1);
    rerenderBlock(blockIdx, block);
  };

  /* ─── FAQ Dynamic Operations ─── */
  window.addFaqItem = function (blockIdx) {
    var blocks = window.collectAllBlocks();
    var block = blocks[blockIdx];
    if (!block || block.type !== 'faq') return;
    block.items.push({ question: '', answer: '' });
    rerenderBlock(blockIdx, block);
  };

  window.removeFaqItem = function (blockIdx, itemIdx) {
    var blocks = window.collectAllBlocks();
    var block = blocks[blockIdx];
    if (!block || block.type !== 'faq' || block.items.length <= 1) return;
    block.items.splice(itemIdx, 1);
    rerenderBlock(blockIdx, block);
  };

  /* ─── Re-render a single block in place ─── */
  function rerenderBlock(blockIdx, block) {
    var list = document.getElementById('blocks-list');
    if (!list) return;
    var items = list.querySelectorAll('.block-item');
    if (!items[blockIdx]) return;
    var newHtml = renderBlockWrapper(blockIdx, block);
    items[blockIdx].outerHTML = newHtml;
    markUnsaved();
  }

  /* ─── Convert legacy AI output to blocks ─── */
  window.convertLegacyToBlocks = function (aiData) {
    var blocks = [];
    (aiData.sections || []).forEach(function (sec) {
      if (sec.type) {
        // Already in block format
        blocks.push(sec);
      } else {
        // Legacy format: { heading, html }
        if (sec.heading) blocks.push({ type: 'heading', text: sec.heading, level: 'h2' });
        if (sec.html) blocks.push({ type: 'paragraph', html: sec.html });
      }
    });
    if (aiData.faq && aiData.faq.length) {
      blocks.push({ type: 'faq', items: aiData.faq });
    }
    return blocks;
  };

})();

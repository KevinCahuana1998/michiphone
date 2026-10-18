/* ============================================
   MichiPhone - app.js
   Lógica principal: catálogo, filtros, cards
   ============================================ */

(function ($) {
  'use strict';

  // --- State ---
  var equipos = [];
  var filteredEquipos = [];

  // --- DOM references ---
  var $grid = $('#productsGrid');
  var $filterModel = $('#filterModel');
  var $filterCapacity = $('#filterCapacity');
  var $btnClearFilters = $('#btnClearFilters');
  var $resultsCount = $('#resultsCount');
  var $loadingState = $('#loadingState');
  var $mobileMenuBtn = $('#mobileMenuBtn');
  var $mainNav = $('#mainNav');

  // --- Helpers ---

  /**
   * Format a number as Peruvian soles with two decimals
   */
  function formatPrice(value) {
    if (value === null || value === undefined || isNaN(value)) {
      return null;
    }
    return 'S/\u00a0' + Number(value).toFixed(2);
  }

  /**
   * Sanitize text content to prevent XSS — returns a text node string
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /**
   * Validate that a URL path looks reasonable for an image
   */
  function isValidImagePath(url) {
    if (typeof url !== 'string' || url.trim() === '') return false;
    // Only allow relative paths starting with img/ or similar safe patterns
    return /^[a-zA-Z0-9_./-]+\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url.trim());
  }

  var DEFAULT_IMAGE = 'img/fotopordefecto.jpg';

  /**
   * Generate the image HTML with fallback to default image
   */
  function buildImageHtml(url, alt) {
    var safeAlt = escapeHtml(alt || 'Imagen del equipo');
    var initialSrc = isValidImagePath(url) ? escapeHtml(url.trim()) : DEFAULT_IMAGE;
    return '<img src="' + initialSrc + '" alt="' + safeAlt + '" loading="lazy" onerror="if (this.src.indexOf(\'' + DEFAULT_IMAGE + '\') === -1) { this.src = \'' + DEFAULT_IMAGE + '\'; }">';
  }

  // --- Render ---

  /**
   * Build a single product card HTML
   */
  function buildCard(equipo) {
    var hasDiscount = equipo.HayDescuento === true && equipo.PrecioOferta != null && !isNaN(equipo.PrecioOferta);
    var isLiquidation = equipo.EsLiquidacion === true;

    var html = '';
    html += '<article class="product-card">';

    // Badges
    if (hasDiscount || isLiquidation) {
      html += '<div class="card-badges">';
      if (hasDiscount && equipo.PorcentajeDescuento > 0) {
        html += '<span class="badge badge-discount">' + escapeHtml(String(equipo.PorcentajeDescuento)) + '% OFF</span>';
      }
      if (isLiquidation) {
        html += '<span class="badge badge-liquidation">Liquidación</span>';
      }
      html += '</div>';
    }

    // Image
    html += '<div class="card-image">';
    html += '<a href="detalle.html?id=' + encodeURIComponent(equipo.Id) + '" aria-label="Ver detalle de ' + escapeHtml(equipo.Modelo) + '">';
    html += buildImageHtml(equipo.UrlFotoPrincipal, equipo.Modelo + ' - ' + equipo.Capacidad);
    html += '</a>';
    html += '</div>';

    // Body
    html += '<div class="card-body">';
    html += '<div class="card-info">';

    // Left: model + capacity + color
    html += '<div class="card-details">';
    html += '<h3 class="card-model"><a href="detalle.html?id=' + encodeURIComponent(equipo.Id) + '">' + escapeHtml(equipo.Modelo) + '</a></h3>';
    html += '<p class="card-capacity">' + escapeHtml(equipo.Capacidad) + '</p>';
    if (equipo.Color) {
      html += '<p class="card-color"><i class="fa-solid fa-palette"></i> ' + escapeHtml(equipo.Color) + '</p>';
    }
    html += '</div>';

    // Right: pricing
    html += '<div class="card-pricing">';
    if (hasDiscount) {
      html += '<p class="price-original">' + escapeHtml(formatPrice(equipo.Precio)) + '</p>';
      html += '<p class="price-offer">' + escapeHtml(formatPrice(equipo.PrecioOferta)) + '</p>';
      if (equipo.PorcentajeDescuento > 0) {
        html += '<span class="discount-pill">-' + escapeHtml(String(equipo.PorcentajeDescuento)) + '%</span>';
      }
    } else {
      html += '<p class="price-normal">' + escapeHtml(formatPrice(equipo.Precio)) + '</p>';
    }
    html += '</div>';

    html += '</div>'; // .card-info

    // Button
    html += '<a href="detalle.html?id=' + encodeURIComponent(equipo.Id) + '" class="btn-detail">Ver detalle</a>';

    html += '</div>'; // .card-body
    html += '</article>';

    return html;
  }

  /**
   * Render all filtered products into the grid
   */
  function renderProducts() {
    $grid.empty();

    if (filteredEquipos.length === 0) {
      var noResultsHtml = '<div class="state-message">';
      noResultsHtml += '<i class="fa-solid fa-magnifying-glass"></i>';
      noResultsHtml += '<h3>No se encontraron equipos</h3>';
      noResultsHtml += '<p>Intenta con otros filtros o explora todo nuestro catálogo.</p>';
      noResultsHtml += '<button class="btn-clear-filters" id="btnClearFiltersEmpty" type="button"><i class="fa-solid fa-rotate-left"></i> Limpiar filtros</button>';
      noResultsHtml += '</div>';
      $grid.html(noResultsHtml);

      // Bind clear button inside the empty state
      $('#btnClearFiltersEmpty').on('click', clearFilters);
    } else {
      var cardsHtml = '';
      for (var i = 0; i < filteredEquipos.length; i++) {
        cardsHtml += buildCard(filteredEquipos[i]);
      }
      $grid.html(cardsHtml);
    }

    updateResultsCount();
  }

  /**
   * Update the results counter text
   */
  function updateResultsCount() {
    var total = equipos.length;
    var shown = filteredEquipos.length;

    if (total === 0) {
      $resultsCount.html('');
      return;
    }

    if (shown === total) {
      $resultsCount.html('Mostrando <strong>' + total + '</strong> equipo' + (total !== 1 ? 's' : ''));
    } else {
      $resultsCount.html('Mostrando <strong>' + shown + '</strong> de <strong>' + total + '</strong> equipo' + (total !== 1 ? 's' : ''));
    }
  }

  // --- Filters ---

  /**
   * Populate the capacity dropdown from unique values in equipos
   */
  function populateCapacityFilter() {
    var capacities = [];
    var seen = {};
    for (var i = 0; i < equipos.length; i++) {
      var cap = equipos[i].Capacidad;
      if (cap && !seen[cap]) {
        seen[cap] = true;
        capacities.push(cap);
      }
    }

    // Sort capacities by numeric value
    capacities.sort(function (a, b) {
      var numA = parseInt(a, 10) || 0;
      var numB = parseInt(b, 10) || 0;
      // Handle TB vs GB
      if (a.indexOf('TB') !== -1) numA *= 1024;
      if (b.indexOf('TB') !== -1) numB *= 1024;
      return numA - numB;
    });

    $filterCapacity.find('option:not(:first)').remove();
    for (var j = 0; j < capacities.length; j++) {
      var $option = $('<option></option>');
      $option.val(capacities[j]).text(capacities[j]);
      $filterCapacity.append($option);
    }
  }

  /**
   * Apply both filters and re-render
   */
  function applyFilters() {
    var searchText = $filterModel.val().trim().toLowerCase();
    var selectedCapacity = $filterCapacity.val();

    filteredEquipos = equipos.filter(function (equipo) {
      var matchesModel = true;
      var matchesCapacity = true;

      if (searchText) {
        matchesModel = equipo.Modelo && equipo.Modelo.toLowerCase().indexOf(searchText) !== -1;
      }

      if (selectedCapacity) {
        matchesCapacity = equipo.Capacidad === selectedCapacity;
      }

      return matchesModel && matchesCapacity;
    });

    renderProducts();
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    $filterModel.val('');
    $filterCapacity.val('');
    filteredEquipos = equipos.slice();
    renderProducts();
  }

  // --- Error States ---

  function showError(message) {
    var errorHtml = '<div class="state-message">';
    errorHtml += '<i class="fa-solid fa-triangle-exclamation"></i>';
    errorHtml += '<h3>Error al cargar el catálogo</h3>';
    errorHtml += '<p>' + escapeHtml(message || 'Asegúrate de ejecutar la web con un servidor local (ej: Live Server).') + '</p>';
    errorHtml += '</div>';
    $grid.html(errorHtml);
  }

  function showEmpty() {
    var emptyHtml = '<div class="state-message">';
    emptyHtml += '<i class="fa-solid fa-box-open"></i>';
    emptyHtml += '<h3>No hay equipos disponibles</h3>';
    emptyHtml += '<p>Pronto agregaremos nuevos modelos. ¡Vuelve a visitarnos!</p>';
    emptyHtml += '</div>';
    $grid.html(emptyHtml);
  }

  // --- Mobile Menu ---

  function initMobileMenu() {
    $mobileMenuBtn.on('click', function () {
      var isOpen = $mainNav.hasClass('active');
      $mainNav.toggleClass('active');
      $mobileMenuBtn.attr('aria-expanded', !isOpen);
      $mobileMenuBtn.find('i')
        .toggleClass('fa-bars', isOpen)
        .toggleClass('fa-xmark', !isOpen);
    });

    // Close menu when clicking a link
    $mainNav.on('click', 'a', function () {
      $mainNav.removeClass('active');
      $mobileMenuBtn.attr('aria-expanded', 'false');
      $mobileMenuBtn.find('i').removeClass('fa-xmark').addClass('fa-bars');
    });
  }

  // --- Init ---

  function init() {
    initMobileMenu();

    // Load data
    $.getJSON('json/equipos.json')
      .done(function (data) {
        if (!Array.isArray(data)) {
          showError('El formato de equipos.json no es válido.');
          return;
        }

        equipos = data;
        filteredEquipos = equipos.slice();

        if (equipos.length === 0) {
          $loadingState.remove();
          showEmpty();
          return;
        }

        populateCapacityFilter();
        renderProducts();
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        $loadingState.remove();
        showError('No se pudo cargar el archivo equipos.json. ' + (errorThrown || textStatus));
      });

    // Bind filters
    $filterModel.on('input', applyFilters);
    $filterCapacity.on('change', applyFilters);
    $btnClearFilters.on('click', clearFilters);
  }

  // Run on DOM ready
  $(document).ready(init);

})(jQuery);

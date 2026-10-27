/* ============================================
   MichiPhone - detalle.js
   Lógica de la pantalla de detalle del equipo
   ============================================ */

(function ($) {
  'use strict';

  // --- DOM references ---
  var $detailContainer = $('#detailContainer');
  var $breadcrumbModel = $('#breadcrumbModel');
  var $mobileMenuBtn = $('#mobileMenuBtn');
  var $mainNav = $('#mainNav');

  // --- Helpers ---

  function formatPrice(value) {
    if (value === null || value === undefined || isNaN(value)) {
      return null;
    }
    return 'S/\u00a0' + Number(value).toFixed(2);
  }

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function isValidImagePath(url) {
    if (typeof url !== 'string' || url.trim() === '') return false;
    return /^[a-zA-Z0-9_./-]+\.(png|jpg|jpeg|gif|webp|svg)$/i.test(url.trim());
  }

  /**
   * Get the equipment ID from the URL query string
   */
  function getEquipoIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var idStr = params.get('id');
    if (idStr === null || idStr.trim() === '') return null;
    var id = parseInt(idStr, 10);
    if (isNaN(id) || id <= 0) return null;
    return id;
  }

  /**
   * Build WhatsApp URL with dynamic message
   */
  function buildWhatsAppUrl(equipo) {
    var details = equipo.Modelo + ' de ' + equipo.Capacidad;
    if (equipo.Color) {
      details += ' (' + equipo.Color + ')';
    }
    var message = 'Hola, estoy interesado en el ' + details + ' que vi en MichiPhone. ¿Sigue disponible?';
    return 'https://wa.me/51922072450?text=' + encodeURIComponent(message);
  }

  var DEFAULT_IMAGE = 'img/fotopordefecto.jpg';

  /**
   * Collect all unique photos for an equipment
   */
  function collectPhotos(equipo, fotosData) {
    var photos = [];
    var seen = {};

    // First: main photo
    if (isValidImagePath(equipo.UrlFotoPrincipal)) {
      var mainUrl = equipo.UrlFotoPrincipal.trim();
      photos.push(mainUrl);
      seen[mainUrl] = true;
    }

    // Then: additional photos from fotos.json
    if (Array.isArray(fotosData)) {
      for (var i = 0; i < fotosData.length; i++) {
        var foto = fotosData[i];
        if (foto.IdEquipo === equipo.Id && isValidImagePath(foto.UrlFoto)) {
          var url = foto.UrlFoto.trim();
          if (!seen[url]) {
            photos.push(url);
            seen[url] = true;
          }
        }
      }
    }

    // If no valid photos found, use the default photo
    if (photos.length === 0) {
      photos.push(DEFAULT_IMAGE);
    }

    return photos;
  }

  // --- Render ---

  /**
   * Render the full product detail
   */
  function renderDetail(equipo, photos) {
    var hasDiscount = equipo.HayDescuento === true && equipo.PrecioOferta != null && !isNaN(equipo.PrecioOferta);
    var isLiquidation = equipo.EsLiquidacion === true;
    var hasMultiplePhotos = photos.length > 1;

    var html = '<div class="detail-grid">';

    // --- Left column: Gallery ---
    html += '<div class="detail-gallery">';

    if (photos.length === 0) {
      // Fallback single image
      html += '<div class="gallery-single">';
      html += '<img src="' + DEFAULT_IMAGE + '" alt="' + escapeHtml(equipo.Modelo) + '">';
      html += '</div>';
    } else if (photos.length === 1) {
      // Single image, no slider needed
      html += '<div class="gallery-single">';
      html += '<img src="' + escapeHtml(photos[0]) + '" alt="' + escapeHtml(equipo.Modelo) + '" onerror="if (this.src.indexOf(\'' + DEFAULT_IMAGE + '\') === -1) { this.src = \'' + DEFAULT_IMAGE + '\'; }">';
      html += '</div>';
    } else {
      // Multiple images: use Slick slider
      html += '<div class="gallery-main" id="galleryMain">';
      for (var i = 0; i < photos.length; i++) {
        html += '<div class="slide">';
        html += '<img src="' + escapeHtml(photos[i]) + '" alt="' + escapeHtml(equipo.Modelo + ' - Foto ' + (i + 1)) + '" onerror="if (this.src.indexOf(\'' + DEFAULT_IMAGE + '\') === -1) { this.src = \'' + DEFAULT_IMAGE + '\'; }">';
        html += '</div>';
      }
      html += '</div>';

      // Thumbnails
      html += '<div class="gallery-thumbs" id="galleryThumbs">';
      for (var j = 0; j < photos.length; j++) {
        html += '<div class="thumb-slide">';
        html += '<div class="thumb-wrapper">';
        html += '<img src="' + escapeHtml(photos[j]) + '" alt="Miniatura ' + (j + 1) + '" onerror="if (this.src.indexOf(\'' + DEFAULT_IMAGE + '\') === -1) { this.src = \'' + DEFAULT_IMAGE + '\'; }">';
        html += '</div>';
        html += '</div>';
      }
      html += '</div>';
    }

    html += '</div>'; // .detail-gallery

    // --- Right column: Info ---
    html += '<div class="detail-info">';

    // Model + Capacity + Color
    html += '<h1 class="detail-model">' + escapeHtml(equipo.Modelo) + '</h1>';
    html += '<p class="detail-capacity">' + escapeHtml(equipo.Capacidad) + '</p>';
    if (equipo.Color) {
      html += '<p class="detail-color"><span class="detail-color-label">Color:</span> <span class="detail-color-value">' + escapeHtml(equipo.Color) + '</span></p>';
    }

    // Pricing block
    html += '<div class="detail-pricing">';
    if (hasDiscount) {
      html += '<p class="detail-price-original">' + escapeHtml(formatPrice(equipo.Precio)) + '</p>';
      html += '<p class="detail-price-offer">' + escapeHtml(formatPrice(equipo.PrecioOferta)) + '</p>';
      if (equipo.PorcentajeDescuento > 0) {
        html += '<span class="detail-discount-pill">-' + escapeHtml(String(equipo.PorcentajeDescuento)) + '% descuento</span>';
      }
    } else {
      html += '<p class="detail-price-normal">' + escapeHtml(formatPrice(equipo.Precio)) + '</p>';
    }
    if (isLiquidation) {
      html += '<span class="detail-badge-liquidation">Liquidación</span>';
    }
    html += '</div>';

    // Description
    if (equipo.Descripcion) {
      html += '<div class="detail-description">';
      html += '<h3>Descripción</h3>';
      html += '<p>' + escapeHtml(equipo.Descripcion) + '</p>';
      html += '</div>';
    }

    // Date
    if (equipo.FechaIngreso) {
      html += '<p class="detail-date"><i class="fa-regular fa-calendar"></i> Ingresado el ' + escapeHtml(equipo.FechaIngreso) + '</p>';
    }

    // WhatsApp button
    html += '<a href="' + buildWhatsAppUrl(equipo) + '" target="_blank" rel="noopener noreferrer" class="btn-whatsapp">';
    html += '<i class="fa-brands fa-whatsapp"></i>';
    html += 'Consultar por WhatsApp';
    html += '</a>';

    // Back link
    html += '<a href="index.html" class="btn-back"><i class="fa-solid fa-arrow-left"></i> Volver al catálogo</a>';

    html += '</div>'; // .detail-info
    html += '</div>'; // .detail-grid

    $detailContainer.html(html);

    // Update page title
    var fullTitle = equipo.Modelo + ' ' + equipo.Capacidad + (equipo.Color ? ' ' + equipo.Color : '');
    document.title = fullTitle + ' — MichiPhone';

    // Update breadcrumb
    $breadcrumbModel.text(fullTitle);

    // Initialize Slick if multiple photos
    if (hasMultiplePhotos) {
      initSlickSlider(photos.length);
    }

    // Update floating WhatsApp button URL to match product-specific message
    var $fab = $('#fabWhatsapp');
    if ($fab.length) {
      $fab.attr('href', buildWhatsAppUrl(equipo));
      initFabVisibility();
    }

    // Inicializar zoom (desktop) y lightbox (mobile) para la imagen principal
    initImageInteractions();
  }

  /**
   * Show/hide the floating WhatsApp button based on whether
   * the inline .btn-whatsapp is visible in the viewport.
   */
  function initFabVisibility() {
    var $fab = $('#fabWhatsapp');
    var $btnInline = null;

    function checkVisibility() {
      // Lazy-find the inline button (it's rendered dynamically)
      if (!$btnInline || !$btnInline.length) {
        $btnInline = $('.btn-whatsapp');
      }
      if (!$btnInline.length) return;

      var rect = $btnInline[0].getBoundingClientRect();
      var windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // The inline button is visible if any part of it is within the viewport
      var isVisible = rect.top < windowHeight && rect.bottom > 0;

      if (isVisible) {
        $fab.addClass('hidden');
      } else {
        $fab.removeClass('hidden');
      }
    }

    // Check on scroll and resize
    $(window).on('scroll', checkVisibility);
    $(window).on('resize', checkVisibility);

    // Initial check
    checkVisibility();
  }

  /**
   * Initialize Slick Carousel for gallery
   */
  function initSlickSlider(photoCount) {
    var $main = $('#galleryMain');
    var $thumbs = $('#galleryThumbs');

    // Determine how many thumbnails to show
    var thumbsToShow = Math.min(photoCount, 4);

    $main.slick({
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: true,
      dots: true,
      fade: true,
      infinite: true,
      speed: 400,
      cssEase: 'ease-in-out',
      adaptiveHeight: false,
      swipe: false,       // Evita que Slick capture el gesto de deslizar en la principal
      touchMove: false,   // Evita el movimiento táctil en la principal
      draggable: false,   // Evita el arrastre con el mouse en la principal
      asNavFor: '#galleryThumbs',
      prevArrow: '<button type="button" class="slick-prev" aria-label="Foto anterior"><i class="fa-solid fa-chevron-left"></i></button>',
      nextArrow: '<button type="button" class="slick-next" aria-label="Foto siguiente"><i class="fa-solid fa-chevron-right"></i></button>'
    });

    $thumbs.slick({
      slidesToShow: thumbsToShow,
      slidesToScroll: 1,
      arrows: false,
      dots: false,
      infinite: true,
      focusOnSelect: true,
      asNavFor: '#galleryMain',
      // Las miniaturas conservan el swipe y drag por defecto para que puedas deslizarlas
      responsive: [
        {
          breakpoint: 480,
          settings: {
            slidesToShow: Math.min(photoCount, 3)
          }
        }
      ]
    });
  }

  // --- Zoom & Lightbox para imagen principal ---

  /**
   * Detecta si el dispositivo es móvil/tablet (touch principal)
   */
  function isMobileOrTablet() {
    return window.innerWidth <= 768;
  }

  /**
   * DESKTOP: Zoom con lupa circular sobre la imagen principal.
   * Se crea un div .zoom-lens que se posiciona donde está el cursor.
   */
  function initDesktopZoomLens() {
    // Crear el elemento de la lupa si no existe
    if ($('#zoomLens').length === 0) {
      $('body').append('<div class="zoom-lens" id="zoomLens"></div>');
    }

    var $lens = $('#zoomLens');
    var LENS_SIZE = 120;   // diámetro en px
    var ZOOM_FACTOR =0.8; // magnification

    // Seleccionar SOLO la imagen activa del slider principal o la imagen única
    function getMainImage() {
      var $active = $('#galleryMain .slick-active img');
      if ($active.length) return $active;
      var $single = $('.gallery-single img');
      if ($single.length) return $single;
      return null;
    }

    // Marcar imágenes principales como zoom-enabled
    function markZoomImages() {
      $('#galleryMain .slick-slide img').addClass('zoom-enabled');
      $('.gallery-single img').addClass('zoom-enabled');
    }

    // Handler: mousemove sobre la imagen
    function onMouseMove(e) {
      if (isMobileOrTablet()) return;

      var $img = $(e.target).closest('img.zoom-enabled');
      if (!$img.length) { $lens.removeClass('active'); return; }

      // Rectángulo de la imagen en el viewport
      var rect = $img[0].getBoundingClientRect();

      // Posición del cursor relativa a la imagen (0…1)
      var relX = (e.clientX - rect.left) / rect.width;
      var relY = (e.clientY - rect.top) / rect.height;

      // Limitar a los bordes
      if (relX < 0 || relX > 1 || relY < 0 || relY > 1) {
        $lens.removeClass('active');
        return;
      }

      // Obtener tamaño natural de la imagen
      var natW = $img[0].naturalWidth || rect.width;
      var natH = $img[0].naturalHeight || rect.height;

      // Tamaño de fondo con zoom
      var bgW = natW * ZOOM_FACTOR;
      var bgH = natH * ZOOM_FACTOR;

      // Posición del fondo para centrar el zoom en el cursor
      var bgX = -(relX * bgW) + LENS_SIZE / 2;
      var bgY = -(relY * bgH) + LENS_SIZE / 2;

      $lens.css({
        left: e.clientX + 'px',
        top: e.clientY + 'px',
        backgroundImage: 'url("' + $img.attr('src') + '")',
        backgroundSize: bgW + 'px ' + bgH + 'px',
        backgroundPosition: bgX + 'px ' + bgY + 'px'
      }).addClass('active');
    }

    function onMouseLeave() {
      $lens.removeClass('active');
    }

    // Delegamos en el contenedor de la galería para capturar dinámicamente
    $detailContainer
      .off('mousemove.zoomlens mouseleave.zoomlens')
      .on('mousemove.zoomlens', '.gallery-main .slick-slide, .gallery-single', onMouseMove)
      .on('mouseleave.zoomlens', '.gallery-main .slick-slide, .gallery-single', onMouseLeave);

    // Ocultar la lupa cuando se cambia de slide
    $(document).on('beforeChange', '#galleryMain', function () {
      $lens.removeClass('active');
    });

    markZoomImages();
  }

  /**
   * MOBILE / TABLET: Lightbox fullscreen al tocar la imagen principal.
   * Permite pinch-to-zoom nativo en la imagen ampliada.
   */
  function initMobileLightbox() {
    // Crear el overlay si no existe
    if ($('#imageLightbox').length === 0) {
      var overlayHtml =
        '<div class="image-lightbox-overlay" id="imageLightbox">' +
          '<button class="lightbox-close" aria-label="Cerrar">' +
            '<i class="fa-solid fa-xmark"></i>' +
          '</button>' +
          '<div class="lightbox-img-wrapper">' +
            '<img id="lightboxImg" src="" alt="Imagen ampliada">' +
          '</div>' +
          '<span class="lightbox-hint">Pellizca para hacer zoom · Toca fuera para cerrar</span>' +
        '</div>';
      $('body').append(overlayHtml);
    }

    var $overlay = $('#imageLightbox');
    var $lightboxImg = $('#lightboxImg');

    function openLightbox(imgSrc, altText) {
      $lightboxImg.attr('src', imgSrc).attr('alt', altText || 'Imagen ampliada');
      $overlay.addClass('active');
      // Prevenir scroll del body
      $('body').css('overflow', 'hidden');
    }

    function closeLightbox() {
      $overlay.removeClass('active');
      $('body').css('overflow', '');
    }

    // Abrir al tocar la imagen principal (solo mobile/tablet)
    $detailContainer
      .off('click.lightbox')
      .on('click.lightbox', '.gallery-main .slick-slide img, .gallery-single img', function (e) {
        if (!isMobileOrTablet()) return; // solo en móvil/tablet
        e.preventDefault();
        e.stopPropagation();
        var $img = $(this);
        openLightbox($img.attr('src'), $img.attr('alt'));
      });

    // Cerrar con el botón X
    $overlay.off('click.lightboxClose').on('click.lightboxClose', '.lightbox-close', function () {
      closeLightbox();
    });

    // Cerrar al tocar el overlay (fondo)
    $overlay.off('click.lightboxBg').on('click.lightboxBg', function (e) {
      if ($(e.target).is($overlay) || $(e.target).closest('.lightbox-hint').length) {
        closeLightbox();
      }
    });

    // Cerrar con tecla Escape
    $(document).off('keydown.lightbox').on('keydown.lightbox', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        closeLightbox();
      }
    });
  }

  /**
   * Inicializar ambos sistemas después de renderizar el detalle
   */
  function initImageInteractions() {
    initDesktopZoomLens();
    initMobileLightbox();
  }

  // --- Error States ---

  function showError(title, message) {
    $breadcrumbModel.text('Error');
    $detailContainer.html(
      '<div class="detail-error">' +
      '<i class="fa-solid fa-triangle-exclamation"></i>' +
      '<h2>' + escapeHtml(title) + '</h2>' +
      '<p>' + escapeHtml(message) + '</p>' +
      '<a href="index.html"><i class="fa-solid fa-arrow-left"></i> Volver al catálogo</a>' +
      '</div>'
    );
  }

  function showNotFound() {
    $breadcrumbModel.text('No encontrado');
    document.title = 'Equipo no encontrado — MichiPhone';
    $detailContainer.html(
      '<div class="detail-error">' +
      '<i class="fa-solid fa-mobile-screen-button"></i>' +
      '<h2>Equipo no encontrado</h2>' +
      '<p>El equipo que buscas no existe o ya no está disponible en nuestro catálogo.</p>' +
      '<a href="index.html"><i class="fa-solid fa-arrow-left"></i> Ver catálogo completo</a>' +
      '</div>'
    );
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

    $mainNav.on('click', 'a', function () {
      $mainNav.removeClass('active');
      $mobileMenuBtn.attr('aria-expanded', 'false');
      $mobileMenuBtn.find('i').removeClass('fa-xmark').addClass('fa-bars');
    });
  }

  // --- Init ---

  function init() {
    initMobileMenu();

    var equipoId = getEquipoIdFromUrl();

    if (equipoId === null) {
      showNotFound();
      return;
    }

    // Load both JSON files in parallel
    $.when(
      $.getJSON('json/equipos.json'),
      $.getJSON('json/fotos.json')
    ).done(function (equiposResult, fotosResult) {
      var equiposData = equiposResult[0];
      var fotosData = fotosResult[0];

      if (!Array.isArray(equiposData)) {
        showError('Error de datos', 'El formato de equipos.json no es válido.');
        return;
      }

      // Find the equipment by ID
      var equipo = null;
      for (var i = 0; i < equiposData.length; i++) {
        if (equiposData[i].Id === equipoId) {
          equipo = equiposData[i];
          break;
        }
      }

      if (!equipo) {
        showNotFound();
        return;
      }

      // Collect photos
      var photos = collectPhotos(equipo, fotosData);

      // Render
      renderDetail(equipo, photos);

    }).fail(function (jqXHR, textStatus, errorThrown) {
      showError('Error al cargar datos', 'No se pudieron leer los archivos JSON. Asegúrate de usar un servidor local (ej: Live Server). ' + (errorThrown || textStatus));
    });
  }

  // Run on DOM ready
  $(document).ready(init);

})(jQuery);

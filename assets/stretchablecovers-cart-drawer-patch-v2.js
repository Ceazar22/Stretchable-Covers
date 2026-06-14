(function () {
  'use strict';

  var DEBUG = Boolean((window.StretchableCartDrawerConfig || {}).debug);

  function log() {
    if (!DEBUG || !window.console) return;
    console.log.apply(console, arguments);
  }

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function money(cents) {
    cents = Number(cents || 0);

    if (window.Shopify && typeof window.Shopify.formatMoney === 'function') {
      return window.Shopify.formatMoney(cents, window.theme && window.theme.moneyFormat ? window.theme.moneyFormat : '${{amount}}');
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'USD'
    }).format(cents / 100);
  }

  function getEls() {
    return {
      trigger: $('#customCartTrigger'),
      drawer: $('#customCartDrawer'),
      overlay: $('#customCartOverlay'),
      closeBtn: $('#customCartClose'),
      body: $('#customCartBody'),
      footer: $('#customCartFooter'),
      count: $('#customCartCount'),
      subtotal: $('#customCartSubtotal'),
      itemLabel: $('#customCartItemLabel')
    };
  }

  function injectStyles() {
    if ($('#stretchable-cart-drawer-patch-styles')) return;

    var style = document.createElement('style');
    style.id = 'stretchable-cart-drawer-patch-styles';
    style.textContent = [
      '.custom-cart-drawer{height:100vh;height:100dvh;overflow:hidden;}',
      '.custom-cart-body{flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:18px;}',
      '.custom-cart-body.is-empty{overflow:hidden;padding-bottom:0;}',
      '.custom-cart-footer{flex:0 0 auto;}',
      '.custom-cart-item-properties{margin:4px 0 8px;font-family:Lato,Arial,sans-serif;font-size:13px;line-height:1.35;color:#555;}',
      '.custom-cart-item-property{margin-bottom:2px;}',
      '.custom-cart-item-property strong{font-weight:700;color:#333;}',
      '.custom-cart-error{padding:20px;font-family:Lato,Arial,sans-serif;color:#222;}',
      '.custom-cart-item{padding-bottom:18px;}',
      '.custom-cart-item + .custom-cart-item{border-top:1px solid #eee;}',
      '.custom-cart-item-price-each{font-size:12px;color:#666;font-weight:400;white-space:nowrap;}',
      '.custom-cart-item-price-compare{margin-left:6px;font-size:12px;color:#777;text-decoration:line-through;white-space:nowrap;}',
      '.custom-cart-item-discounts{list-style:none;margin:6px 0 0;padding:0;font-size:12px;color:#c62828;font-weight:600;}',
      '.custom-cart-item-discounts li{margin:0;}',
      '.custom-cart-summary-discount{display:flex;justify-content:space-between;gap:8px;margin-top:6px;color:#2d5b2e;font-weight:600;}',
      '.custom-cart-production-select-wrap{margin:0 30px 14px!important;padding:12px 14px;background:#f8f8f8;border:1px solid #e5e5e5;border-radius:8px;font-family:Lato,Arial,sans-serif;}',
      '.custom-cart-production-select-label{display:block;margin:0 0 8px;font-family:Raleway,Lato,Arial,sans-serif;font-size:15px;font-weight:800;line-height:1.25;color:#1f1f1f;}',
      '.custom-cart-production-select-control{position:relative;}',
      '.custom-cart-production-select-control:after{content:"";position:absolute;right:14px;top:50%;width:9px;height:9px;border-right:2px solid #0f2e53;border-bottom:2px solid #0f2e53;transform:translateY(-65%) rotate(45deg);pointer-events:none;}',
      '.custom-cart-production-select{display:block;width:100%;height:46px;border:1px solid #d7dbe3;border-radius:8px;background:#fff;appearance:none;-webkit-appearance:none;padding:0 42px 0 13px;font-family:Lato,Arial,sans-serif;font-size:15px;font-weight:700;color:#1f1f1f;outline:none;}',
      '.custom-cart-production-select:focus{border-color:#0f2e53;box-shadow:0 0 0 2px rgba(15,46,83,.12);}',
      '.custom-cart-production-select:disabled{cursor:wait;opacity:.7;}',
      '.custom-cart-design-link{display:inline-block;cursor:pointer;background:none;border:none;padding:0;font:inherit;color:inherit;}',
      '.custom-cart-design-thumb{display:block;width:80px;height:80px;object-fit:contain;border-radius:6px;border:1px solid #e5e5e5;margin-top:4px;}',
      '.custom-cart-design-label{font-size:13px;font-family:Lato,sans-serif;font-weight:400;color:#555;line-height:1.35;}',
      '.custom-cart-design-title-link{display:inline;cursor:pointer;background:none;border:none;padding:0;font-size:13px;font-family:Lato,sans-serif;font-weight:400;color:#555;text-decoration:underline;text-underline-offset:2px;line-height:1.35;}',
      '.custom-cart-design-modal-overlay{position:fixed;inset:0;z-index:100001;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .2s ease;}',
      '.custom-cart-design-modal-overlay.open{opacity:1;pointer-events:auto;}',
      '.custom-cart-design-modal{background:#fff;border-radius:10px;padding:20px;max-width:min(92vw,700px);max-height:90vh;overflow:auto;position:relative;box-shadow:0 8px 30px rgba(0,0,0,.18);}',
      '.custom-cart-design-modal-close{position:absolute;top:10px;right:10px;width:32px;height:32px;background:none;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:999px;}',
      '.custom-cart-design-modal-close:hover{background:rgba(0,0,0,.06);}',
      '.custom-cart-design-modal-heading{margin:0 0 4px;font-size:18px;font-weight:700;line-height:1.2;}',
      '.custom-cart-design-modal-title{margin:0 0 12px;font-size:14px;font-weight:500;color:#555;}',
      '.custom-cart-design-modal-image{display:block;width:auto;max-width:min(84vw,640px);height:auto;max-height:calc(90vh - 10rem);margin:0 auto;object-fit:contain;border-radius:6px;}',
      '.custom-cart-production-icon{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#0f2e53;}',
      '.custom-cart-production-icon svg{display:block;max-width:72%;max-height:72%;width:auto;height:auto;}',
      '.custom-cart-qty{position:relative;}',
      '.custom-cart-qty-value{display:inline-block;min-width:24px;text-align:center;}',
      '.custom-cart-item.is-updating{opacity:.72;}',
      '.custom-cart-item.is-updating .custom-cart-qty button,.custom-cart-item.is-updating .custom-cart-remove{cursor:wait;}',
      '.custom-cart-qty.is-loading .custom-cart-qty-value{visibility:hidden;}',
      '.custom-cart-qty.is-loading::after{content:"";position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border:2px solid rgba(53,91,136,.25);border-top-color:#355b88;border-radius:50%;animation:custom-cart-qty-spin .65s linear infinite;}',
      '.custom-cart-body.is-cart-updating,.custom-cart-footer.is-cart-updating{cursor:wait;}',
      '.custom-cart-footer.is-cart-updating .custom-cart-checkout{pointer-events:none;opacity:.7;}',
      '@keyframes custom-cart-qty-spin{to{transform:rotate(360deg);}}',
      '.custom-diameter-meta{display:flex;align-items:center;gap:6px;margin:4px 0 0;color:#5f5f5f;font-family:Lato,Arial,sans-serif;font-size:14px;line-height:18px;}',
      '.custom-diameter-meta__label,.custom-diameter-meta__value{color:inherit;font:inherit;}',
      '.custom-diameter-meta__icon{display:inline-flex;width:18px;height:18px;flex:0 0 18px;}',
      '.custom-diameter-meta__icon svg{display:block;width:18px;height:18px;}'
    ].join('');
    document.head.appendChild(style);
  }

  function getItemImage(item) {
    if (!item) return '';
    if (typeof item.image === 'string' && item.image) return item.image;
    if (item.featured_image && item.featured_image.url) return item.featured_image.url;
    if (item.featured_image && typeof item.featured_image === 'string') return item.featured_image;
    return '';
  }

  function getVariantText(item) {
    if (!item) return '';
    if (item.variant_title && item.variant_title !== 'Default Title') return item.variant_title;
    return '';
  }

  function normalizePropertyLabel(key) {
    var original = String(key || '').trim();
    var normalized = original
      .replace(/^properties\[|\]$/g, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    var lower = normalized.toLowerCase();

    if (lower === 'product diameter' || lower === 'diameter' || lower === 'product variant diameter') {
      return 'Diameter';
    }

    if (lower === 'imprint' || lower === 'standard cover imprint' || lower === 'cover imprint') {
      return 'Imprint';
    }

    if (lower === 'imprint size' || lower === 'print size' || lower === 'logo size') {
      return 'Imprint Size';
    }

    if (lower === 'color' || lower === 'colour' || lower === 'background color' || lower === 'background colour') {
      return 'Color';
    }

    return normalized.replace(/\b\w/g, function (char) { return char.toUpperCase(); });
  }

  var DIAMETER_ICON_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">' +
    '<path d="M9 0C4.03711 0 0 4.03711 0 9C0 13.9629 4.03711 18 9 18C13.9629 18 18 13.9629 18 9C18 4.03711 13.9629 0 9 0ZM9 1.5C13.1514 1.5 16.5 4.84863 16.5 9C16.5 13.1514 13.1514 16.5 9 16.5C4.84863 16.5 1.5 13.1514 1.5 9C1.5 4.84863 4.84863 1.5 9 1.5ZM9.75 4.5L11.0947 5.84473L5.84473 11.0947L4.5 9.75V13.5H8.25L6.90527 12.1553L12.1553 6.90527L13.5 8.25V4.5H9.75Z" fill="#5F5F5F"/></svg>';

  function isDiameterPropertyKey(key) {
    var lower = String(key || '').replace(/^_+/, '').trim().toLowerCase();
    return (
      lower === 'diameter' ||
      lower === 'product diameter' ||
      lower === 'product variant diameter' ||
      lower === 'variant diameter' ||
      lower === 'bell diameter' ||
      lower === 'entered diameter' ||
      lower === 'custom diameter' ||
      lower === 'diameter size'
    );
  }

  function isCartHiddenDetailProperty(key) {
    var lower = String(key || '').replace(/^_+/, '').trim().toLowerCase();
    return (
      isDiameterPropertyKey(key) ||
      lower === 'imprint size' ||
      lower === 'imprint' ||
      lower === 'imprint type' ||
      lower === 'cover imprint' ||
      lower === 'print size' ||
      lower === 'production time' ||
      lower === 'design image' ||
      lower === 'design file format'
    );
  }

  function getLineItemDesignImageUrl(props) {
    props = props || {};
    var designImage = props['_Design Image'] || props['Design Image'];
    if (!designImage) return '';
    return String(designImage).trim();
  }

  function formatDiameterDisplay(value) {
    if (window.CustomDiameterFormat && typeof window.CustomDiameterFormat.formatDiameterDisplay === 'function') {
      return window.CustomDiameterFormat.formatDiameterDisplay(value);
    }
    return String(value || '').trim();
  }

  function getLineItemDiameter(item) {
    var props = item && item.properties ? item.properties : {};
    var propertyName;
    var value;

    for (propertyName in props) {
      if (!Object.prototype.hasOwnProperty.call(props, propertyName)) continue;
      if (!isDiameterPropertyKey(propertyName)) continue;
      if (propertyName.charAt(0) === '_') continue;

      value = String(props[propertyName] == null ? '' : props[propertyName]).trim();
      if (value && value !== '0' && value !== 'Default Title') {
        return formatDiameterDisplay(value);
      }
    }

    return '';
  }

  function getDiameterDisplayHtml(item) {
    var value = getLineItemDiameter(item);
    if (!value) return '';

    return (
      '<div class="custom-cart-item-diameter custom-diameter-meta">' +
        '<span class="custom-diameter-meta__label">Diameter</span>' +
        '<span class="custom-diameter-meta__icon">' + DIAMETER_ICON_SVG + '</span>' +
        '<span class="custom-diameter-meta__value">' + escapeHtml(value) + '</span>' +
      '</div>'
    );
  }

  function shouldShowProperty(key, value) {
    if (!key) return false;
    if (key.charAt(0) === '_') return false;
    if (isCartHiddenDetailProperty(key)) return false;
    if (value === null || value === undefined || String(value).trim() === '') return false;
    return true;
  }

  function getProductionTimeValue(item) {
    var props = item && item.properties ? item.properties : {};
    return String(props['Production Time'] || props['production time'] || '').trim();
  }

  function getProductionTimeAddOnCents(productionTime) {
    productionTime = String(productionTime || '').trim().toLowerCase();
    if (productionTime === 'rush production') return 3000;
    if (productionTime === 'priority rush') return 5500;
    return 0;
  }

  function normalizeProductionTime(productionTime) {
    productionTime = String(productionTime || '').trim().toLowerCase();
    if (productionTime === 'standard production' || productionTime === 'standard') return 'Standard Production';
    if (productionTime === 'priority rush') return 'Priority Rush';
    if (productionTime === 'rush production') return 'Rush Production';
    return '';
  }

  function isProductionTimeProduct(item) {
    var props = item && item.properties ? item.properties : {};
    var marker = String(props['_Production Time Product'] || '').trim().toLowerCase();
    var title = String((item && (item.product_title || item.title)) || '').trim().toLowerCase();

    return marker === 'true' || title === 'rush production' || title === 'priority rush';
  }

  function getProductionTimeProductValue(item) {
    var props = item && item.properties ? item.properties : {};
    return normalizeProductionTime(
      props['Production Time'] ||
        props['production time'] ||
        item && (item.product_title || item.title)
    );
  }

  function getCartVisibleItems(cart) {
    return ((cart && cart.items) || []).filter(function(item) {
      return !isProductionTimeProduct(item);
    });
  }

  function getCartProductionSourceItems(cart) {
    return getCartVisibleItems(cart);
  }

  function getVisibleItemCount(cart) {
    return getCartVisibleItems(cart).reduce(function(total, item) {
      return total + (Number(item.quantity || 0) || 0);
    }, 0);
  }

  function getCartDesiredProductionTime(cart, selectedProductionTime) {
    var selected = normalizeProductionTime(selectedProductionTime);
    var desired = selected || '';

    if (selected) return desired;

    getCartProductionSourceItems(cart).forEach(function(item) {
      var productionTime = normalizeProductionTime(getProductionTimeValue(item));

      if (productionTime === 'Priority Rush') {
        desired = 'Priority Rush';
      } else if (productionTime === 'Rush Production' && desired !== 'Priority Rush') {
        desired = 'Rush Production';
      }
    });

    return desired;
  }

  function findProductionTimeProductForType(cart, productionTime) {
    productionTime = normalizeProductionTime(productionTime);
    if (!productionTime) return null;

    return ((cart && cart.items) || []).find(function(item) {
      return isProductionTimeProduct(item) && getProductionTimeProductValue(item) === productionTime;
    }) || null;
  }

  function getMissingProductionTimeAddOnTotal(cart) {
    var desiredProductionTime = getCartDesiredProductionTime(cart);

    if (!desiredProductionTime) return 0;
    if (findProductionTimeProductForType(cart, desiredProductionTime)) return 0;

    return getProductionTimeAddOnCents(desiredProductionTime);
  }

  function getCartDisplayTotal(cart) {
    return (Number(cart && cart.total_price || 0) || 0) + getMissingProductionTimeAddOnTotal(cart);
  }

  function getProductionTimeOptionPrice(productionTime) {
    var cents = getProductionTimeAddOnCents(productionTime);
    return cents ? ' +' + money(cents) : ' - Free';
  }

  function getCartProductionTimeSelectHtml(cart) {
    if (!getCartProductionSourceItems(cart).length) return '';

    var selected = getCartDesiredProductionTime(cart) || 'Standard Production';
    var options = [
      { value: 'Standard Production', label: 'Standard Production' + getProductionTimeOptionPrice('Standard Production') },
      { value: 'Rush Production', label: 'Rush Production' + getProductionTimeOptionPrice('Rush Production') },
      { value: 'Priority Rush', label: 'Priority Rush' + getProductionTimeOptionPrice('Priority Rush') }
    ];

    return '<div class="custom-cart-production-select-wrap">' +
      '<label class="custom-cart-production-select-label" for="customCartProductionTime">Choose Production Time</label>' +
      '<div class="custom-cart-production-select-control">' +
        '<select id="customCartProductionTime" class="custom-cart-production-select">' +
          options.map(function(option) {
            return '<option value="' + escapeHtml(option.value) + '"' +
              (option.value === selected ? ' selected' : '') +
              '>' + escapeHtml(option.label) + '</option>';
          }).join('') +
        '</select>' +
      '</div>' +
    '</div>';
  }

  function getProductionTimeLineTitle(item) {
    return getProductionTimeProductValue(item) || String((item && (item.product_title || item.title)) || '');
  }

  function getProductionTimeIconSvg(item) {
    var productionTime = getProductionTimeProductValue(item);

    if (productionTime === 'Priority Rush') {
      return "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"61\" height=\"47\" viewBox=\"0 0 61 47\" fill=\"none\"><path d=\"M36.074 2.01721C47.8001 1.27407 57.9067 10.1831 58.6404 21.9098C59.3739 33.6366 50.4569 43.7355 38.7292 44.4596C27.0153 45.1828 16.9308 36.2784 16.198 24.5651C15.4653 12.8518 24.3614 2.75957 36.074 2.01721ZM56.6296 22.1744C56.0438 11.5679 46.9716 3.44411 36.365 4.02795C25.7557 4.61191 17.6289 13.6864 18.2146 24.2955C18.8006 34.9049 27.8778 43.03 38.4871 42.442C49.0932 41.8541 57.2148 32.7808 56.6296 22.1744Z\" fill=\"#0F2E53\"/><path d=\"M36.3921 6.0556C45.898 5.48691 54.0599 12.7446 54.606 22.2519C55.1525 31.7592 47.8753 39.9038 38.3667 40.4277C28.8902 40.9495 20.7787 33.7027 20.2339 24.2275C19.6893 14.7519 26.9177 6.62263 36.3921 6.0556ZM52.5942 22.5331C52.2048 14.1536 45.0948 7.6771 36.7153 8.0683C28.339 8.45954 21.8655 15.5658 22.2544 23.9423C22.6435 32.3187 29.748 38.7949 38.1245 38.4081C46.5041 38.0211 52.983 30.9127 52.5942 22.5331Z\" fill=\"#0F2E53\"/><path d=\"M37.0461 10.1372C37.6686 10.0529 38.3374 10.2044 38.3977 10.9194C38.4853 11.9609 38.447 13.0953 38.4456 14.1431L38.4426 20.3276C39.2054 20.7221 40.0614 21.3509 40.2327 22.2388C42.0487 22.2648 43.9023 22.1828 45.7043 22.272C46.7699 22.3251 46.8118 24.1409 45.5852 24.2095C44.3466 24.2783 43.0103 24.2318 41.7805 24.2241L40.2854 24.228C39.7069 25.7639 38.1542 26.6173 36.553 26.1353C35.7701 25.9022 35.1129 25.3649 34.7288 24.644C33.7676 22.8359 34.7773 21.1793 36.4397 20.3188C36.3385 17.5291 36.4456 14.7027 36.4045 11.9087C36.3922 11.0648 36.2859 10.6093 37.0461 10.1372ZM38.1194 22.5083C37.8543 22.2512 37.4702 22.159 37.1174 22.2681C36.5972 22.4289 36.2978 22.9731 36.4407 23.4985C36.5837 24.0238 37.1177 24.3411 37.6477 24.2163C38.0068 24.1316 38.2915 23.8581 38.3899 23.5024C38.4882 23.1466 38.3842 22.7654 38.1194 22.5083Z\" fill=\"#0F2E53\"/><path d=\"M11.5688 34.2223C12.8383 34.2209 14.0858 34.2269 15.0483 34.2457C15.5295 34.2552 15.9411 34.2672 16.2485 34.2838C16.4021 34.2921 16.5314 34.3015 16.6313 34.3121C16.7239 34.322 16.8101 34.3352 16.8638 34.3561C17.1022 34.4492 17.2959 34.6178 17.4058 34.858C17.5418 35.1556 17.5586 35.5612 17.4312 35.8698C17.2895 36.2122 17.0459 36.3825 16.7378 36.5055L16.7192 36.5133L16.6997 36.5153C16.3286 36.5589 15.4788 36.5764 14.6304 36.5797C13.7784 36.583 12.9134 36.5721 12.5063 36.5553C11.9571 36.5327 10.3665 36.5688 8.83154 36.5778C8.06716 36.5822 7.31861 36.5793 6.72705 36.5592C6.43167 36.5491 6.17297 36.535 5.97021 36.5143C5.86888 36.5039 5.77888 36.4915 5.70459 36.4772C5.63335 36.4634 5.56442 36.4465 5.51221 36.4205V36.4196C5.26064 36.2927 5.06645 36.0749 4.97021 35.8102L4.9292 35.6832C4.84862 35.3873 4.87504 35.1062 5.00049 34.8668C5.1429 34.5951 5.40366 34.3946 5.73584 34.2838L5.75635 34.277H5.77881C6.39867 34.2574 9.03022 34.225 11.5688 34.2223Z\" fill=\"#0F2E53\" stroke=\"#0F2E53\" stroke-width=\"0.3\"/><path d=\"M2.67334 22.1101C3.92022 22.0576 5.19153 22.0662 6.46045 22.0808C7.73055 22.0955 8.99807 22.1164 10.2427 22.0906C11.1456 22.0719 12.2035 22.0593 13.144 22.1042L13.5396 22.1277L13.5815 22.1306L13.6157 22.1541C14.0411 22.4527 14.2902 22.8948 14.2876 23.323C14.2848 23.7636 14.0151 24.157 13.4741 24.3328L13.4595 24.3367L13.4448 24.3386C13.2152 24.3655 12.4459 24.3855 11.4282 24.3982C10.405 24.411 9.11837 24.4164 7.84521 24.4138C6.5722 24.4112 5.31126 24.4001 4.33936 24.3796C3.85362 24.3694 3.43868 24.3568 3.13037 24.3416C2.97636 24.3339 2.84706 24.3263 2.74854 24.3171C2.65772 24.3087 2.57365 24.2975 2.52393 24.28C2.25456 24.1854 2.05535 23.9839 1.94385 23.7322C1.81474 23.4405 1.80488 23.0821 1.92627 22.7839C2.06396 22.4461 2.30963 22.248 2.62354 22.1208L2.64697 22.1111L2.67334 22.1101Z\" fill=\"#0F2E53\" stroke=\"#0F2E53\" stroke-width=\"0.3\"/><path d=\"M10.2832 15.9575C11.2211 15.9564 12.1447 15.9622 12.8691 15.9819C13.2313 15.9918 13.5455 16.0047 13.7871 16.022C13.9076 16.0306 14.0117 16.0411 14.0957 16.0522C14.1761 16.0629 14.2499 16.076 14.3018 16.0952C14.5937 16.2034 14.8329 16.4469 14.9619 16.7153C15.0744 16.9496 15.1231 17.237 15.0186 17.5073C14.8469 17.9511 14.489 18.1846 14.1025 18.3345L14.0801 18.3433L14.0547 18.3442C11.4475 18.4486 8.70965 18.3172 6.10938 18.3403C5.45661 18.3459 4.98986 17.8697 4.89648 17.3413C4.84943 17.0748 4.89675 16.7909 5.06445 16.5474C5.23243 16.3035 5.51248 16.1129 5.90918 16.0151L5.92383 16.0112H5.93945C6.46774 15.9924 8.40735 15.9598 10.2832 15.9575Z\" fill=\"#0F2E53\" stroke=\"#0F2E53\" stroke-width=\"0.3\"/><path d=\"M12.2329 9.9259C13.203 9.93482 14.1705 9.94725 15.1294 9.92786C15.3369 9.91562 15.5413 9.92274 15.7388 9.93274C15.9386 9.94286 16.1294 9.95463 16.3208 9.95422C16.8621 9.95318 17.2597 10.2209 17.4331 10.6105C17.605 10.9966 17.5453 11.4765 17.231 11.881C17.0969 12.0534 16.8975 12.1343 16.7085 12.1769C16.5202 12.2192 16.3148 12.2292 16.1548 12.2413L16.146 12.2423V12.2413C13.8174 12.2856 11.4031 12.2555 9.07568 12.2189C8.04491 12.2026 7.54399 11.0552 8.23096 10.298C8.54013 9.95723 8.98466 9.96495 9.31689 9.94055H9.32275C10.2879 9.91079 11.2618 9.91698 12.2329 9.9259Z\" fill=\"#0F2E53\" stroke=\"#0F2E53\" stroke-width=\"0.3\"/><path d=\"M18.4883 40.2424C19.2322 40.2408 19.9659 40.2468 20.5547 40.2678C20.8488 40.2783 21.1088 40.293 21.3164 40.3118C21.5183 40.33 21.6862 40.3534 21.7871 40.3879C22.0712 40.4854 22.2988 40.7181 22.418 40.9768L22.4619 41.0852C22.5525 41.3439 22.5494 41.6275 22.4512 41.886V41.887C22.2893 42.3022 21.9823 42.4671 21.6465 42.6165L21.6221 42.6272L21.5947 42.6292C21.0875 42.6577 19.5363 42.6936 18.0332 42.6926C17.2814 42.6922 16.5394 42.6819 15.9443 42.6575C15.6469 42.6452 15.3841 42.6292 15.1748 42.6086C14.9713 42.5886 14.8012 42.5628 14.7002 42.5256C14.4299 42.426 14.2122 42.2288 14.0986 41.9573C13.966 41.6402 13.9838 41.2368 14.1143 40.9299C14.2673 40.5703 14.6246 40.4204 14.8936 40.3108L14.918 40.301L14.9443 40.3C15.4639 40.2812 17.0003 40.2457 18.4883 40.2424Z\" fill=\"#0F2E53\" stroke=\"#0F2E53\" stroke-width=\"0.3\"/><path d=\"M14.8899 3.83508C15.8625 3.77379 16.8738 3.79038 17.8782 3.81067C18.8847 3.831 19.8837 3.85503 20.842 3.81067C21.6795 3.77188 22.2906 4.13507 22.4915 4.64661C22.5919 4.90256 22.5839 5.18577 22.4534 5.44836C22.3234 5.70949 22.0774 5.94087 21.719 6.11145L21.7004 6.12024L21.6799 6.12415C21.4947 6.15657 21.0079 6.18021 20.3889 6.19543C19.7631 6.21082 18.9868 6.21778 18.2131 6.21594C17.4396 6.2141 16.6669 6.20333 16.0481 6.18176C15.7389 6.17098 15.4664 6.15709 15.2512 6.14075C15.0415 6.12481 14.8723 6.1056 14.7776 6.07922C14.5078 6.00403 14.2836 5.84256 14.1438 5.58801C13.9857 5.30019 13.9654 4.93016 14.053 4.62805C14.1755 4.20596 14.5283 4.01165 14.8293 3.85266L14.8577 3.83704L14.8899 3.83508Z\" fill=\"#0F2E53\" stroke=\"#0F2E53\" stroke-width=\"0.3\"/><path d=\"M11.6724 28.0999C12.2648 28.1032 12.8504 28.1131 13.3179 28.1331C13.5514 28.1431 13.7573 28.1555 13.9204 28.1712C14.0768 28.1863 14.2118 28.2054 14.2915 28.2347H14.2925C14.5849 28.3437 14.8208 28.5669 14.9458 28.8528H14.9448C15.1197 29.2487 15.0919 29.5963 14.9097 29.8773C14.7337 30.1482 14.4284 30.3353 14.0903 30.4554L14.0698 30.4622L14.0483 30.4642C13.569 30.493 12.4469 30.5352 11.3501 30.5394C10.8016 30.5414 10.2574 30.534 9.80225 30.5101C9.35417 30.4865 8.9726 30.4464 8.76221 30.3763C8.4622 30.2763 8.12634 30.0814 7.97119 29.7464C7.84523 29.4741 7.8836 29.2001 7.97314 28.9573C8.05658 28.7312 8.17416 28.57 8.32666 28.4427C8.47523 28.3186 8.65148 28.2304 8.84229 28.1448L8.86768 28.1341L8.896 28.1321C9.26831 28.1127 10.4886 28.0933 11.6724 28.0999Z\" fill=\"#0F2E53\" stroke=\"#0F2E53\" stroke-width=\"0.3\"/></svg>";
    }

    return "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"52\" height=\"51\" viewBox=\"0 0 52 51\" fill=\"none\"><path d=\"M26.1 0.517395C25.8507 0.506789 25.6125 0.522146 25.3636 0.585754C25.1275 0.646161 24.9238 0.740041 24.7465 0.827942C23.304 1.54265 21.8639 2.26731 20.4291 2.98517H20.43L12.1527 7.12189L5.30212 10.5496C4.24902 11.0765 3.18857 11.6015 2.13024 12.1277L1.96618 12.2225C1.81283 12.3231 1.69432 12.4365 1.61559 12.5174C1.5598 12.5748 1.50732 12.6336 1.46227 12.6863L1.3529 12.8182L1.16149 13.0516L1.13122 13.3514C1.07478 13.9142 1.09605 14.7051 1.09606 15.1639V15.1649L1.09704 17.9422L1.09899 26.9061L1.09411 33.8143C1.09388 34.1174 1.08178 34.8785 1.08532 35.5623C1.08715 35.915 1.09277 36.2746 1.1068 36.5877C1.11986 36.8789 1.14175 37.1994 1.19274 37.4373L1.26208 37.7606L1.51012 37.9783L1.51696 37.9842C1.51814 37.9852 1.52027 37.9875 1.52087 37.9881C1.52275 37.9897 1.52238 37.9885 1.52087 37.9871C1.76545 38.2076 2.18278 38.4505 2.55798 38.657C2.98109 38.89 3.4934 39.1523 4.00622 39.407C4.52053 39.6625 5.04462 39.9157 5.49352 40.1317C5.94799 40.3503 6.31543 40.5255 6.53161 40.6336L17.8881 46.3104L22.5873 48.6629L22.5882 48.6619C22.8799 48.8082 23.4524 49.1069 23.9388 49.3484C24.4381 49.5964 25.0009 49.8641 25.4066 50.0027L25.5287 50.0447L25.6576 50.0535C25.9577 50.0753 26.2834 50.0626 26.6703 49.8777L28.1146 49.1776C29.5563 48.4694 30.9892 47.7409 32.4066 47.032L42.6869 41.8934L47.1488 39.6629C47.4426 39.516 48.0913 39.2073 48.6693 38.91C48.9668 38.7569 49.2706 38.5944 49.5365 38.4383C49.7865 38.2915 50.0611 38.1171 50.2631 37.9373L50.5375 37.6932L50.5882 37.3279C50.6877 36.6132 50.666 35.7597 50.6664 35.1688V32.4627L50.6644 23.1551L50.6674 16.699V16.6981C50.6674 16.3823 50.6794 15.6484 50.6752 14.994C50.6711 14.3621 50.6536 13.5939 50.5619 13.16L50.4994 12.8641L50.2826 12.6522C50.1377 12.5106 49.9477 12.3814 49.7914 12.282C49.6174 12.1714 49.41 12.0509 49.1879 11.9276C48.7428 11.6804 48.1989 11.4003 47.6547 11.1277C47.1083 10.8541 46.552 10.5826 46.0804 10.3543C45.6034 10.1233 45.2238 9.94106 45.0131 9.83575L36.0824 5.36993L29.8861 2.27228C29.0134 1.83583 27.4081 0.97249 26.4222 0.585754L26.267 0.524231L26.1 0.517395ZM26.1429 49.0154C26.1391 49.0168 26.135 49.0171 26.1312 49.0184C26.1659 49.0066 26.2021 48.9934 26.2396 48.9754L26.1429 49.0154ZM48.0336 28.7108V33.5858C48.0335 34.4362 48.056 35.4237 48.0238 36.2664L33.8441 43.3543L29.3119 45.6199C28.5483 45.9999 27.3738 46.5416 26.6781 46.9656L26.6713 38.4695L26.6732 25.784C27.2055 25.58 28.071 25.0884 28.6175 24.826C30.1563 24.087 31.7047 23.2393 33.2533 22.5252L33.2455 27.744C33.2446 28.5714 33.2107 29.4573 33.2787 30.2762C33.3342 30.9413 34.1257 31.278 34.6644 30.7547C35.6777 29.7705 36.7143 28.7709 37.6927 27.7508C38.3526 27.7517 40.779 27.9292 41.223 27.491C41.3638 27.3519 41.4344 27.188 41.4593 26.9949C41.5743 26.104 41.4834 25.0882 41.4828 24.1854L41.4789 18.3572C42.0229 18.1688 42.6868 17.8023 43.2093 17.534C44.8048 16.7149 46.4431 15.9467 48.0267 15.1082L48.0336 28.7108ZM18.4105 22.4725C20.5143 23.524 23.0641 24.706 25.0687 25.8162C25.0656 27.6551 25.1281 46.7041 25.0121 46.8943L24.9623 46.9022C22.9168 45.8217 20.7726 44.7707 18.6888 43.7537C13.6807 41.3108 8.72321 38.6845 3.70739 36.2664L3.71325 22.1463L3.70934 17.6805C3.70835 16.9463 3.67712 15.9047 3.72497 15.1912L3.79137 15.158L18.4105 22.4725ZM49.0306 37.576C48.9642 37.615 48.8936 37.653 48.8216 37.6932C48.9146 37.6412 49.0037 37.5903 49.0873 37.5408L49.0306 37.576ZM39.7924 19.244C39.8414 19.9391 39.8123 20.9976 39.8119 21.7195L39.8099 26.074C38.9646 26.0763 37.9704 26.0543 37.1371 26.0926C36.5593 26.461 35.4864 27.6693 34.9457 28.1863C34.8895 26.0511 34.9289 23.7789 34.93 21.6336C35.3948 21.4741 36.7702 20.7696 37.265 20.5067C38.0056 20.113 39.0933 19.6392 39.7924 19.244ZM11.7845 10.2547C12.7801 10.8261 13.8317 11.3462 14.8422 11.8943C20.6289 15.0333 26.5383 18.0092 32.306 21.1766C31.7159 21.3953 30.5473 22.02 29.9476 22.3201C28.5892 22.9927 27.2354 23.6753 25.8871 24.368C25.7771 24.317 25.5306 24.2111 25.434 24.157C23.6918 23.2249 21.8316 22.366 20.0658 21.4608C14.9996 18.8636 9.76711 16.4055 4.72106 13.7889L9.36266 11.4744C10.0571 11.1269 11.1326 10.6287 11.7845 10.2547ZM18.3441 6.99298C20.3012 7.98633 22.2448 9.07008 24.1918 10.0897C29.1012 12.6606 33.9829 15.3448 38.9027 17.8904C38.1355 18.1718 36.9103 18.8453 36.139 19.2274C35.6397 19.4747 34.5469 19.9894 34.1097 20.2557L20.5414 13.0535L16.2465 10.7742C15.463 10.3564 14.3824 9.73925 13.5951 9.38654C14.8527 8.65894 16.2383 8.06827 17.5257 7.38751C17.6419 7.32608 18.2388 7.01614 18.3441 6.99298ZM25.9554 3.27032C27.6465 4.06565 29.4711 5.02338 31.1547 5.86505L41.4037 10.9901C43.1907 11.8836 45.2436 12.9759 47.0345 13.7752L43.14 15.7313C42.5697 16.0169 41.4742 16.6017 40.9095 16.8211C40.8002 16.8805 40.721 16.9529 40.6215 16.9129C40.0767 16.6927 39.4705 16.349 38.9564 16.075L35.5658 14.2664L25.8636 9.1131C24.0165 8.13107 21.9889 7.00115 20.1195 6.08673C21.3778 5.4706 22.6321 4.84545 23.8822 4.21271C24.212 4.04687 25.7326 3.22075 25.9554 3.27032ZM20.8763 3.8797L12.6 8.01642L5.74938 11.4442C4.69489 11.9717 3.63199 12.498 2.57555 13.0233L5.74938 11.4432L12.6 8.01642L20.8763 3.87872V3.8797ZM35.6351 6.26447L42.7767 9.83575L35.6351 6.26544L29.4388 3.16681L35.6351 6.26447Z\" fill=\"#0F2E53\"/></svg>";
  }

  function readCachedPreviewByToken(productId, token) {
    if (!token) return '';

    try {
      var storageKey = 'custom-cover-preview:v1:' + (productId || 'unknown-product');
      var raw = window.localStorage.getItem(storageKey);
      if (!raw) return '';

      var map = JSON.parse(raw);
      var cached = map && map[token] && map[token].image;
      return cached ? String(cached).trim() : '';
    } catch (e) {
      return '';
    }
  }

  function isAllowedDesignPreviewUrl(url) {
    url = String(url || '').trim();
    if (!url || url.indexOf('data:') !== -1) return false;
    return (
      url.indexOf('/uploads/') !== -1 ||
      url.indexOf('cdn.shopify.com') !== -1 ||
      /^https?:\/\//i.test(url)
    );
  }

  function resolveDesignPreviewSrc(item) {
    var props = item && item.properties ? item.properties : {};
    var designImage = getLineItemDesignImageUrl(props);
    if (designImage && isAllowedDesignPreviewUrl(designImage)) {
      return designImage;
    }
    return '';
  }

  function getDesignPreviewUrlForAttr(previewSrc) {
    previewSrc = String(previewSrc || '').trim();
    if (!previewSrc) return '';
    if (previewSrc.indexOf('/uploads/') !== -1 || previewSrc.indexOf('cdn.shopify.com') !== -1) {
      return previewSrc;
    }
    if (/^https?:\/\//i.test(previewSrc)) return previewSrc;
    return '';
  }

  function getDesignPreviewTriggerAttrs(item, previewSrc) {
    var props = item && item.properties ? item.properties : {};
    var token = String(props['_Customizer Preview Token'] || props['Customizer Preview Token'] || '').trim();
    var productId = String(item && item.product_id ? item.product_id : 'unknown-product').trim();
    var attrSrc = getDesignPreviewUrlForAttr(previewSrc);

    return (
      'data-design-drawer-open data-design-preview-open ' +
      'data-design-src="' + escapeHtml(attrSrc) + '" ' +
      'data-design-preview-src="' + escapeHtml(attrSrc) + '" ' +
      'data-design-preview-token="' + escapeHtml(token) + '" ' +
      'data-design-preview-product-id="' + escapeHtml(productId) + '"'
    );
  }

  function resolveDesignPreviewSrcFromTrigger(trigger) {
    if (!trigger) return '';

    var src = (
      trigger.getAttribute('data-design-preview-src') ||
      trigger.getAttribute('data-design-src') ||
      ''
    ).trim();
    var token = (trigger.getAttribute('data-design-preview-token') || '').trim();
    var productId = (trigger.getAttribute('data-design-preview-product-id') || 'unknown-product').trim();

    if (isAllowedDesignPreviewUrl(src)) {
      return src;
    }

    return '';
  }

  function getPropertiesHtml(item) {
    var props = item && item.properties ? item.properties : {};
    var previewSrc = resolveDesignPreviewSrc(item);
    var designTitle = props['Design title'] || '';
    var keys = Object.keys(props).filter(function (key) {
      return shouldShowProperty(key, props[key]);
    });

    if (!keys.length && !previewSrc) return '';

    var html = '<div class="custom-cart-item-properties">';

    html += keys.map(function (key) {
      var label = normalizePropertyLabel(key);
      var value = props[key];

      if (key === 'Design title' && previewSrc) {
        return '<div class="custom-cart-item-property">' +
          '<span class="custom-cart-design-label">' + escapeHtml(label) + ':</span> ' +
          '<button type="button" class="custom-cart-design-title-link" ' +
          getDesignPreviewTriggerAttrs(item, previewSrc) + ' ' +
          'data-design-title="' + escapeHtml(value) + '" ' +
          'data-design-preview-title="' + escapeHtml(value) + '">' +
          escapeHtml(value) +
          '</button></div>';
      }

      return '<div class="custom-cart-item-property"><strong>' + escapeHtml(label) + ':</strong> <span>' + escapeHtml(value) + '</span></div>';
    }).join('');


    html += '</div>';
    return html;
  }

  function getLineDiscountsHtml(item) {
    var allocations = item && Array.isArray(item.line_level_discount_allocations) ? item.line_level_discount_allocations : [];
    if (!allocations.length) return '';

    return '<ul class="custom-cart-item-discounts">' + allocations.map(function (allocation) {
      var amount = Number(allocation && allocation.amount ? allocation.amount : 0);
      if (!amount) return '';
      return '<li>Save - ' + money(amount) + '</li>';
    }).join('') + '</ul>';
  }

  function updateHeaderBubble(count) {
    var trigger = $('#customCartTrigger') || document.querySelector('a[href*="/cart"]');
    var bubble = $('.cart-count');

    if (!trigger) return;

    if (!bubble && count > 0) {
      bubble = document.createElement('span');
      bubble.className = 'cart-count';
      trigger.appendChild(bubble);
    }

    if (bubble) {
      bubble.textContent = count;
      bubble.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  function fetchCartJson() {
    return fetch('/cart.js', { headers: { Accept: 'application/json' } }).then(function (res) {
      return res.json();
    });
  }

  function resolveCartAfterDiameterNormalize(cart) {
    if (
      !window.CustomDiameterFormat ||
      typeof window.CustomDiameterFormat.normalizeCartDiameters !== 'function'
    ) {
      return Promise.resolve(cart);
    }

    return window.CustomDiameterFormat.normalizeCartDiameters()
      .then(function (updated) {
        if (!updated) return cart;
        return fetchCartJson();
      })
      .catch(function () {
        return cart;
      });
  }

  function getLinePriceDisplay(item, cart) {
    var quantity = Number(item.quantity || 0);
    var unitPriceCents = Number(item.final_price != null ? item.final_price : item.price) || 0;
    var compareUnitCents =
      Number(item.original_price != null ? item.original_price : item.price) || unitPriceCents;
    var lineTotalCents =
      Number(item.final_line_price != null ? item.final_line_price : unitPriceCents * quantity) || 0;
    var originalLineCents =
      Number(item.original_line_price != null ? item.original_line_price : lineTotalCents) || 0;
    var hasUnitDiscount = compareUnitCents > unitPriceCents;
    var linePriceDisplay;

    if (quantity > 1) {
      linePriceDisplay =
        money(lineTotalCents) +
        ' <span class="custom-cart-item-price-each">(' +
        money(unitPriceCents) +
        ' each)</span>';
      if (hasUnitDiscount) {
        linePriceDisplay +=
          '<span class="custom-cart-item-price-compare">' + money(compareUnitCents) + ' each</span>';
      }
    } else {
      linePriceDisplay = money(lineTotalCents);
      if (hasUnitDiscount) {
        linePriceDisplay +=
          '<span class="custom-cart-item-price-compare">' + money(compareUnitCents) + '</span>';
      } else if (originalLineCents > lineTotalCents) {
        linePriceDisplay +=
          '<span class="custom-cart-item-price-compare">' + money(originalLineCents) + '</span>';
      }
    }

    return linePriceDisplay;
  }

  function updateCartSummary(cart) {
    var els = getEls();
    if (!cart) return;
    var visibleItemCount = getVisibleItemCount(cart);

    updateHeaderBubble(visibleItemCount);

    if (els.count) {
      els.count.textContent = '(' + visibleItemCount + ')';
    }

    if (els.itemLabel) {
      els.itemLabel.textContent = visibleItemCount + (visibleItemCount === 1 ? ' Item' : ' Items');
    }

    if (els.subtotal) {
      els.subtotal.textContent = money(getCartDisplayTotal(cart));
    }

    var productionSelect = els.footer && els.footer.querySelector('#customCartProductionTime');
    if (productionSelect) {
      productionSelect.value = getCartDesiredProductionTime(cart) || 'Standard Production';
    }

    var discountRow = els.footer && els.footer.querySelector('.custom-cart-summary-discount');
    var itemsSubtotal = Number(
      cart.items_subtotal_price != null ? cart.items_subtotal_price : cart.total_price || 0
    );
    var totalPrice = getCartDisplayTotal(cart);
    var discountTotal = Number(
      cart.total_discount != null ? cart.total_discount : Math.max(0, itemsSubtotal - totalPrice)
    );

    if (discountTotal > 0) {
      if (!discountRow && els.footer) {
        var subtotalRow = els.footer.querySelector('.custom-cart-subtotal-row');
        if (subtotalRow) {
          subtotalRow.insertAdjacentHTML(
            'afterend',
            '<div class="custom-cart-summary-discount"><span>Discounts</span><span>-' +
              money(discountTotal) +
              '</span></div>'
          );
        }
      } else if (discountRow) {
        var discountValue = discountRow.querySelector('span:last-child');
        if (discountValue) {
          discountValue.textContent = '-' + money(discountTotal);
        }
      }
    } else if (discountRow) {
      discountRow.remove();
    }
  }

  function updateCartLinePricing(cart) {
    if (!cart || !Array.isArray(cart.items)) return;

    cart.items.forEach(function (item) {
      var key = String(item.key || '');
      if (!key) return;

      var row = document.querySelector('.custom-cart-item[data-cart-key="' + cssEscapeValue(key) + '"]');
      if (!row) return;

      if (isProductionTimeProduct(item)) return;

      var priceEl = row.querySelector('.custom-cart-item-price');
      if (priceEl) {
        priceEl.innerHTML = getLinePriceDisplay(item, cart);
      }

      var qtyValue = row.querySelector('.custom-cart-qty-value');
      if (qtyValue) {
        qtyValue.textContent = String(Number(item.quantity || 0));
      }

      var qtyButtons = row.querySelectorAll('.custom-cart-qty button[data-qty]');
      if (qtyButtons.length >= 2) {
        qtyButtons[0].setAttribute('data-qty', String(Math.max(0, Number(item.quantity || 0) - 1)));
        qtyButtons[1].setAttribute('data-qty', String(Number(item.quantity || 0) + 1));
      }
    });
  }

  function cssEscapeValue(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(value);
    }
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function addBusinessDays(startDate, businessDays) {
    var date = new Date(startDate);
    var added = 0;

    while (added < businessDays) {
      date.setDate(date.getDate() + 1);
      var day = date.getDay();
      if (day !== 0 && day !== 6) added++;
    }

    return date;
  }

  function getDeliveryEstimateHtml() {
    var estimatedDate = addBusinessDays(new Date(), 15);
    var formattedDate = estimatedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });

    return '<div class="custom-cart-delivery">Estimated Delivery by <strong>' + formattedDate + '</strong></div>';
  }

  function renderEmpty(cart) {
    var els = getEls();
    if (!els.body) return;

    if (els.count) els.count.textContent = '(' + (cart.item_count || 0) + ')';
    if (els.footer) els.footer.style.display = 'none';
    els.body.classList.add('is-empty');
    els.body.innerHTML = '<div class="custom-cart-empty-wrap"><div class="custom-cart-empty"><h3>Your cart is currently empty.</h3><p>Add your custom covers to your cart!</p><a href="/collections/all" class="shop-now-btn">Shop Now</a></div></div>';
  }

  function renderCart(cart) {
    var els = getEls();
    if (!els.body) return;

    cart = cart || { item_count: 0, items: [], total_price: 0 };
    var visibleItems = getCartVisibleItems(cart);
    var visibleItemCount = getVisibleItemCount(cart);

    updateHeaderBubble(visibleItemCount);

    if (!visibleItems.length) {
      renderEmpty(cart);
      return;
    }

    els.body.classList.remove('is-empty');
    if (els.count) els.count.textContent = '(' + visibleItemCount + ')';
    if (els.footer) els.footer.style.display = 'block';
    if (els.itemLabel) els.itemLabel.textContent = visibleItemCount + (visibleItemCount === 1 ? ' Item' : ' Items');

    els.body.innerHTML = visibleItems.map(function (item) {
      var isProductionItem = isProductionTimeProduct(item);
      var image = getItemImage(item);
      var quantity = Number(item.quantity || 0);
      var linePriceDisplay = getLinePriceDisplay(item, cart);
      var variantText = getVariantText(item);
      var key = escapeHtml(item.key || '');
      var title = isProductionItem ? getProductionTimeLineTitle(item) : (item.product_title || item.title);

      return '' +
        '<div class="custom-cart-item" data-cart-key="' + key + '">' +
          '<div class="custom-cart-item-image">' +
            (isProductionItem ? '<span class="custom-cart-production-icon" aria-hidden="true">' + getProductionTimeIconSvg(item) + '</span>' : '') +
            (!isProductionItem && image ? '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(title) + '">' : '') +
          '</div>' +
          '<div class="custom-cart-item-details">' +
            '<div class="custom-cart-item-top">' +
              '<div>' +
                '<div class="custom-cart-item-title">' + escapeHtml(title) + '</div>' +
                (!isProductionItem && variantText ? '<div class="custom-cart-item-variant">' + escapeHtml(variantText) + '</div>' : '') +
                (!isProductionItem ? getDiameterDisplayHtml(item) : '') +
                (!isProductionItem ? getPropertiesHtml(item) : '') +
                '<div class="custom-cart-item-price">' + linePriceDisplay + '</div>' +
                getLineDiscountsHtml(item) +
              '</div>' +
              '<button type="button" class="custom-cart-remove" data-key="' + key + '" aria-label="Remove item">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>' +
              '</button>' +
            '</div>' +
            '<div class="custom-cart-item-bottom">' +
              '<div class="custom-cart-qty">' +
                '<button type="button" data-key="' + key + '" data-qty="' + (quantity - 1) + '" aria-label="Decrease quantity">−</button>' +
                '<span class="custom-cart-qty-value">' + quantity + '</span>' +
                '<button type="button" data-key="' + key + '" data-qty="' + (quantity + 1) + '" aria-label="Increase quantity">+</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    }).join('');

    if (els.footer) {
      var itemsSubtotal = Number(cart.items_subtotal_price != null ? cart.items_subtotal_price : cart.total_price || 0);
      var totalPrice = getCartDisplayTotal(cart);
      var discountTotal = Number(cart.total_discount != null ? cart.total_discount : Math.max(0, itemsSubtotal - totalPrice));
      els.footer.innerHTML = '' +
        getCartProductionTimeSelectHtml(cart) +
        '<div class="custom-cart-subtotal-row">' +
          '<div class="custom-cart-subtotal-row-inner">' +
            '<strong>Subtotal (<span id="customCartItemLabel">' + visibleItemCount + (visibleItemCount === 1 ? ' Item' : ' Items') + '</span>)</strong>' +
            '<strong id="customCartSubtotal">' + money(totalPrice) + '</strong>' +
          '</div>' +
          (discountTotal > 0 ? '<div class="custom-cart-summary-discount"><span>Discounts</span><span>-' + money(discountTotal) + '</span></div>' : '') +
          '<p>Shipping, taxes, and promo codes may apply at checkout</p>' +
        '</div>' +
        '<a href="/checkout" class="custom-cart-checkout">Secure Check Out</a>' +
        getDeliveryEstimateHtml();
    }
  }

  function loadCart(callback) {
    return fetchCartJson()
      .then(syncProductionTimeProductsForCartDisplay)
      .then(function (cart) {
        renderCart(cart);
        return resolveCartAfterDiameterNormalize(cart).then(function (finalCart) {
          if (finalCart !== cart) {
            renderCart(finalCart);
          }
          if (callback) callback(finalCart);
          return finalCart;
        });
      })
      .catch(function (error) {
        console.error('[StretchableCartDrawer] Cart load error:', error);
        var els = getEls();
        if (els.body) els.body.innerHTML = '<div class="custom-cart-error">There was an error loading your cart.</div>';
      });
  }

  function openDrawer(cartOrSkipLoad) {
    var els = getEls();
    if (!els.drawer || !els.overlay) return;

    injectStyles();
    els.drawer.classList.add('open');
    els.overlay.classList.add('open');
    els.drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (cartOrSkipLoad === true) {
      return;
    }

    if (cartOrSkipLoad && cartOrSkipLoad.items) {
      renderCart(cartOrSkipLoad);
      return;
    }

    loadCart();
  }

  function closeDrawer() {
    var els = getEls();
    if (!els.drawer || !els.overlay) return;

    els.drawer.classList.remove('open');
    els.overlay.classList.remove('open');
    els.drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  var cartQuantityUpdatesInFlight = 0;

  function findCartItemByKey(key) {
    var items = document.querySelectorAll('.custom-cart-item[data-cart-key]');
    var match = null;

    items.forEach(function (item) {
      if (item.getAttribute('data-cart-key') === key) {
        match = item;
      }
    });

    return match;
  }

  function setCartKeyLoading(key, isLoading) {
    if (!key) return;

    var item = findCartItemByKey(key);
    if (!item) return;

    item.classList.toggle('is-updating', !!isLoading);

    if (isLoading) {
      item.setAttribute('aria-busy', 'true');
    } else {
      item.removeAttribute('aria-busy');
    }

    item.querySelectorAll('.custom-cart-qty button, .custom-cart-remove').forEach(function (btn) {
      btn.disabled = !!isLoading;
    });

    var qty = item.querySelector('.custom-cart-qty');
    if (qty) {
      qty.classList.toggle('is-loading', !!isLoading);
    }
  }

  function setCartDrawerUpdating(isLoading) {
    var els = getEls();

    if (els.body) {
      els.body.classList.toggle('is-cart-updating', !!isLoading);
    }

    if (els.footer) {
      els.footer.classList.toggle('is-cart-updating', !!isLoading);
    }
  }

  function beginCartQuantityUpdate(key) {
    cartQuantityUpdatesInFlight += 1;
    setCartKeyLoading(key, true);
  }

  function endCartQuantityUpdate(key) {
    cartQuantityUpdatesInFlight = Math.max(0, cartQuantityUpdatesInFlight - 1);
    setCartKeyLoading(key, false);
  }

  function updateCartByKey(key, quantity) {
    if (!key) return;

    var updatingItem = findCartItemByKey(key);
    if (updatingItem && updatingItem.classList.contains('is-updating')) {
      return;
    }

    beginCartQuantityUpdate(key);

    return fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ id: key, quantity: Math.max(0, Number(quantity || 0)) })
    })
      .then(function (res) {
        return res.json().then(function (cart) {
          if (!res.ok) {
            throw cart;
          }
          return cart;
        });
      })
      .then(function (cart) {
        return syncProductionTimeProductsForCartDisplay(cart);
      })
      .then(function (cart) {
        updateCartSummary(cart);
        updateCartLinePricing(cart);
        renderCart(cart);
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: cart } }));
      })
      .catch(function (error) {
        console.error('[StretchableCartDrawer] Cart update error:', error);
      })
      .finally(function () {
        endCartQuantityUpdate(key);
      });
  }

  function changeCartLineByKey(key, quantity) {
    return fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ id: key, quantity: Math.max(0, Number(quantity || 0)) })
    }).then(function (res) {
      return res.json().then(function (cart) {
        if (!res.ok) throw cart;
        return cart;
      });
    });
  }

  function changeCartLinePropertiesByKey(key, quantity, properties) {
    return fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify({
        id: key,
        quantity: Math.max(0, Number(quantity || 0)),
        properties: properties || {}
      })
    }).then(function (res) {
      return res.json().then(function (cart) {
        if (!res.ok) throw cart;
        return cart;
      });
    });
  }

  function updateCartProductionTime(selectedProductionTime) {
    selectedProductionTime = normalizeProductionTime(selectedProductionTime) || 'Standard Production';
    setCartDrawerUpdating(true);

    return fetchCartJson()
      .then(function(cart) {
        var sourceItems = getCartProductionSourceItems(cart);

        return sourceItems.reduce(function(chain, item) {
          return chain.then(function(currentCart) {
            var key = String(item.key || '');
            var props = Object.assign({}, item.properties || {});

            if (!key) return currentCart;

            props['Production Time'] = selectedProductionTime;
            return changeCartLinePropertiesByKey(key, Number(item.quantity || 0), props);
          });
        }, Promise.resolve(cart));
      })
      .then(function(cart) {
        return cleanProductionTimeProducts(cart, selectedProductionTime);
      })
      .then(function(cart) {
        return addMissingProductionTimeProducts(cart, selectedProductionTime);
      })
      .then(function(cart) {
        return cleanProductionTimeProducts(cart, selectedProductionTime);
      })
      .then(function(cart) {
        renderCart(cart);
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: cart } }));
        return cart;
      })
      .finally(function() {
        setCartDrawerUpdating(false);
      });
  }

  function cleanProductionTimeProducts(cart, selectedProductionTime) {
    var productionItems = ((cart && cart.items) || []).filter(isProductionTimeProduct);
    var desiredProductionTime = getCartDesiredProductionTime(cart, selectedProductionTime);
    var keptProductionTimeKey = '';

    if (!productionItems.length) return Promise.resolve(cart);

    return productionItems.reduce(function (chain, productionItem) {
      return chain.then(function (currentCart) {
        var productionKey = String(productionItem.key || '');
        var productionTime = getProductionTimeProductValue(productionItem);

        if (!productionKey) return currentCart;

        if (!desiredProductionTime || productionTime !== desiredProductionTime || keptProductionTimeKey) {
          return changeCartLineByKey(productionKey, 0);
        }

        keptProductionTimeKey = productionKey;

        if (Number(productionItem.quantity || 0) !== 1) {
          return changeCartLineByKey(productionKey, 1);
        }

        return currentCart;
      });
    }, Promise.resolve(cart));
  }

  function syncProductionTimeProductsForCartDisplay(cart) {
    return cleanProductionTimeProducts(cart)
      .then(addMissingProductionTimeProducts)
      .then(cleanProductionTimeProducts)
      .catch(function(error) {
        console.error('[StretchableCartDrawer] Production time sync error:', error);
        return cart;
      });
  }

  function getProductionTimeProductHandle(productionTime) {
    productionTime = String(productionTime || '').trim().toLowerCase();
    if (productionTime === 'rush production') return 'rush-production';
    if (productionTime === 'priority rush') return 'priority-rush';
    return '';
  }

  function readProductionTimeProducts() {
    var script = document.getElementById('customProductionTimeProductsData');
    if (!script) return {};

    try {
      return JSON.parse(script.textContent || '{}') || {};
    } catch (error) {
      console.error('[StretchableCartDrawer] Production time products JSON error:', error);
      return {};
    }
  }

  function getProductionTimeProductConfig(productionTime) {
    productionTime = normalizeProductionTime(productionTime);

    var products = readProductionTimeProducts();
    var config = products[productionTime] || {};
    var defaults = productionTime === 'Priority Rush'
      ? {
          title: 'Priority Rush Upgrade',
          handles: ['priority-rush', 'priority-rush-upgrade'],
          searchTitles: ['Priority Rush Upgrade', 'Priority Rush']
        }
      : {
          title: 'Rush Production Upgrade',
          handles: ['rush-production', 'rush-production-upgrade'],
          searchTitles: ['Rush Production Upgrade', 'Rush Production']
        };
    var handles = [];
    var searchTitles = [];

    if (Array.isArray(config.handles)) handles = handles.concat(config.handles);
    handles = handles.concat(defaults.handles);

    if (config.title) searchTitles.push(config.title);
    searchTitles = searchTitles.concat(defaults.searchTitles);

    return {
      cartId: config.cartId ? Number(config.cartId) : null,
      handles: handles.filter(function(handle, index, list) {
        return handle && list.indexOf(handle) === index;
      }),
      searchTitles: searchTitles.filter(function(title, index, list) {
        return title && list.indexOf(title) === index;
      })
    };
  }

  function fetchProductCartIdByHandle(handle) {
    handle = String(handle || '').trim();
    if (!handle) return Promise.resolve(null);

    return fetch('/products/' + encodeURIComponent(handle) + '.js', {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function (product) {
        var variants = product && Array.isArray(product.variants) ? product.variants : [];
        var variant = variants.find(function (item) {
          return item && item.available !== false;
        }) || variants[0];
        return variant && variant.id ? Number(variant.id) : null;
      })
      .catch(function () {
        return null;
      });
  }

  function fetchProductCartIdBySearchTitle(title) {
    title = String(title || '').trim();
    if (!title) return Promise.resolve(null);

    return fetch('/search/suggest.json?q=' + encodeURIComponent(title) + '&resources[type]=product&resources[limit]=10', {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function (data) {
        var products = data &&
          data.resources &&
          data.resources.results &&
          Array.isArray(data.resources.results.products)
            ? data.resources.results.products
            : [];
        var wanted = title.toLowerCase();
        var product = products.find(function (item) {
          return String(item.title || '').toLowerCase() === wanted;
        }) || products.find(function (item) {
          return String(item.title || '').toLowerCase().indexOf(wanted) !== -1;
        }) || products[0];

        if (!product || !product.handle) return null;
        return fetchProductCartIdByHandle(product.handle);
      })
      .catch(function () {
        return null;
      });
  }

  function resolveProductionTimeCartId(productionTime) {
    var config = getProductionTimeProductConfig(productionTime);

    if (config.cartId) return Promise.resolve(config.cartId);

    return config.handles.reduce(function(chain, handle) {
      return chain.then(function(foundId) {
        if (foundId) return foundId;
        return fetchProductCartIdByHandle(handle);
      });
    }, Promise.resolve(null)).then(function(foundId) {
      if (foundId) return foundId;

      return config.searchTitles.reduce(function(chain, title) {
        return chain.then(function(searchFoundId) {
          if (searchFoundId) return searchFoundId;
          return fetchProductCartIdBySearchTitle(title);
        });
      }, Promise.resolve(null));
    });
  }

  function buildMissingProductionTimeAdds(cart, selectedProductionTime) {
    var desiredProductionTime = getCartDesiredProductionTime(cart, selectedProductionTime);

    if (
      !desiredProductionTime ||
      !getProductionTimeAddOnCents(desiredProductionTime) ||
      findProductionTimeProductForType(cart, desiredProductionTime)
    ) {
      return [];
    }

    return [desiredProductionTime];
  }

  function addMissingProductionTimeProducts(cart, selectedProductionTime) {
    var missingProductionTimes = buildMissingProductionTimeAdds(cart, selectedProductionTime);
    if (!missingProductionTimes.length) return Promise.resolve(cart);

    return Promise.all(missingProductionTimes.map(function (productionTime) {
      return resolveProductionTimeCartId(productionTime).then(function (cartId) {
        if (!cartId) {
          throw new Error('Could not find the ' + productionTime + ' product.');
        }

        return {
          id: cartId,
          quantity: 1,
          properties: {
            'Production Time': productionTime,
            '_Production Time Product': 'true'
          }
        };
      });
    })).then(function (items) {
      return fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ items: items })
      });
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw data;
        return fetchCartJson();
      });
    });
  }

  function ensureProductionTimeProductsBeforeCheckout(selectedProductionTime) {
    selectedProductionTime = normalizeProductionTime(selectedProductionTime);
    setCartDrawerUpdating(true);

    return fetchCartJson()
      .then(function(cart) {
        return cleanProductionTimeProducts(cart, selectedProductionTime);
      })
      .then(function(cart) {
        return addMissingProductionTimeProducts(cart, selectedProductionTime);
      })
      .then(function (cart) {
        renderCart(cart);
        return cart;
      })
      .finally(function () {
        setCartDrawerUpdating(false);
      });
  }

  function ensureDesignModal() {
    if (document.getElementById('customCartDesignOverlay') && document.getElementById('customCartDesignImage')) {
      return;
    }
    var overlay = document.createElement('div');
    overlay.id = 'customCartDesignOverlay';
    overlay.className = 'custom-cart-design-modal-overlay';
    overlay.innerHTML =
      '<div class="custom-cart-design-modal">' +
        '<button type="button" class="custom-cart-design-modal-close" id="customCartDesignClose" data-design-modal-close aria-label="Close preview">' +
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18"></path><path d="M6 6l12 12"></path></svg>' +
        '</button>' +
        '<p class="custom-cart-design-modal-heading">Design Preview</p>' +
        '<p class="custom-cart-design-modal-title" id="customCartDesignTitle" data-design-modal-title></p>' +
        '<img class="custom-cart-design-modal-image" id="customCartDesignImage" data-design-modal-image src="" alt="Design preview">' +
      '</div>';
    document.body.appendChild(overlay);
  }

  function openDesignModal(src, title, trigger) {
    var resolvedSrc = resolveDesignPreviewSrcFromTrigger(trigger);
    if (!isAllowedDesignPreviewUrl(resolvedSrc)) return;

    ensureDesignModal();

    var overlay = document.getElementById('customCartDesignOverlay');
    var img = document.getElementById('customCartDesignImage');
    var titleEl = document.getElementById('customCartDesignTitle');
    if (!overlay) return;

    if (img) {
      img.removeAttribute('srcset');
      img.src = resolvedSrc;
      img.alt = (title || 'Design') + ' preview';
    }

    if (titleEl) {
      titleEl.textContent = title || '';
    }

    overlay.classList.add('open');
  }

  function closeDesignModal() {
    var overlay = $('#customCartDesignOverlay');
    if (overlay) overlay.classList.remove('open');
  }

  function bind() {
    if (window.__stretchableCartDrawerBound) {
      return;
    }
    window.__stretchableCartDrawerBound = true;

    injectStyles();

    window.__stretchableCartDrawerActive = true;
    window.StretchableCartDrawer = {
      load: loadCart,
      render: renderCart,
      open: openDrawer,
      close: closeDrawer,
      update: updateCartByKey,
      updateProductionTime: updateCartProductionTime
    };

    document.addEventListener('click', function (event) {
      var trigger = event.target.closest && event.target.closest('#customCartTrigger');
      if (!trigger) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      openDrawer();
    }, true);

    document.addEventListener('click', function (event) {
      var close = event.target.closest && event.target.closest('#customCartClose, #customCartOverlay');
      if (!close) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      closeDrawer();
    }, true);

    document.addEventListener('click', function (event) {
      var qtyBtn = event.target.closest && event.target.closest('.custom-cart-qty button[data-key]');
      if (!qtyBtn) return;

      var qtyItem = qtyBtn.closest('.custom-cart-item');
      if (qtyItem && qtyItem.classList.contains('is-updating')) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      updateCartByKey(qtyBtn.getAttribute('data-key'), parseInt(qtyBtn.getAttribute('data-qty'), 10));
    }, true);

    document.addEventListener('click', function (event) {
      var removeBtn = event.target.closest && event.target.closest('.custom-cart-remove[data-key]');
      if (!removeBtn) return;

      var removeItem = removeBtn.closest('.custom-cart-item');
      if (removeItem && removeItem.classList.contains('is-updating')) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      updateCartByKey(removeBtn.getAttribute('data-key'), 0);
    }, true);

    document.addEventListener('change', function(event) {
      var select = event.target.closest && event.target.closest('#customCartProductionTime');
      if (!select) return;
      if (select.disabled) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      select.disabled = true;
      updateCartProductionTime(select.value)
        .catch(function(error) {
          console.error('[StretchableCartDrawer] Production time update error:', error);
          alert((error && (error.description || error.message)) || 'Could not update the production time. Please try again.');
          loadCart();
        })
        .finally(function() {
          select.disabled = false;
        });
    }, true);

    document.addEventListener('click', function (event) {
      var checkout = event.target.closest && event.target.closest('.custom-cart-checkout[href="/checkout"], a[href="/checkout"]');
      if (!checkout) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      ensureProductionTimeProductsBeforeCheckout()
        .then(function () {
          window.location.href = checkout.getAttribute('href') || '/checkout';
        })
        .catch(function (error) {
          console.error('[StretchableCartDrawer] Production time checkout error:', error);
          alert((error && (error.description || error.message)) || 'Could not add the selected production time to checkout. Please try again.');
        });
    }, true);

    document.addEventListener('click', function (event) {
      var trigger = event.target.closest && event.target.closest('[data-design-drawer-open], [data-design-preview-open]');
      if (!trigger) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      openDesignModal(
        trigger.getAttribute('data-design-src') || '',
        trigger.getAttribute('data-design-title') ||
          trigger.getAttribute('data-design-preview-title') ||
          'Custom Design',
        trigger
      );
    }, true);

    document.addEventListener('click', function (event) {
      var close = event.target.closest && event.target.closest('[data-design-modal-close], #customCartDesignOverlay');
      if (!close) return;
      if (event.target.closest('.custom-cart-design-modal') && !event.target.closest('[data-design-modal-close]')) return;

      event.preventDefault();
      closeDesignModal();
    }, true);

    document.addEventListener('cart:open', function (event) {
      var cart = event.detail && event.detail.cart;
      openDrawer(cart);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      var designOverlay = $('#customCartDesignOverlay');
      if (designOverlay && designOverlay.classList.contains('open')) {
        closeDesignModal();
        return;
      }
      closeDrawer();
    });

    log('[StretchableCartDrawer] Patch loaded');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();

ymaps.ready(function() {

  var map;

  ymaps.geoXml.load('http://nashural.ru/data.xml?v1.0.1')
    .then(function(res) {
      map = new ymaps.Map('map', {
        center: [56.80671065838881, 60.54288274121081],
        zoom: 6,
        controls: []
      });

      res.geoObjects.each(addMenuItem);

      $('#map-spinner').remove();
    })
    .catch(function(error) {
      console.error(error);
      throw error;
    });

  // ---

  var $mapGroups = $('#map-groups');

  var dialog = document.querySelector('#geo-object-detail');
  if (! dialog.showModal) {
    dialogPolyfill.registerDialog(dialog);
  }

  function closeDialog() {
    if (dialog.open) {
      dialog.close();
    }
  }
  $(document.body)
    .on('click', '.js-dialog-ok', navigate({
      href: function(event) {
        return $(this).data('href');
      },
      target: '_blank'
    }))
    .on('click', '.js-dialog-ok', closeDialog)
    .on('click', '.js-dialog-close', closeDialog);

  function addMenuItem(group) {
    group.options.set('hasBalloon', false);

    // ---

    group.events.add('click', function(event) {
      var target = event.get('target');
      var name = target.properties.get('name');
      var description = target.properties.get('description');
      var href = $('a', description).attr('href');
      var src = $('img', description).attr('src');

      var $spinner = $('<div></div>')
        .addClass('mdl-spinner mdl-js-spinner is-active')
        .css({
          position: 'absolute',
          top: 'calc(50% - 14px)',
          left: 'calc(50% - 14px)'
        });

      var $img = $('<img>')
        .attr('src', src)
        .on('load', function() {
          $('.mdl-dialog__content', dialog)
            .empty()
            .append($img);
        });

      $('.mdl-dialog__title', dialog).text(name);
      $('.mdl-dialog__content', dialog)
        .empty()
        .append($spinner);



      $('.js-dialog-ok', dialog).data('href', href);

      $('.mdl-dialog__title', dialog).text(name);

      if (!dialog.open) {
        dialog.showModal();
      }
    });

    // ---

    var icon_link = group.properties.get('metaDataProperty.AnyMetaData.icon_link');
    var name = group.properties.get('name');

    $('<a>')
      .text(name)
      .attr('href', 'javascript: void(null)')
      .addClass('mdl-navigation__link')
      .addClass(icon_link)
      .on('click', onclick)
      .appendTo($mapGroups);

    function onclick(event) {
      var $this = $(this);
      var isActive = $this.hasClass('is-active');
      if (isActive) {
        map.geoObjects.remove(group);
      } else {
        map.geoObjects.add(group);
      }
      $this.toggleClass('is-active', !isActive);
      document.querySelector('.mdl-layout').MaterialLayout.toggleDrawer()
      event.preventDefault();
    }
  }

  // ---

  $(document).on('click', '.js-map-center', jsMapCenter);

  function jsMapCenter(event) {
    var data = $(event.target).data('map');
    map.setCenter(data.center, data.zoom);
  }

  // ---

  function navigate(_attrs) {
    var attrs = $.extend({}, _attrs);
    var $a = $('<a>');
    return function(event) {
      var _this = this;

      $.each(_attrs, function(key, value) {
        if (typeof value === 'function') {
          attrs[key] = value.call(_this, event);
        }
      });

      $a.attr(attrs);

      $a.click();
      window.location = attrs.href;

      event.preventDefault();
    }
  }
});

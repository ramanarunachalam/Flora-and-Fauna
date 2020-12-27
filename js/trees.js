const BANGALORE_LAT  = 12.97729;
const BANGALORE_LONG = 77.59973;

function is_array(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

function set_language(obj) {
    window.parent.TREE_LANG_OPT = obj.value;
}

function UrlParameters(q) {
    if(q.length > 1) this.q = q.substring(1, q.length);
    else this.q = null;
        this.keyValuePairs = new Array();
    if(q) {
        for(var i=0; i < this.q.split("&").length; i++) {
            this.keyValuePairs[i] = this.q.split("&")[i];
        }
    }

    this.getKeyValuePairs = function() { return this.keyValuePairs; }

    this.getValue = function(s) {
        for(var j=0; j < this.keyValuePairs.length; j++) {
            if(this.keyValuePairs[j].split("=")[0] == s)
                return this.keyValuePairs[j].split("=")[1];
        }
        return '';
    }

    this.getParameters = function() {
        var a = new Array(this.getLength());
        for(var j=0; j < this.keyValuePairs.length; j++) {
            a[j] = this.keyValuePairs[j].split("=")[0];
        }
        return a;
    }

    this.getLength = function() { return this.keyValuePairs.length; }
}

function render_template_data(template_name, id_name, data) {
    var ul_template = $(template_name).html();
    var template_html = Mustache.to_html(ul_template, data);
    $(id_name).html(template_html);
}

function tree_nav_init() {
    $('.nav li').bind('click', function() {
       $(this).addClass('active').siblings().removeClass('active');
    });
}

function set_key_map(d_obj, d_map, d_key) {
    var d = d_obj[d_key];
    if (d[0] == 1) {
        d_obj[d_key] = d_map[d[1]];
    } else {
        d_obj[d_key] = d[1];
    }
}

function set_key_value_map(d_obj, d_map, lang_map, d_key) {
    var d = d_obj[d_key];
    if (d[0] == 1) {
        var l_name = d_map[d[1]];
        var l_map = lang_map[l_name];
        d_obj[d_key] = l_map[d[2]];
    } else {
        d_obj[d_key] = d[2];
    }
}

function tree_module_init(data) {
    if (window.parent.info_initialized == undefined) {
        window.parent.TREE_CARD_DATA = data;
        var url = '../../language.json';
        $.getJSON(url, function(lang_obj) {
            window.parent.TREE_LANG_DATA = lang_obj;
            window.parent.TREE_LANG_OPT = 'English';
            window.parent.info_initialized = true;
            tree_module_init(window.parent.TREE_CARD_DATA);
        });
        return;
    }

    window.parent.TREE_CARD_DATA = data;
    window.parent.TREE_MAP_DATA = data['mapinfo'];
    window.parent.TREE_BOX_DATA = data['mapregion'];

    var lang_obj = window.parent.TREE_LANG_DATA;
    var lang = window.parent.TREE_LANG_OPT;
    var lang_map = lang_obj[lang];
    var english_lang_map = lang_obj['English'];
    var english_key_info = english_lang_map['Key Name'];
    var key_group = lang_map['Key Group'];
    var key_part = lang_map['Key Part'];
    var key_image = lang_map['Image'];
    var key_name = lang_map['Name'];
    if (key_name === undefined) {
        key_name = english_lang_map['Name']; 
    }
    var card_data = window.parent.TREE_CARD_DATA;
    var gallery_info = card_data['galleryinfo']
    set_key_map(gallery_info, key_group, 'HH');
    set_key_map(gallery_info, key_name, 'HN');
    var gallery_list = gallery_info['gallery']
    for (var i = 0; i < gallery_list.length; i++) {
        set_key_map(gallery_list[i], key_image, 'IC');
    }
    var info_list = card_data['cardinfo'];
    for (var i = 0; i < info_list.length; i++) {
        var cv_info = info_list[i];
        cv_info['CN'] = key_group[cv_info['CN']];
        var cv_list = cv_info['CV'];
        for (var j = 0; j < cv_list.length; j++) {
            var cv = cv_list[j];
            cv['N'] = key_part[cv['N']]; 
            set_key_value_map(cv, english_key_info, lang_map, 'V');
        } 
    }
    render_template_data('#card-info-template', '#CARDINFO', card_data);
}

function tree_part_init(data) {
    var lang_obj = window.parent.TREE_LANG_DATA;
    var lang = window.parent.TREE_LANG_OPT;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];
    var english_lang_map = lang_obj['English'];
    var english_key_info = english_lang_map['Key Name'];
    var card_list = data['cardinfo'];
    for (var i = 0; i < card_list.length; i++) {
        set_key_value_map(card_list[i], english_key_info, lang_map, 'N');
        var row_list = card_list[i]['ROW'];
        for (var j = 0; j < row_list.length; j++) {
            var col_list = row_list[j]['COL'];
            for (var k = 0; k < col_list.length; k++) {
                set_key_map(col_list[k], key_name, 'CN');
            }
        }
    }
    render_template_data('#card-info-template', '#CARDINFO', data);
}

function tree_simple_init(data) {
    render_template_data('#card-info-template', '#CARDINFO', data);
}

function tree_intro_init(data) {
    window.parent.info_initialized = true;
    window.parent.TREE_LANG_OPT = 'English';
    window.parent.search_initialized = false;
    window.parent.area_marker_list = [];
    window.parent.area_popup_list = [];
    window.parent.area_tooltip_list = [];
    window.parent.map_initialized = false;

    window.onload = tree_info_init;

    render_template_data('#carousel-template', '#SLIDERINFO', data);
    create_icons();
    search_init();
}

function tree_info_init() {
    var url = '../language.json';
    $.getJSON(url, function(lang_obj) {
        window.parent.TREE_LANG_DATA = lang_obj;
        transliterator_init();
    });

    $('.carousel').carousel({
          pause: "hover",
          interval: 3000
    });

    $('.carousel').on('slide.bs.carousel', function(){
        var $next = $('.active', this).next();
        if ($next != undefined) {
            $next = $('img', $next);
            $next.attr('src', $next.attr('data_src'));
        }
    });

    var start_tree_id = Math.floor((Math.random() * $('.carousel-item').length));
    var $img = $('.carousel-item').eq(start_tree_id);
    $img.addClass('active');
    $img = $('img', $img);
    $img.attr('src', $img.attr('data_src'));
}

function search_init() {
    window.parent.flora_fauna_search_engine = new MiniSearch({
        fields: [ 'aka' ], // fields to index for full-text search
        storeFields: ['name', 'genus', 'species', 'href', 'category', 'pop'] // fields to return with search results
    });
    window.parent.search_initialized = false;
    search_load();
}

var current_page = 1;
var max_page = 100;

function set_grid_page() {
    var page = new UrlParameters(window.location.search);
    current_page = unescape(page.getValue('page'));
    if (current_page == '') {
        current_page = 1;
    }
    else {
        current_page = parseInt(current_page);
    }

    $('.active').removeClass('active');
    var id_str = 'top_' + current_page
    $('li#' + id_str).addClass('active');
    var id_str = 'bottom_' + current_page
    $('li#' + id_str).addClass('active');

    max_page = unescape(page.getValue('max'));
    if (max_page == '') {
        max_page = 100;
    }
    else {
        max_page = parseInt(max_page);
    }
}

function show_page(which, is_prev) {
    var path_list = window.location.pathname.split('/');
    var new_page = 1;
    if (is_prev) {
        new_page = 1;
        if (current_page > 1) {
            new_page = parseInt(current_page) - 1;
        }
    } else {
        new_page = max_page;
        if (current_page < max_page) {
            new_page = parseInt(current_page) + 1;
        }
    }
    current_page = new_page;
    var id_str = which + '_' + new_page;
    var href = $('li#' + id_str).children('a').attr('href');
    window.open(href,'_self',false);
}

function show_top_prev_page() {
    show_page('top', true);
}

function show_top_next_page() {
    show_page('top', false);
}

function show_bottom_prev_page() {
    show_page('bottom', true);
}

function show_bottom_next_page() {
    show_page('bottom', false);
}

function tree_grid_load() {
    set_grid_page();
}

function tree_grid_init(data) {
    data['pageinfo']['N'] = 'top';
    render_template_data('#pagination-template', '#TOPPAGE', data);
    data['pageinfo']['N'] = 'bottom';
    render_template_data('#pagination-template', '#BOTTOMPAGE', data);

    var lang_obj = window.parent.TREE_LANG_DATA;
    var lang = window.parent.TREE_LANG_OPT;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];
    var row_list = data['cardinfo']['ROW'];
    for (var i = 0; i < row_list.length; i++) {
        var row = row_list[i];
        if ('COLA' in row) { 
            set_key_map(row['COLA'], key_name, 'CN');
        } else if ('COLG' in row) { 
            set_key_map(row['COLG'], key_name, 'CN');
        } else if ('COLF' in row) { 
            set_key_map(row['COLF'], key_name, 'CN');
        }
    }
    render_template_data('#card-info-template', '#CARDINFO', data);

    $("#top-page-next").click(show_top_next_page);
    $("#top-page-previous").click(show_top_prev_page);
    $("#bottom-page-next").click(show_bottom_prev_page);
    $("#bottom-page-previous").click(show_bottom_prev_page);

    window.onload = tree_grid_load;
}

function show_bigger_image() {
    var image_src = arguments[0];
    var caption = arguments[1];

    $("#IMAGE_IN_MODAL").attr("src", image_src)
    $("#IMAGE_MODEL_LABEL").html(caption)
    $('#IMAGE_MODAL').modal();
}

function search_load() {
    if (window.parent.search_initialized) {
        return;
    }
    var url = '../flora_index.json';
    var search_engine = window.parent.flora_fauna_search_engine;
    $.getJSON(url, function(search_obj) {
        var data_id = 0;
        for (var category in search_obj) {
            var data_list = search_obj[category];
            data_list.forEach(function (data_item, data_index) {
                var data_doc = { "id" : data_id, "name" : data_item.N, 'aka' : data_item.A, "family" : data_item.F, "genus" : data_item.G, "species" : data_item.S, "href" : data_item.H, "category" : data_item.T, "pop" : data_item.P };
                search_engine.add(data_doc);
                data_id += 1;
            });
        }
    });
    window.parent.search_initialized = true;
}

function transliterator_init() {
    var lang_obj = window.parent.TREE_LANG_DATA;
    var char_map = lang_obj['Charmap'];
    var key_list = [];
    var max_len = 0;
    for (var s in char_map) {
        key_list.push(s); 
        max_len = Math.max(max_len, s.length);
    }
    window.parent.CHAR_MAP_MAX_LENGTH = max_len;
    window.parent.CHAR_MAP_KEY_LIST = new Set(key_list);
}

function transliterate_text(word) {
    var lang_obj = window.parent.TREE_LANG_DATA;
    var char_map = lang_obj['Charmap'];

    var tokenset = window.parent.CHAR_MAP_KEY_LIST;
    var maxlen = window.parent.CHAR_MAP_MAX_LENGTH;
    var current = 0;
    var tokenlist = [];
    word = word.toString();
    while (current < word.length) {
        var nextstr = word.slice(current, current+maxlen);
        var p = nextstr[0];
        var j = 1;
        var i = maxlen;
        while (i > 0) {
            var s = nextstr.slice(0, i);
            if (tokenset.has(s)) {
                p = s;
                j = i;
                break
            }
            i -= 1;
        }
        if (p in char_map) {
            p = char_map[p];
        }
        tokenlist.push(p);
        current += j;
    }
    return tokenlist.join('');
}

function get_search_results(search_word, search_options, item_list, id_list) {
    var lang_obj = window.parent.TREE_LANG_DATA;
    var lang = window.parent.TREE_LANG_OPT;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];
    var search_engine = window.parent.flora_fauna_search_engine;
    var results = search_engine.search(search_word, search_options);
    if (results.length > 0) {
        var max_score = results[0].score;
        results.forEach(function (result_item, result_index) {
            if (!id_list.has(result_item.id)) {
                var d = result_item.name;
                if (d[0] == 1) {
                    var name = key_name[d[1]];
                } else {
                    var name = d[1];
                }
                var item = { 'T' : result_item.category, 'H' : result_item.href, 'N' : name, 'G' : result_item.genus, 'S' : result_item.species, 'P' : result_item.pop };
                item_list.push(item);
                id_list.add(result_item.id);
            }
        });
    }
}

function tree_search_init() {
    var params = new UrlParameters(window.location.search);
    var search_word = params.getValue('word');
    var search_word = decodeURI(search_word);
    var t_word = transliterate_text(search_word);
    search_word = t_word;
    const s_search_word = search_word.replace(/\s/g, '');
    var item_list = [];
    var id_list = new Set();
    var search_options = { prefix: true, combineWith: 'AND', fuzzy: term => term.length > 3 ? 0.1 : null };
    get_search_results(search_word, search_options, item_list, id_list);
    if (search_word != s_search_word) {
        get_search_results(s_search_word, search_options, item_list, id_list);
    }
    item_list.sort(function (a, b) { return b.P - a.P; });
    var new_item_list = item_list.slice(0, 25);
    var item_data = { "searchinfo" : { "results" : new_item_list } };
    render_template_data('#search-template', '#CARDINFO', item_data);
    window.scrollTo(0, 0);
}

function create_osm_map(module, id_name, c_lat, c_long) {
    var osm_map = new L.map(id_name, { center: [c_lat, c_long], zoom: 18, minZoom: 16, maxZoom: 21 });
    osm_map.on('zoomend dragend', draw_map_on_move);

    var tile_layer = new L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: ['a', 'b', 'c'],
      maxNativeZoom: 18,
      maxZoom: 21 
    });
    tile_layer.addTo(osm_map);
    var geocoder = new L.Control.geocoder({
        geocoder: L.Control.Geocoder.nominatim({
            geocodingQueryParams: { countrycodes: 'in' }
        })
    });
    geocoder.addTo(osm_map);
    if (module == 'area') {
        geocoder.on('markgeocode', handle_geocoder_mark);
    }

    init_conetxt_menu();

    return osm_map;
}

function create_icons() {
    window.parent.green_tree_icon = new L.icon({
        iconUrl: 'icons/marker_tree_green.png',
        iconSize: [24, 24],
    });
    window.parent.green_bloom_icon = new L.icon({
        iconUrl: 'icons/marker_bloom_green.png',
        iconSize: [24, 24],
    });
    window.parent.red_tree_icon = new L.icon({
        iconUrl: 'icons/marker_tree_red.png',
        iconSize: [24, 24],
    });
    window.parent.red_bloom_icon = new L.icon({
        iconUrl: 'icons/marker_bloom_red.png',
        iconSize: [24, 24],
    });
}

function get_url_prefix(handle_map, tree_id) {
    var handle = handle_map[tree_id];
    var prefix = handle[0] + '/' + handle[1] + ' - ' + handle[2] + '/';
    var url = prefix + handle[2] + '.html'
    var image = handle[2] + ' - ' + handle[3];
    return [prefix, image, url];
}

function get_url_info(handle_map, tree_id, name, level) {
    const [prefix, image, url] = get_url_prefix(handle_map, tree_id);
    if (level == 'popup') {
        var image_url = prefix + image + '.jpg'
        var image_style = 'style="width: 240px; height: 180px;"';
    } else {
        var image_url = prefix + 'Thumbnails/' + image + '.thumbnail'
        var image_style = '';
    }
    var html = '<a href="' + url + '" align="center"><div class="thumbnail"><img ' + image_style + ' src="' + image_url + '" class="shadow-box"><p align="center">' + name + '</p></div></a>';
    return html;
}

function get_blooming_info(handle_map, tree_id) {
    var handle = handle_map[tree_id];
    var blooming = handle[4];
    return blooming;
}

function get_needed_icon(selected, blooming) {
    var icon = window.parent.green_tree_icon;
    if (selected) {
        if (blooming) {
            icon = window.parent.red_bloom_icon;
        } else {
            icon = window.parent.red_tree_icon;
        }
    } else {
        if (blooming) {
            icon = window.parent.green_bloom_icon;
        }
    }
    return icon;
}

function get_tree_handle(tree_id) {
    var lang_obj = window.parent.TREE_LANG_DATA;
    var lang = window.parent.TREE_LANG_OPT;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];
    var handle_map = lang_obj['Handle'];
    var name = key_name[tree_id];
    return [ name, handle_map ];
}

function set_chosen_image(tree_id) {
    const [ name, handle_map ] = get_tree_handle(tree_id);
    var tooltip_html = get_url_info(handle_map, tree_id, name, 'tooltip');
    $('#IMAGEINFO').html(tooltip_html);
}

function init_conetxt_menu() {
    $.contextMenu({
      selector: 'img.leaflet-marker-icon',
      callback: function(key, options) {
          var marker = window.parent.TREE_CONTEXT_MARKER;
          var tree_id = marker.tree_id;
          var pos = marker.getLatLng();
          if (key == 'info') {
              const [ name, handle_map ] = get_tree_handle(tree_id);
              const [prefix, image, url] = get_url_prefix(handle_map, tree_id);
              window.open(url, 'FRAME_CONTENT');
          } else if (key == 'tmap') {
              var url = 'tree_area.html?area=trees&aid=' + tree_id;
              window.open(url, 'FRAME_CONTENT');
          } else if (key == 'gmap') {
              var url = 'http://maps.google.com/maps?z=12&t=m&q=loc:' + pos.lat + '+' + pos.lng;
              window.open(url, '');
          }
      },
      items: {
          "info": {
              name: "Tree Info",
              icon: "info"
          },
          "tmap": {
              name: "Tree Map",
              icon: "map"
          },
          "gmap": {
              name: "Google Map",
              icon: "gmap"
          },
          "sep1": "---------",
          "quit": {
              name: "Quit",
              icon: "quit"
          }
      }
    });
}

function marker_on_mouseover() {
    set_chosen_image(this.tree_id);
}

function marker_on_mouseout() {
    if (window.parent.map_tree_id != 0) {
        set_chosen_image(window.parent.map_tree_id);
    }
}

function marker_on_click(e) {
    var tree_id = e.target.tree_id;
    window.parent.map_tree_id = tree_id;
    var area_marker_list = window.parent.area_marker_list;
    for (var i = 0; i < area_marker_list.length; i++) {
        var marker = area_marker_list[i];
        var icon = get_needed_icon((marker.tree_id == tree_id), marker.blooming);
        marker.setIcon(icon);
    }
}

function marker_on_doubleclick(e) {
    var tree_id = e.target.tree_id;
    const [ name, handle_map ] = get_tree_handle(tree_id);
    const [prefix, image, url] = get_url_prefix(handle_map, tree_id);
    window.parent.map_tree_id = tree_id;
    window.open(url, 'FRAME_CONTENT');
}

function marker_on_contextmenu(e) {
    window.parent.TREE_CONTEXT_MARKER = this;
}

function draw_map_on_move(ev) {
    var osm_map = window.parent.map_osm_map;
    var a_name = window.parent.map_area_name;
    var aid = window.parent.map_area_id;
    var tid = window.parent.map_tree_id;
    var latlong = osm_map.getCenter();
    window.parent.map_area_move = true;
    show_area_latlong_in_osm(a_name, aid, tid, latlong.lat, latlong.lng);
    window.parent.map_area_move = false;
}

function handle_geocoder_mark(ev) {
    draw_map_on_move(ev);
}

function show_area_latlong_in_osm(a_name, aid, tid, c_lat, c_long) {
    var area = window.parent.AREA_TYPE;
    var old_a_name = window.parent.map_area_name;
    window.parent.map_area_name = a_name;
    window.parent.map_area_id = aid;
    if (tid == 0 && window.parent.map_tree_id != undefined) {
        tid = window.parent.map_tree_id;
    }
    window.parent.map_tree_id = tid;

    $('#TITLE_HEADER').html(a_name);
    if (window.parent.map_initialized) {
        var osm_map = window.parent.map_osm_map;
        /*
        var layer = window.parent.map_area_layer;
        if (layer != undefined) {
            layer.remove();
        }
        */
        var area_marker_list = window.parent.area_marker_list;
        for (var i = 0; i < area_marker_list.length; i++) {
            osm_map.removeLayer(area_marker_list[i]);
            //layer.removeLayer(area_marker_list[i]);
        }
        osm_map.setView([c_lat, c_long]);
    } else {
        var id_name = 'MAPINFO';
        var osm_map = create_osm_map('area', id_name, c_lat, c_long);
        window.parent.map_osm_map = osm_map;
        /*
        window.parent.map_area_layer = L.markerClusterGroup();
        window.parent.map_area_layer.addTo(osm_map);
        */
        window.parent.map_area_move = false;
        window.parent.map_initialized = true;
    }
    if (tid != undefined && tid != 0) {
        set_chosen_image(tid);
    }
    if (area == 'trees') {
        osm_map.options.minZoom = 12;
    }
    draw_area_latlong_in_osm(a_name, aid, tid, c_lat, c_long);
}

function area_carousel_init(tree_image_list) {
    window.parent.TREE_IMAGE_LIST = tree_image_list;
    $('#AREA_CAROUSEL').carousel({ interval: 5000 });
    var $img = $('.carousel-item').eq(0);
    $img.addClass('active');

    $('.carousel .carousel-item').each(function() {
      var next = $(this).next();
      if (!next.length) {
        next = $(this).siblings(':first');
      }
      next.children(':first-child').clone().appendTo($(this));

      if (next.next().length>0) {
        next.next().children(':first-child').clone().appendTo($(this));
      }
      else {
        $(this).siblings(':first').children(':first-child').clone().appendTo($(this));
      }
    });

    $('.carousel').on('slide.bs.carousel', function(ev) {
        var tree_image_list = window.parent.TREE_IMAGE_LIST;
        var tree_id = tree_image_list[ev.from + 2]['TID'];
        // console.log('SLIDE: ' + ev.from + ' ' + tree_id);
        for (var i = 0; i < area_marker_list.length; i++) {
            var marker = area_marker_list[i];
            var icon = get_needed_icon((marker.tree_id == tree_id), marker.blooming);
            marker.setIcon(icon);
        }
    });
}

function draw_area_latlong_in_osm(a_name, aid, tid, c_lat, c_long) {
    var osm_map = window.parent.map_osm_map;
    var area = window.parent.AREA_TYPE;
    var lang_obj = window.parent.TREE_LANG_DATA;
    var lang = window.parent.TREE_LANG_OPT;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];
    var handle_map = lang_obj['Handle'];

    var s_id = 0;
    if (area == 'trees') {
        s_id = aid;
    } else if (tid != 0) {
        s_id = tid;
    }

    var bounds = osm_map.getBounds();
    var area_marker_list = [];
    var tree_dict = {};
    var grid_flora = window.parent.GRID_FLORA;
    for (var mesh_id in grid_flora) {
        if (!grid_flora.hasOwnProperty(mesh_id)) {
            continue;
        }
        var mesh_latlong_dict = grid_flora[mesh_id];
        for (var tree_id in mesh_latlong_dict) {
            if (!mesh_latlong_dict.hasOwnProperty(tree_id)) {
                continue;
            }
            if (area == 'trees' && aid != tree_id) {
                continue;
            }
            var blooming = get_blooming_info(handle_map, tree_id);
            var icon = get_needed_icon((s_id == tree_id), blooming);
            var latlong_list = mesh_latlong_dict[tree_id];
            var count = 0;
            for (var i = 0; i < latlong_list.length; i++) {
                var latlong = latlong_list[i];
                var m_lat = parseFloat(latlong[0]);
                var m_long = parseFloat(latlong[1]);
                if (area == 'trees') {
                    var visible = true;
                } else {
                    var visible = bounds.contains([m_lat, m_long]);
                }
                if (visible) {
                    var marker = new L.marker([m_lat, m_long], {icon: icon});
                    /*
                    var opts = {
                        contextmenu: true,
                        contextmenuWidth: 140,
                        contextmenuItems: [{
                            text: 'Marker item',
                            index: 0
                          }, {
                            separator: 'Marker item',
                            index: 1
                          }],
                        icon: icon
                    };
                    var marker = new L.marker(L.latLng(m_lat, m_long), opts);
                    */
                    marker.tree_id = tree_id;
                    marker.blooming = blooming;
                    osm_map.addLayer(marker);
                    //window.parent.map_area_layer.addLayer(marker);
                    marker.on('mouseover', marker_on_mouseover);
                    marker.on('mouseout', marker_on_mouseout);
                    marker.on('click', marker_on_click);
                    marker.on('dblclick', marker_on_doubleclick);
                    marker.on('contextmenu', marker_on_contextmenu);
                    area_marker_list.push(marker);
                    count += 1;
                }
            }
            if (count > 0) {
                tree_dict[tree_id] = (tree_dict[tree_id] || 0) + count;
            }
        }
    }

    window.parent.area_marker_list = area_marker_list;
    /*
    var layer = new L.featureGroup(area_marker_list);
    layer.addTo(osm_map);
    window.parent.map_area_layer = layer;
    */

    if (area == 'trees' && !window.parent.map_area_move && area_marker_list.length > 0) {
        var layer = new L.featureGroup(area_marker_list);
        osm_map.fitBounds(layer.getBounds());
    }

    if (area == 'current') {
        if (window.parent.map_area_routing != undefined) {
            var routing = window.parent.map_area_routing;
        } else {
            var latlong = area_marker_list[area_marker_list.length - 1].getLatLng();
            var routing = new L.Routing.control({
                waypoints: [
                    L.latLng(c_lat, c_long),
                    L.latLng(latlong.lat, latlong.lng)
                ],
                geocoder: L.Control.Geocoder.nominatim({geocodingQueryParams: { countrycodes: 'in' }})
            });
            routing.addTo(osm_map);
            // routing.hide();
        }
        window.parent.map_area_routing = routing;
    }

    var tree_stat_list = [];
    var tree_image_list = [];
    for (var tid in tree_dict) {
        if (!tree_dict.hasOwnProperty(tid)) {
            continue;
        }
        var t_name = key_name[tid];
        tree_stat_list.push({ 'TN' : t_name, 'TC' : tree_dict[tid], 'AID' : aid, 'TID' : tid, 'ALAT' : c_lat, 'ALONG' : c_long })
        const [prefix, image, url] = get_url_prefix(handle_map, tid);
        var image_url = prefix + 'Thumbnails/' + image + '.thumbnail'
        tree_image_list.push({ 'SN' : t_name, 'SI' : image_url, 'TID' : tid, 'SC' : tree_dict[tid] })
    }
    if (tree_stat_list.length > 0) {
        tree_stat_list.sort(function (a, b) { return b.TC - a.TC; });
        var data = { 'trees' : tree_stat_list };
        render_template_data('#tree-stats-template', '#STATINFO', data);
        tree_image_list.sort(function (a, b) { return b.SC - a.SC; });
        var data = { 'sliderinfo' : { 'items' : tree_image_list } };
        render_template_data('#tree-carousel-template', '#SLIDERINFO', data);
        area_carousel_init(tree_image_list);
    }
    window.scrollTo(0, 0);
}

function tree_area_init(item_data) {
    var params = new UrlParameters(window.location.search);
    var area = params.getValue('area');
    var aid = params.getValue('aid');
    if (area == undefined) {
        var area = window.parent.AREA_TYPE;
        var aid = window.parent.AREA_ID;
    }
    window.parent.AREA_TYPE = area;
    window.parent.AREA_ID = aid;
    window.parent.AREA_DATA = item_data;

    if (window.parent.info_initialized == undefined) {
        window.parent.TREE_CARD_DATA = data;
        var url = 'language.json';
        $.getJSON(url, function(lang_obj) {
            window.parent.TREE_LANG_DATA = lang_obj;
            window.parent.TREE_LANG_OPT = 'English';
            window.parent.info_initialized = true;
            create_icons();
            tree_area_init(window.parent.AREA_DATA);
        });
        return;
    }

    var lang_obj = window.parent.TREE_LANG_DATA;
    var lang = window.parent.TREE_LANG_OPT;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];

    var lat_long = [ BANGALORE_LAT, BANGALORE_LONG ];
    var name = area[0].toUpperCase() + area.slice(1);
    if (area == 'parks') {
        var data = item_data['parks'];
        if (aid != '') {
            var area_list = data['parkinfo'];
            for (var i = 0; i < area_list.length; i++) {
                var park_list = area_list[i]['parks'];
                for (var j = 0; j < park_list.length; j++) {
                    var park = park_list[j];
                    if (park['PID'] == aid) {
                        name = park['PN'];
                        lat_long = [ parseFloat(park['PLAT']), parseFloat(park['PLONG']) ];
                    }
                }
            }
        }
        render_template_data('#sidenav-template', '#NAVINFO', data);
        render_template_data('#stats-template', '#STATINFO', data);
    } else if (area == 'wards') {
        var data = item_data['wards'];
        if (aid != '') {
            var ward_list = data['wardinfo'];
            for (var i = 0; i < ward_list.length; i++) {
                var ward = ward_list[i];
                if (ward['AID'] == aid) {
                    name = ward['AN'];
                    lat_long = [ parseFloat(ward['ALAT']), parseFloat(ward['ALONG']) ];
                }
            }
        }
        render_template_data('#sidenav-template', '#NAVINFO', data);
        render_template_data('#stats-template', '#STATINFO', data);
    } else if (area == 'trees') {
        var data = item_data['maps'];
        var tree_list = data['mapinfo'];
        for (var i = 0; i < tree_list.length; i++) {
            var an = tree_list[i];
            var tree_id = an['AN'];
            an['AN'] = key_name[tree_id];
            if (tree_id == aid) {
                lat_long = [ parseFloat(an['ALAT']), parseFloat(an['ALONG']) ];
            }
        }
        render_template_data('#sidenav-template', '#NAVINFO', data);
    } else if (area == 'current') {
    } else {
        return;
    }

    var url = 'grid.json';
    $.getJSON(url, function(grid_obj) {
        window.parent.GRID_FLORA = grid_obj['grid flora'];
        window.parent.GRID_MESH = grid_obj['grid mesh'];
        window.parent.GRID_CENTRE = grid_obj['grid centre'];
        window.parent.map_initialized = false;

        var tid = 0;
        if (window.parent.map_tree_id != undefined) {
            tid = window.parent.map_tree_id;
        }
        if (area == 'trees') {
            var handle_map = lang_obj['Handle'];
            if (aid != 0) {
                tid = aid;
                name = handle_map[aid][2];
            } else if (tid != 0) {
                aid = tid;
                name = handle_map[aid][2];
            } else if (aid == 0 || aid == '0') {
                var tree_list = Object.keys(handle_map);
                aid = tree_list[Math.floor(Math.random() * tree_list.length)];
                name = handle_map[aid][2];
            } else {
                name = params.getValue('name');
                name = name.replace(/%20/g, ' ');
            }
            if (tid == 0) {
                tid = aid;
            }
        }
        show_area_latlong_in_osm(name, aid, tid, lat_long[0], lat_long[1]);
    });
}

function transliterator_word() {
    var source = $('#SOURCE').val();
    source = source.replace(/\n/g, "<br />");
    var target = transliterate_text(source);
    $('#TARGET').html(target);
}

function tree_transliterator_init() {
    var url = 'language.json';
    $.getJSON(url, function(lang_obj) {
        window.parent.TREE_LANG_DATA = lang_obj;
        transliterator_init();
    });

    var input = document.getElementById('SOURCE');
    input.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            transliterator_word();
        }
    });
}

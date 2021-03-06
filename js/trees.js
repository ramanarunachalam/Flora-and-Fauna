const BANGALORE_LAT  = 12.97729;
const BANGALORE_LONG = 77.59973;
const BANGALORE_LAT_LONG = [ BANGALORE_LAT, BANGALORE_LONG ];
const BANGALORE_BBOX = '77.299805,12.762250,77.879333,13.170423';

function is_array(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

function capitalize_word(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function get_url_params() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
    function(m,key,value) {
      vars[key] = value;
    });
    return vars;
}

function set_language(obj) {
    window.parent.GOT_LANGUAGE = obj.value;
    window.parent.render_language = MAP_LANG_DICT[obj.value];
    load_menu_data();
}

function render_template_data(template_name, id_name, data) {
    var ul_template = $(template_name).html();
    var template_html = Mustache.to_html(ul_template, data);
    $(id_name).html(template_html);
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

function tree_module_init(region, file_name, data) {
    if (window.parent.info_initialized == undefined) {
        window.parent.tree_card_data = data;
        var url = '../../language.json';
        $.getJSON(url, function(lang_obj) {
            window.parent.tree_lang_data = lang_obj;
            window.parent.render_language = 'English';
            window.parent.info_initialized = true;
            tree_module_init(window.parent.tree_card_data);
        });
        return;
    }

    window.parent.tree_card_data = data;
    window.parent.tree_map_data = data['mapinfo'];
    window.parent.tree_box_data = data['mapregion'];

    var lang_obj = window.parent.tree_lang_data;
    var lang = window.parent.render_language;
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
    var card_data = window.parent.tree_card_data;
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
    render_template_data('#module-card-info-template', '#CARDINFO', card_data);
}

function tree_grid_init(region, type, data) {
    var lang_obj = window.parent.tree_lang_data;
    var lang = window.parent.render_language;
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
    render_template_data('#grid-card-info-template', '#CARDINFO', data);
}

function tree_simple_init(region, data) {
    render_template_data('#simple-card-info-template', '#CARDINFO', data);
}

function tree_intro_init(region, slider_data) {
    var lang = window.parent.render_language;

    var stats_list = slider_data['statsinfo'];
    get_lang_map(lang, stats_list);

    var lang_obj = window.parent.tree_lang_data;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];
    var slider_list = slider_data['sliderinfo']['items'];
    for (var i = 0; i < slider_list.length; i++) {
        var s_dict = slider_list[i];
        set_key_map(s_dict, key_name, 'SN');
    }

    render_template_data('#carousel-template', '#SLIDERINFO', slider_data);

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

function load_intro_data(region) {
    window.parent.tree_region = region;
    var lang = window.parent.render_language;
    var lang_obj = window.parent.tree_lang_data;
    var map_dict = lang_obj['Keys'];
    var intro_data = { 'N' : 'Tree', 'T' : 'Trees', 'P' : capitalize_word(region),
                       'I' : 'Keys To Identify', 'R' : 'References', 'B' : 'Books',
                       'L' : 'Leaves', 'F' : 'Flowers', 'BA' : 'Bark', 'FR' : 'Fruits', 'FI' : 'Figs', 'PO' : 'Pods',
                       'SP' : 'Spines', 'TW' : 'Branch', 'A' : 'Aerial Root', 'G' : 'Gall'
                     };
    for (var k in intro_data) {
         intro_data[k] = get_lang_map_word(lang, map_dict, intro_data[k]);
    }
    render_template_data('#intro-template', '#SECTION', intro_data);
    var url = `Flora/trees_${region}_intro.json`;
    $.getJSON(url, function(slider_data) {
        tree_intro_init(region, slider_data);
        add_history('introduction', { 'region' : region });
    });
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

function set_grid_page(current_page, max_page) {
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

function tree_collection_init(region, type, letter, page_index, max_page, data) {
    data['pageinfo']['N'] = 'top';
    render_template_data('#pagination-template', '#TOPPAGE', data);
    data['pageinfo']['N'] = 'bottom';
    render_template_data('#pagination-template', '#BOTTOMPAGE', data);

    var lang_obj = window.parent.tree_lang_data;
    var lang = window.parent.render_language;
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
    render_template_data('#collection-card-info-template', '#CARDINFO', data);

    $("#top-page-next").click(show_top_next_page);
    $("#top-page-previous").click(show_top_prev_page);
    $("#bottom-page-next").click(show_bottom_prev_page);
    $("#bottom-page-previous").click(show_bottom_prev_page);

    set_grid_page(page_index, max_page);
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
    var url = 'flora_index.json';
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
    var lang_obj = window.parent.tree_lang_data;
    var char_map = lang_obj['Charmap'];
    var key_list = [];
    var max_len = 0;
    for (var s in char_map) {
        key_list.push(s); 
        max_len = Math.max(max_len, s.length);
    }
    window.parent.char_map_max_length = max_len;
    window.parent.char_map_key_list = new Set(key_list);
}

function transliterate_text(word) {
    var lang_obj = window.parent.tree_lang_data;
    var char_map = lang_obj['Charmap'];

    var tokenset = window.parent.char_map_key_list;
    var maxlen = window.parent.char_map_max_length;
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
    var lang_obj = window.parent.tree_lang_data;
    var lang = window.parent.render_language;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];
    var map_dict = lang_obj['Keys'];
    var search_engine = window.parent.flora_fauna_search_engine;
    var results = search_engine.search(search_word, search_options);
    if (results.length > 0) {
        var max_score = results[0].score;
        results.forEach(function (result_item, result_index) {
            if (!id_list.has(result_item.id)) {
                var d = result_item.name;
                if (d[0] == 1) {
                    var name = key_name[d[1]];
                    var name_id = d[1];
                } else {
                    var name = d[1];
                    var name_id = '';
                }
                var category = get_lang_map_word(lang, map_dict, result_item.category);
                var item = { 'T' : category, 'H' : result_item.href, 'N' : name, 'G' : result_item.genus, 'S' : result_item.species, 'P' : result_item.pop };
                if (name_id != '') {
                    item['I'] = name_id;
                }
                item_list.push(item);
                id_list.add(result_item.id);
            }
        });
    }
}

function handle_search_word(search_word) {
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
    render_template_data('#search-template', '#SECTION', item_data);
    window.scrollTo(0, 0);
    add_history('search', { 'search' : search_word });
}

function load_search_data() {
    var search_word = document.getElementById('SEARCH_WORD').value;
    var search_word = decodeURI(search_word);
    handle_search_word(search_word);
}

function load_search_history(data) {
    var search_word = data['search'];
    document.getElementById('SEARCH_WORD').value = search_word;
    handle_search_word(search_word);
}

function get_geocoder_nominatim() {
    return L.Control.Geocoder.nominatim({
            geocodingQueryParams: { viewbox: BANGALORE_BBOX, countrycodes: 'in', bounded: 1 }
           });
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
    var geocoder = new L.Control.geocoder({ geocoder: get_geocoder_nominatim() });
    geocoder.addTo(osm_map);
    if (module == 'area') {
        geocoder.on('finishgeocode', handle_geocoder_mark);
    }

    init_conetxt_menu();

    return osm_map;
}

const MAP_ICON_SIZE = [24, 24];
function create_icons() {
    window.parent.green_tree_icon = new L.icon({
        iconUrl: 'icons/marker_tree_green.png',
        iconSize: MAP_ICON_SIZE
    });
    window.parent.green_bloom_icon = new L.icon({
        iconUrl: 'icons/marker_bloom_green.png',
        iconSize: MAP_ICON_SIZE
    });
    window.parent.red_tree_icon = new L.icon({
        iconUrl: 'icons/marker_tree_red.png',
        iconSize: MAP_ICON_SIZE
    });
    window.parent.red_bloom_icon = new L.icon({
        iconUrl: 'icons/marker_bloom_red.png',
        iconSize: MAP_ICON_SIZE
    });
}

function get_url_prefix(handle_map, tree_id) {
    var handle = handle_map[tree_id];
    var prefix = handle[0] + '/' + handle[1] + ' - ' + handle[2] + '/';
    var url = handle[1] + ' - ' + handle[2] + '/' + handle[2];
    var image = handle[2] + ' - ' + handle[3];
    return [prefix, image, url];
}

function get_url_info(handle_map, tree_id, name, level) {
    const [prefix, image, url] = get_url_prefix(handle_map, tree_id);
    var m_url = "javascript:load_module_data('" + url + "');";
    var a_url = "javascript:load_area_data('trees', '" + tree_id + "');";
    if (level == 'popup') {
        var image_url = prefix + image + '.jpg'
        var image_style = 'style="width: 240px; height: 180px;"';
    } else {
        var image_url = prefix + 'Thumbnails/' + image + '.thumbnail'
        var image_style = '';
    }
    var img_html = '<a href="' + m_url + '" align="center"><div class="thumbnail" align="center"><img ' + image_style + ' src="' + image_url + '" class="shadow-box"></a>';
    var name_html = '<a href="' + a_url + '"><p align="center">' + name + '</p></div></a>';
    var html = img_html + name_html;
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
    var lang_obj = window.parent.tree_lang_data;
    var lang = window.parent.render_language;
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
              load_module_data(url);
          } else if (key == 'tmap') {
              load_area_data('trees', tree_id);
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
    find_area_carousel_tree(tree_id);
}

function load_module_data_with_id(tree_id) {
    const [ name, handle_map ] = get_tree_handle(tree_id);
    const [prefix, image, url] = get_url_prefix(handle_map, tree_id);
    window.parent.map_tree_id = tree_id;
    load_module_data(url);
}

function marker_on_doubleclick(e) {
    var tree_id = e.target.tree_id;
    load_module_data_with_id(tree_id);
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

function get_area_centre() {
    if (window.parent.map_osm_map == undefined) {
        return [];
    }
    var latlong = window.parent.map_osm_map.getCenter();
    var area_latlong = [ latlong.lat, latlong.lng ];
    return area_latlong;
}

function handle_geocoder_mark(ev) {
    draw_map_on_move(ev);
    add_history('maps', { 'type' : window.parent.area_type, 'id' : window.parent.map_area_id });
}

function show_area_latlong_in_osm(a_name, aid, tid, c_lat, c_long) {
    var lang = window.parent.render_language;
    var map_dict = window.parent.tree_lang_data['Keys'];
    var area = window.parent.area_type;
    var old_a_name = window.parent.map_area_name;
    window.parent.map_area_name = a_name;
    window.parent.map_area_id = aid;
    if (tid == 0 && window.parent.map_tree_id != undefined) {
        tid = window.parent.map_tree_id;
    }
    window.parent.map_tree_id = tid;

    if (area == 'trees') {
        const [ t_name, t_handle_map ] = get_tree_handle(tid);
        var n_name = t_name;
    } else {
        var n_name = get_lang_map_word(lang, map_dict, capitalize_word(a_name));
        if (aid != '') {
            n_name = aid + '. ' + n_name;
        }
    }
    $('#TITLE_HEADER').html(n_name);

    if (window.parent.map_initialized) {
        var osm_map = window.parent.map_osm_map;
        var area_marker_list = window.parent.area_marker_list;
        for (var i = 0; i < area_marker_list.length; i++) {
            osm_map.removeLayer(area_marker_list[i]);
        }
        osm_map.setView([c_lat, c_long]);
    } else {
        var id_name = 'MAPINFO';
        var osm_map = create_osm_map('area', id_name, c_lat, c_long);
        window.parent.map_osm_map = osm_map;
        window.parent.map_area_move = false;
        window.parent.map_initialized = true;
    }
    if (tid != undefined && tid != 0) {
        set_chosen_image(tid);
    }
    if (area == 'trees') {
        osm_map.options.minZoom = 12;
    }
    draw_area_latlong_in_osm(n_name, a_name, aid, tid, c_lat, c_long);
    window.parent.area_latlong = [];
}

function load_area_latlong_in_osm(a_name, aid, tid, c_lat, c_long) {
    window.parent.area_latlong = [];
    show_area_latlong_in_osm(a_name, aid, tid, c_lat, c_long);
    add_history('maps', { 'type' : window.parent.area_type, 'id' : aid });
}

function find_area_carousel_tree(tree_id) {
    var tree_image_list = window.parent.tree_image_list;
    for (var i = 0; i < tree_image_list.length; i++) {
        var l_tree_id = tree_image_list[i]['TID'];
        if (l_tree_id == tree_id) {
            $('#AREA_CAROUSEL').carousel((i - 1) % tree_image_list.length);
            return i;
        }
    }
    return 0;
}

function area_chosen_tree(tree_id) {
    window.parent.map_tree_id = tree_id;
    var area_marker_list = window.parent.area_marker_list;
    for (var i = 0; i < area_marker_list.length; i++) {
        var marker = area_marker_list[i];
        var icon = get_needed_icon((marker.tree_id == tree_id), marker.blooming);
        marker.setIcon(icon);
    }
    set_chosen_image(tree_id);
}

function area_highlight_tree(tree_id) {
    var tree_image_list = window.parent.tree_image_list;
    var tree_index = tree_id % tree_image_list.length;
    var tree_id = tree_image_list[tree_index]['TID'];
    area_chosen_tree(tree_id);
}

function area_click_tree(tree_id) {
    var tree_index = find_area_carousel_tree(tree_id);
    area_chosen_tree(tree_id);
    window.scrollTo(0, 0);
}

function area_carousel_init(tree_image_list) {
    window.parent.tree_image_list = tree_image_list;
    $('#AREA_CAROUSEL').carousel({ interval: 0 });

    var start_id = tree_image_list.length - 1;
    var $img = $('.carousel-item').eq(start_id);
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
        area_highlight_tree(ev.to + 1);
    });

    var tree_id = window.parent.map_tree_id;
    var start_id = find_area_carousel_tree(tree_id);
    area_highlight_tree(start_id);
}

function draw_area_latlong_in_osm(n_name, a_name, aid, tid, c_lat, c_long) {
    var osm_map = window.parent.map_osm_map;
    var area = window.parent.area_type;
    var lang_obj = window.parent.tree_lang_data;
    var lang = window.parent.render_language;
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
                    marker.tree_id = tree_id;
                    marker.blooming = blooming;
                    osm_map.addLayer(marker);
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

    if (area == 'trees' && !window.parent.map_area_move && area_marker_list.length > 0) {
        var layer = new L.featureGroup(area_marker_list);
        osm_map.fitBounds(layer.getBounds());
    }

    if (area == 'current') {
        var latlong = area_marker_list[area_marker_list.length - 1].getLatLng();
        var point_list = [ L.latLng(c_lat, c_long), L.latLng(latlong.lat, latlong.lng) ];
        if (window.parent.map_area_routing != undefined) {
            var routing = window.parent.map_area_routing;
            osm_map.removeControl(routing);
        }
        var routing = new L.Routing.control({ geocoder: get_geocoder_nominatim() });
        routing.addTo(osm_map);
        routing.setWaypoints(point_list);
        window.parent.map_area_routing = routing;
    }

    var tree_stat_list = [];
    var tree_image_list = [];
    for (var tid in tree_dict) {
        if (!tree_dict.hasOwnProperty(tid)) {
            continue;
        }
        var t_name = key_name[tid];
        var blooming = get_blooming_info(handle_map, tid);
        var icon = (blooming) ? 'icons/marker_bloom_green.png' : 'icons/marker_tree_green.png';
        tree_stat_list.push({ 'TN' : t_name, 'TC' : tree_dict[tid], 'TI' : icon, 'AID' : aid, 'TID' : tid, 'ALAT' : c_lat, 'ALONG' : c_long })

        if (area != 'trees') {
            const [prefix, image, url] = get_url_prefix(handle_map, tid);
            var image_url = prefix + 'Thumbnails/' + image + '.thumbnail'
            tree_image_list.push({ 'SN' : t_name, 'SI' : image_url, 'SH' : url, 'TID' : tid, 'SC' : tree_dict[tid] })
        }
    }
    if (tree_stat_list.length > 0) {
        tree_stat_list.sort(function (a, b) { return b.TC - a.TC; });
        var tin = 1;
        var tcount = 0;
        for (var i = 0; i < tree_stat_list.length; i++) {
            var info = tree_stat_list[i];
            info['TIN'] = tin;
            tin += 1;
            tcount += info['TC'];
        }
        if (area != 'trees') {
            tin -= 1;
            var n_title = `${n_name} (<font color=brown>${tin} / ${tcount}</font>)`;
            $('#TITLE_HEADER').html(n_title);
        }
        var data = { 'trees' : tree_stat_list };
        render_template_data('#tree-stats-template', '#STATINFO', data);
        tree_image_list.sort(function (a, b) { return b.SC - a.SC; });
        var data = { 'sliderinfo' : { 'items' : tree_image_list } };
        render_template_data('#tree-carousel-template', '#SLIDERINFO', data);
        if (area == 'trees') {
            $('#SLIDERINFO').html('');
        } else {
            area_carousel_init(tree_image_list);
        }
    }
    window.scrollTo(0, 0);
}

function tree_area_init(area, aid, item_data) {
    if (window.parent.green_tree_icon == undefined) {
        create_icons();
    }

    if (area == undefined) {
        var area = window.parent.area_type;
        var aid = window.parent.area_id;
    }
    window.parent.area_type = area;
    window.parent.area_id = aid;
    window.parent.area_data = item_data;

    if (window.parent.info_initialized == undefined) {
        window.parent.tree_card_data = data;
        var url = 'language.json';
        $.getJSON(url, function(lang_obj) {
            window.parent.tree_lang_data = lang_obj;
            window.parent.render_language = 'English';
            window.parent.info_initialized = true;
            create_icons();
            tree_area_init(undefined, undefined, window.parent.area_data);
        });
        return;
    }

    var lang_obj = window.parent.tree_lang_data;
    var lang = window.parent.render_language;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];

    var lat_long = BANGALORE_LAT_LONG;
    if (window.parent.area_latlong == undefined) {
        window.parent.area_latlong = [];
    }
    if (window.parent.area_latlong.length > 0) {
        lat_long = window.parent.area_latlong;
    }
    var name = capitalize_word(area);
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

function load_area_data(area_type, area_id) {
    var lang = window.parent.render_language;
    var map_dict = window.parent.tree_lang_data['Keys'];
    var area_data = { 'T' : get_lang_map_word(lang, map_dict, 'Tree'),
                      'H' : get_lang_map_word(lang, map_dict, capitalize_word(area_type))
                    };
    render_template_data('#area-template', '#SECTION', area_data);
    var url = 'area.json';
    $.getJSON(url, function(item_data) {
        tree_area_init(area_type, area_id, item_data);
        add_history('maps', { 'type' : area_type, 'id' : area_id });
    });
}

function load_collection_data(type, letter, page_index, page_max) {
    var region = window.parent.tree_region;
    var collection_data = {};
    render_template_data('#page-template', '#SECTION', collection_data);
    var url = `Flora/trees_${region}_${type}_page_${letter}.json`;
    $.getJSON(url, function(item_data) {
        tree_collection_init(region, type, letter, page_index, page_max, item_data);
        add_history('collections', { 'type' : type, 'letter' : letter, 'page' : page_index, 'max' : page_max });
    });
}

function load_category_data(type) {
    var region = window.parent.tree_region;
    var grid_data = {};
    render_template_data('#grid-template', '#SECTION', grid_data);
    var url = `Flora/trees_${region}_${type}_grid.json`;
    $.getJSON(url, function(item_data) {
        tree_grid_init(region, type, item_data);
        add_history('categories', { 'type' : type });
    });
}

function load_simple_data() {
    var region = window.parent.tree_region;
    var simple_data = {};
    render_template_data('#simple-template', '#SECTION', simple_data);
    var url = `Flora/trees_${region}_simple.json`;
    $.getJSON(url, function(item_data) {
        tree_simple_init(region, item_data);
        add_history('alphabetical', { 'region' : region });
    });
}

function load_module_data(file_name) {
    var region = window.parent.tree_region;
    var module_data = {};
    render_template_data('#module-template', '#SECTION', module_data);
    var url = `Flora/${file_name}.json`;
    $.getJSON(url, function(item_data) {
        tree_module_init(region, file_name, item_data);
        add_history('trees', { 'module' : file_name });
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
        window.parent.tree_lang_data = lang_obj;
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

/*
    Speech To Text
*/

function speech_to_text_init() {
    window.parent.speech_recognizing = false;
    window.parent.speech_final_transcript = '';
    window.parent.speech_recognizing = false;
    window.parent.speech_ignore_onend;
    window.parent.speech_start_timestamp;
    if (!('webkitSpeechRecognition' in window.parent)) {
        console.log('Speech not working:');
    } else {
        window.parent.speech_recognition = new webkitSpeechRecognition();
        window.parent.speech_recognition.continuous = true;
        window.parent.speech_recognition.interimResults = true;

        window.parent.speech_recognition.onstart = function() {
            window.parent.speech_recognizing = true;
            console.log('Speech Starting:');
        };

        window.parent.speech_recognition.onerror = function(event) {
            if (event.error == 'no-speech') {
                console.log('Speech Error: No Speech');
                window.parent.speech_ignore_onend = true;
            }
            if (event.error == 'audio-capture') {
                console.log('Speech Error: Audio Capture');
              window.parent.speech_ignore_onend = true;
            }
            if (event.error == 'not-allowed') {
                if (event.timeStamp - window.parent.speech_start_timestamp < 100) {
                    console.log('Speech Error: Info Blocked');
                } else {
                    console.log('Speech Error: Info Denied');
                }
                window.parent.speech_ignore_onend = true;
            }
        };

        window.parent.speech_recognition.onend = function() {
            window.parent.speech_recognizing = false;
            if (window.parent.speech_ignore_onend) {
                console.log('Speech Error: Ignore End');
                return;
            }
            if (!window.parent.speech_final_transcript) {
                console.log('Speech End:');
                return;
            }
        };

        window.parent.speech_recognition.onresult = function(event) {
            var interim_transcript = '';
            /*
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    window.parent.speech_final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
                console.log('Speech Interim: ' + event.resultIndex + ' ' + event.results.length + ' ' + event.results[i][0].transcript);
            }
            console.log('Speech Result: ' + event.resultIndex + ' ' + event.results.length + ' ' + interim_transcript);
            */
            if (event.results.length > 0) {
                window.parent.speech_final_transcript = event.results[0][0].transcript;
            } else {
                window.parent.speech_final_transcript = '';
            }
            if (window.parent.speech_final_transcript || interim_transcript) {
                window.parent.speech_recognition.stop();
                $('#MIC_IMAGE').attr('src', 'icons/mic-mute.svg');
                document.getElementById('SEARCH_WORD').value = window.parent.speech_final_transcript;
                // console.log('Speech Final: ' + window.parent.speech_final_transcript);
                load_search_data();
            }
        };
    }
}

function speech_start(event) {
    if (!('webkitSpeechRecognition' in window.parent)) {
        return;
    }
    if (window.parent.speech_recognizing) {
        window.parent.speech_recognition.stop();
        return;
    }
    var lang = window.parent.render_language;
    var s_lang = MAP_ISO_DICT[lang];
    window.parent.speech_final_transcript = '';
    window.parent.speech_recognition.lang = s_lang;
    window.parent.speech_recognition.start();
    window.parent.speech_ignore_onend = false;
    window.parent.speech_start_timestamp = event.timeStamp;
    $('#MIC_IMAGE').attr('src', 'icons/mic.svg');
}

function load_keyboard(event) {
    var lang = window.parent.render_language;
    set_input_keyboard(lang.toLowerCase());
    $('#LANG_KBD').modal();
    return;
}

function handle_history_context(data) {
    var context = data['context'];
    if (context == 'introduction') {
        load_intro_data(data['region']);
    } else if (context == 'collections') {
        load_collection_data(data['type'], data['letter'], data['page'], data['max']);
    } else if (context == 'categories') {
        load_category_data(data['type']);
    } else if (context == 'alphabetical') {
        load_simple_data();
    } else if (context == 'trees') {
        load_module_data(data['module']);
    } else if (context == 'maps') {
        window.parent.area_latlong = data['latlong'];
        // console.log('HISTORY POP: ', window.parent.area_latlong);
        load_area_data(data['type'], data['id']);
    } else if (context == 'search') {
      load_search_history(data);
    }
}

function handle_popstate(e) {
    var data = e.state;
    if (data == null || data == undefined) {
        return;
    }
    // console.log('POP: ', e);
    window.parent.tree_popstate = true;
    handle_history_context(data);
}

function add_history(context, data) {
    var url = 'trees.html';
    if (!window.parent.tree_popstate) {
        data['context'] = context;
        var title = capitalize_word(context);
        if (context == 'introduction') {
            title += ' ' + capitalize_word(data['region']);
        } else if (context == 'collections') {
            title += ' ' + capitalize_word(data['type']) + ' ' + data['letter'];
        } else if (context == 'categories') {
            title += ' ' + capitalize_word(data['type']);
        } else if (context == 'alphabetical') {
            title += ' Alphabetical'
        } else if (context == 'trees') {
            title += ' ' + data['module'];
        } else if (context == 'maps') {
            data['latlong'] = get_area_centre();
            title += ' ' + capitalize_word(data['type']);
            // console.log('HISTORY PUSH: ', data['latlong']);
        }
        // console.log('PUSH: ', data, window.parent.tree_popstate);
        history.pushState(data, title, url);
    }
    window.parent.history_data = data;
    window.parent.tree_popstate = false;
}

function get_lang_map_word(lang, map_dict, n) {
   if (map_dict == undefined) {
       return n;
   }
   var t = map_dict[n];
   if (t == undefined) {
       return n;
   }
   t = t[lang];
   if (t == undefined) {
       return n;
   }
   return t;
}

function get_lang_map(lang, n_dict) {
    if (lang == 'English') {
        return;
    }
    var map_dict = window.parent.tree_lang_data['Keys'];
    n_dict['T'] = get_lang_map_word(lang, map_dict, n_dict['T']);
    var i_list = n_dict['items'];
    for (var i = 0; i < i_list.length; i++) {
        var i_dict = i_list[i];
        i_dict['N'] = get_lang_map_word(lang, map_dict, i_dict['N']);
    }
}

function load_menu_data() {
    var lang = window.parent.render_language;
    var map_dict = window.parent.tree_lang_data['Keys'];
    var LANG_LIST = [ 'English', 'Tamil', 'Kannada', 'Telugu', 'Malayalam', 'Hindi', 'Marathi', 'Gujarati', 'Bengali', 'Punjabi' ];
    var lang_list = [];
    for (var i = 0; i < LANG_LIST.length; i++) {
        var l = LANG_LIST[i];
        var t = get_lang_map_word(lang, map_dict, l);
        var t = REVERSE_LANG_DICT[l];
        var d = (l == lang) ? { 'N' : t, 'O' : 'selected' } : { 'N' : t };
        lang_list.push(d);
    }
    var map_list = { 'T' : 'Maps', 'items' : [ { 'N' : 'Parks', 'A' : 'parks', 'I' : '' }, { 'N' : 'Wards', 'A' : 'wards', 'I' : '' },
                                               { 'N' : 'Trees', 'A' : 'trees', 'I' : 0 }, { 'N' : 'Explore', 'A' : 'current', 'I' : '' }
                                             ]
                   };
    var collection_list = { 'T' : 'Collections',
                            'items' : [ { 'N' : 'Name', 'A' : 'alphabetical', 'L' : 'A' },
                                        { 'N' : 'Family', 'A' : 'family', 'L' : 'A' },
                                        { 'N' : 'Genus', 'A' : 'genus', 'L' : 'A' }
                                      ]
                          };
    var category_list = { 'T' : 'Categories',
                          'items' : [ { 'N' : 'Flower Color', 'A' : 'flowers' },
                                      { 'N' : 'Flower Season', 'A' : 'season' },
                                      { 'N' : 'Fruit Color', 'A' : 'fruits' },
                                      { 'N' : 'Leaf Type', 'A' : 'leaves' },
                                      { 'N' : 'Bark Color', 'A' : 'bark' }
                                    ]
                        };
    var region_list = { 'T' : 'Regions',
                          'items' : [ { 'N' : 'Bangalore', 'R' : 'bangalore' },
                                      { 'N' : 'India', 'R' : 'india' }
                                    ]
                        };
    // get_lang_map(lang, lang_list);
    get_lang_map(lang, map_list);
    get_lang_map(lang, collection_list);
    get_lang_map(lang, category_list);
    get_lang_map(lang, region_list);
    var menu_dict = { 'menus' : { 'TITLE' : get_lang_map_word(lang, map_dict, 'Trees'),
                                  'SEARCH' : get_lang_map_word(lang, map_dict, 'Search'),
                                  'ALPHABETICAL' : get_lang_map_word(lang, map_dict, 'Alphabetical'),
                                  'languages' : lang_list,
                                  'maps' : map_list,
                                  'collections' : collection_list,
                                  'categories' : category_list,
                                  'regions' : region_list
                                }
                    };
    render_template_data('#menu-template', '#MENU_DATA', menu_dict);

    // $('#SEARCH_INFO').tooltip();
    $('#MIC_IMAGE').tooltip();
    $('#KBD_IMAGE').tooltip();

    speech_to_text_init();

    if (window.parent.history_data == undefined) {
        if (Object.keys(window.parent.tree_lang_data).length != 0) {
            load_intro_data(window.parent.tree_region);
        }
    } else  {
        handle_history_context(window.parent.history_data);
    }
}

function load_content() {
    var url = 'language.json';
    $.getJSON(url, function(lang_obj) {
        window.parent.tree_lang_data = lang_obj;
        transliterator_init();
        var tree_id = window.parent.url_params['tid'];
        if (tree_id == undefined) {
            load_intro_data(window.parent.tree_region);
        } else {
            load_module_data_with_id(tree_id);
        }
    });
    search_init();
}

function tree_main_init() {
    window.parent.info_initialized = true;
    window.parent.render_language = 'English';
    window.parent.history_data = undefined;
    window.parent.tree_lang_data = {};
    window.parent.tree_region = 'bangalore';
    window.parent.search_initialized = false;
    window.parent.area_marker_list = [];
    window.parent.area_popup_list = [];
    window.parent.area_tooltip_list = [];
    window.parent.area_latlong = [];
    window.parent.map_initialized = false;
    window.parent.tree_popstate = false;
    window.parent.url_params = get_url_params();

    $('.nav li').bind('click', function() {
       $(this).addClass('active').siblings().removeClass('active');
    });

    window.addEventListener('popstate', handle_popstate);
    window.onload = load_content;

    load_menu_data();
}


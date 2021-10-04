const BANGALORE_LAT  = 12.97729;
const BANGALORE_LONG = 77.59973;
const BANGALORE_LAT_LONG = [ BANGALORE_LAT, BANGALORE_LONG ];
const BANGALORE_BBOX = '77.299805,12.762250,77.879333,13.170423';

const [ H_NAME, H_FAMILY, H_GENUS, H_SPECIES, H_AUTH, H_BLOOM, H_PART, H_GROW, H_LEAF ] = [...Array(9).keys()];


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

function lang_name_init() {
    var lang = window.render_language;
    if (lang == 'English') return;
    var tree_lang_data = window.tree_lang_data;
    var english_name = tree_lang_data['English']['Name'];
    var lang_name = tree_lang_data[lang]['Name'];
    for (var i = 0; i < english_name.length; i++) {
        if (lang_name[i] == '') {
            lang_name[i] = english_name[i];
        }
    }
}

function set_language(obj) {
    window.GOT_LANGUAGE = obj.value;
    window.render_language = MAP_LANG_DICT[obj.value];
    lang_name_init();
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

function get_tree_handle(tree_id) {
    var lang_obj = window.tree_lang_data;
    var lang = window.render_language;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];
    var handle_map = lang_obj['Handle'];
    var name = key_name[tree_id];
    return [ name, handle_map ];
}

function get_handle_prefix(tree_handle) {
    return `${tree_handle[H_GENUS]} - ${tree_handle[H_NAME]}/${tree_handle[H_NAME]}`;
}

function get_module_url(tree_id) {
    const [ name, handle_map ] = get_tree_handle(tree_id);
    const tree_handle = handle_map[tree_id];
    return get_handle_prefix(tree_handle);
}

function get_handle_image_url(tree_handle, part_name) {
    var prefix = get_handle_prefix(tree_handle);
    return `${prefix} - ${part_name}.jpg`;
}

function get_handle_thumbnail_url(tree_handle, part_name) {
    var prefix = `${tree_handle[H_GENUS]} - ${tree_handle[H_NAME]}/Thumbnails/${tree_handle[H_NAME]}`;
    return `${prefix} - ${part_name}.thumbnail`;
}

function get_handle_thumbnail_image_id_url(tree_handle, english_key_image, image_id) {
    return (image_id == '') ? 'empty.thumbnail' : get_handle_thumbnail_url(tree_handle, english_key_image[image_id]);
}

function get_part_name(tree_handle) {
    var lang_obj = window.tree_lang_data;
    var english_lang_map = lang_obj['English'];
    var english_key_image = english_lang_map['Image'];
    var image_id = tree_handle[H_PART];
    return english_key_image[image_id];
}

function get_image_url(tree_handle, level) {
    const base = 'Flora';
    const part_name = get_part_name(tree_handle);
    const image_url = get_handle_image_url(tree_handle, part_name);
    const thumbnail_url = get_handle_thumbnail_url(tree_handle, part_name);
    const i_url = (level == 'popup') ? `Flora/${image_url}` : `Flora/${thumbnail_url}`;
    const m_url = get_handle_prefix(tree_handle);
    return [ m_url, i_url ];
}

function get_module_name(handle_map, tree_id) {
    if (tree_id == 0) return '';

    if (handle_map == null) {
        const [ p_name, p_handle_map ] = get_tree_handle(tree_id);
        handle_map = p_handle_map; 
    }
    const tree_handle = handle_map[tree_id];
    return tree_handle[H_NAME];
}

function tree_module_init(file_name, data) {
    if (window.info_initialized == undefined) {
        window.tree_card_data = data;
        var url = '../../language.json';
        $.getJSON(url, function(lang_obj) {
            window.tree_lang_data = lang_obj;
            window.render_language = 'English';
            lang_name_init();
            window.info_initialized = true;
            tree_module_init('', window.tree_card_data);
        });
        return;
    }

    window.tree_card_data = data;
    window.tree_map_data = data['mapinfo'];
    window.tree_box_data = data['mapregion'];

    var lang_obj = window.tree_lang_data;
    var lang = window.render_language;
    var lang_map = lang_obj[lang];
    var handle_map = lang_obj['Handle'];
    var english_lang_map = lang_obj['English'];
    var english_key_info = english_lang_map['Key Name'];
    var key_group = lang_map['Key Group'];
    var key_part = lang_map['Key Part'];
    var key_image = lang_map['Image'];
    var english_key_image = english_lang_map['Image'];
    var key_name = lang_map['Name'];
    if (key_name === undefined) {
        key_name = english_lang_map['Name']; 
    }
    var card_data = window.tree_card_data;
    var gallery_info = card_data['galleryinfo']
    var tree_id = gallery_info['HID'];

    const tree_handle = handle_map[tree_id];
    gallery_info['HH'] = key_group[gallery_info['HH']];
    gallery_info['HN'] = key_name[gallery_info['HN']];
    var gallery_list = gallery_info['gallery'].split(',');
    var new_gallery_list = [];
    for (var i = 0; i < gallery_list.length; i++) {
        var image_id = gallery_list[i];
        var part_name = (image_id.length == 4) ? image_id : english_key_image[image_id];
        const caption = (image_id.length == 4) ? image_id : key_image[image_id];
        const image = get_handle_image_url(tree_handle, part_name);
        var new_item = { 'IC': caption, 'IN': image };
        new_gallery_list.push(new_item);
    }
    gallery_info['gallery'] = new_gallery_list;
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

function tree_grid_init(type, data) {
    var lang_obj = window.tree_lang_data;
    var lang = window.render_language;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];
    var english_lang_map = lang_obj['English'];
    var english_key_info = english_lang_map['Key Name'];
    var english_key_image = english_lang_map['Image'];
    var handle_map = lang_obj['Handle'];
    var card_list = data['cardinfo'];
    const MAX_COL = 6;
    for (var i = 0; i < card_list.length; i++) {
        set_key_value_map(card_list[i], english_key_info, lang_map, 'N');
        var card = card_list[i];
        var new_row_list = [];
        var new_col_list = [];
        var row_list = card['ROW'];
        for (var j = 0; j < row_list.length; j++) {
            const [ tree_id, image_id ] = row_list[j].split(',');
            const tree_handle = handle_map[tree_id];
            const href = get_handle_prefix(tree_handle);
            const new_caption = get_handle_thumbnail_image_id_url(tree_handle, english_key_image, image_id);
            new_item = { CN: key_name[tree_id], CH: href, CT: new_caption };
            new_col_list.push(new_item);
            if (new_col_list.length >= MAX_COL) {
                new_row_list.push({ COL: new_col_list });
                new_col_list = [];
            }
        }
        if (new_col_list.length > 0) {
            new_row_list.push({ COL: new_col_list });
        }
        card['ROW'] = new_row_list;
    }
    render_template_data('#grid-card-info-template', '#CARDINFO', data);
}

function tree_simple_init(data) {
    render_template_data('#simple-card-info-template', '#CARDINFO', data);
}

function get_region_url(type) {
    var region = window.tree_region;
    return `Flora/trees_${region}_${type}.json`;
}

function tree_intro_init(slider_data) {
    var lang = window.render_language;

    var stats_list = slider_data['statsinfo'];
    var i_list = stats_list['items'];
    for (var i = 0; i < i_list.length; i++) {
        var i_dict = i_list[i];
        if (i_dict['N'] == 'Updated') {
            i_dict['C'] = i_dict['C'].split(' ')[0];
        }
    }
    get_lang_map(lang, stats_list);

    var lang_obj = window.tree_lang_data;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];
    var handle_map = lang_obj['Handle'];
    var slider_info = slider_data['sliderinfo'];
    var slider_list = slider_info['items'];
    var new_slider_list = [];
    for (var i = 0; i < slider_list.length; i++) {
        const [ tree_id, count ] = slider_list[i];
        const tree_handle = handle_map[tree_id];
        const href = get_handle_prefix(tree_handle);
        const part_name = get_part_name(tree_handle);
        const item = { SB: `${tree_handle[H_GENUS]} ${tree_handle[H_SPECIES]}`, SA: tree_handle[H_AUTH], SH: href,
                       SN: key_name[tree_id], SI: get_handle_image_url(tree_handle, part_name)
                     }
        new_slider_list.push(item);
    }
    slider_info['items'] = new_slider_list;
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
    window.tree_region = region;
    var lang = window.render_language;
    var lang_obj = window.tree_lang_data;
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
    var url = get_region_url('intro');
    $.getJSON(url, function(slider_data) {
        tree_intro_init(slider_data);
        add_history('introduction', { 'region' : region });
    });
}

function search_init() {
    window.flora_fauna_search_engine = new MiniSearch({
        fields: [ 'aka' ], // fields to index for full-text search
        storeFields: ['name', 'genus', 'species', 'href', 'category', 'pop'] // fields to return with search results
    });
    window.search_initialized = false;
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

function tree_collection_init(type, letter, page_index, max_page, full_data) {
    var lang_obj = window.tree_lang_data;
    var lang = window.render_language;
    var lang_map = lang_obj[lang];
    var english_lang_map = lang_obj['English'];
    var english_key_image = english_lang_map['Image'];
    var handle_map = lang_obj['Handle'];
    var key_name = lang_map['Name'];
    var data = full_data[type];
    var image_data = full_data['Images'];
    var letter_data = data['LETTER'];
    var new_row_list = [];
    const row_list = letter_data[letter];
    const col_name = 'COL' + type[0].toUpperCase();
    for (var i = 0; i < row_list.length; i++) {
        const tree_id = row_list[i];
        const tree_handle = handle_map[tree_id];
        var new_image_list = [];
        var image_list = image_data[tree_id].split(',');
        for (var k = 0; k < image_list.length; k++) {
            var image_id = image_list[k];
            const href = get_handle_prefix(tree_handle);
            const caption = get_handle_thumbnail_image_id_url(tree_handle, english_key_image, image_id);
            var new_item = { CI: caption, CH: href };
            new_image_list.push(new_item);
        }
        var new_item = { COLIMAGE: new_image_list };
        const href = get_handle_prefix(tree_handle);
        new_item[col_name] = { CC: (i + 1), CN: key_name[tree_id], CF: tree_handle[H_FAMILY],
                               CB: `${tree_handle[H_GENUS]} ${tree_handle[H_SPECIES]}`, CA: tree_handle[H_AUTH], CH: href
                             }
        new_row_list.push(new_item);
    }
    const [ group, max_pages, links ] = data['PAGES'];
    const link_list = links.split(',')
    var new_link_list = [];
    for (var i = 0; i < link_list.length; i++) {
        const page = link_list[i];
        const page_id = i + 1;
        const item = { PL: page, PC: (i + 1), PH: `load_collection_data('${group}', '${page}', ${page_id}, ${max_pages})` };
        new_link_list.push(item);
    }
    var page_data = { N: 'Page', links: new_link_list };
    var new_data = { cardinfo: { N: letter, ROW: new_row_list }, pageinfo: page_data };

    new_data['pageinfo']['N'] = 'top';
    render_template_data('#pagination-template', '#TOPPAGE', new_data);
    new_data['pageinfo']['N'] = 'bottom';
    render_template_data('#pagination-template', '#BOTTOMPAGE', new_data);
    render_template_data('#collection-card-info-template', '#CARDINFO', new_data);

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
    if (window.search_initialized) {
        return;
    }
    var url = 'flora_index.json';
    var search_engine = window.flora_fauna_search_engine;
    $.getJSON(url, function(search_obj) {
        var data_id = 0;
        for (var category in search_obj) {
            var data_list = search_obj[category];
            for (var i = 0; i < data_list.length; i++) {
                const item = data_list[i];
                var data_doc = { "id" : data_id, "category" : item.T, "name" : item.N, 'aka' : item.A, "href" : item.H, "pop" : item.P };
                search_engine.add(data_doc);
                data_id += 1;
            }
        }
    });
    window.search_initialized = true;
}

function transliterator_init() {
    var lang_obj = window.tree_lang_data;
    var char_map = lang_obj['Charmap'];
    var key_list = [];
    var max_len = 0;
    for (var s in char_map) {
        key_list.push(s); 
        max_len = Math.max(max_len, s.length);
    }
    window.char_map_max_length = max_len;
    window.char_map_key_list = new Set(key_list);
}

function transliterate_text(word) {
    var lang_obj = window.tree_lang_data;
    var char_map = lang_obj['Charmap'];

    var tokenset = window.char_map_key_list;
    var maxlen = window.char_map_max_length;
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
    var new_word = tokenlist.join('');
    if (word != new_word) {
        new_word = new_word.replace(/_/g, '');
        new_word = new_word.replace(/G/g, 'n');
        new_word = new_word.replace(/J/g, 'n');
    }
    return new_word;
}

function get_search_href(category, arg_list) {
    var func = (category == 'Trees') ? 'load_module_data' : 'load_area_data';
    var args = arg_list.join("', '");
    var href = `${func}('${args}')`;
    return href
}

function get_search_results(search_word, search_options, item_list, id_list) {
    var lang_obj = window.tree_lang_data;
    var lang = window.render_language;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];
    var map_dict = lang_obj['Keys'];
    var handle_map = lang_obj['Handle'];
    var park_map = lang_obj['Parks'];
    var ward_map = lang_obj['Wards'];
    var search_engine = window.flora_fauna_search_engine;
    var results = search_engine.search(search_word, search_options);
    if (results.length > 0) {
        var max_score = results[0].score;
        for (var i = 0; i < results.length; i++) {
            var item = results[i];
            if (id_list.has(item.id)) continue;
            var name_id = item.name;
            var name = '';
            var href = '';
            if (item.category == 'Trees') {
                const tree_handle = handle_map[name_id];
                href = [ get_handle_prefix(tree_handle) ];
            } else if (item.category == 'Maps') {
                const tree_handle = handle_map[name_id];
                href = [ 'trees', name_id, get_handle_prefix(tree_handle) ];
            } else if (item.category == 'Parks') {
                name = park_map[name_id];
                href = [ 'parks', name_id, name ];
            } else if (item.category == 'Wards') {
                name = ward_map[name_id];
                href = [ 'wards', name_id, name ];
            }
            var category = get_lang_map_word(lang, map_dict, item.category);
            var href = get_search_href(item.category, href);
            var r_item = { 'T' : category, 'N' : name, 'H' : href, 'P' : item.pop };
            if (item.category == 'Trees' || item.category == 'Maps') {
                const tree_handle = handle_map[name_id];
                r_item['G'] = tree_handle[H_GENUS];
                r_item['S'] = tree_handle[H_SPECIES];
            }
            if (name_id != '') {
                r_item['I'] = name_id;
            }
            item_list.push(r_item);
            id_list.add(item.id);
        }
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

    init_context_menu();

    return osm_map;
}

const MAP_ICON_SIZE = [24, 24];
function create_icons() {
    window.green_tree_icon = new L.icon({
        iconUrl: 'icons/marker_tree_green.png',
        iconSize: MAP_ICON_SIZE
    });
    window.green_bloom_icon = new L.icon({
        iconUrl: 'icons/marker_bloom_green.png',
        iconSize: MAP_ICON_SIZE
    });
    window.red_tree_icon = new L.icon({
        iconUrl: 'icons/marker_tree_red.png',
        iconSize: MAP_ICON_SIZE
    });
    window.red_bloom_icon = new L.icon({
        iconUrl: 'icons/marker_bloom_red.png',
        iconSize: MAP_ICON_SIZE
    });
}

function get_url_info(tree_id, level) {
    const [ name, handle_map ] = get_tree_handle(tree_id);
    const tree_handle = handle_map[tree_id];
    const [ url, image_url ] = get_image_url(tree_handle, level);
    var m_url = `javascript:load_module_data('${url}');`;
    var a_url = `javascript:load_area_data('trees', '${tree_id}');`;
    var image_style = (level == 'popup') ? 'style="width: 240px; height: 180px;"' : '';
    var img_html = `<a href="${m_url}" align="center"><div class="thumbnail" align="center"><img ${image_style} src="${image_url}" class="shadow-box"></a>`;
    var name_html = `<a href="${a_url}"><p align="center"> ${name} </p></div></a>`;
    var html = img_html + name_html;
    return html;
}

function get_needed_icon(selected, blooming) {
    if (selected) {
        return (blooming) ? window.red_bloom_icon : window.red_tree_icon;
    } else if (blooming) return window.green_bloom_icon;
    return window.green_tree_icon;
}

function set_chosen_image(tree_id) {
    var tooltip_html = get_url_info(tree_id, 'tooltip');
    $('#IMAGEINFO').html(tooltip_html);
}

function init_context_menu() {
    $.contextMenu({
      selector: 'img.leaflet-marker-icon',
      callback: function(key, options) {
          var marker = window.TREE_CONTEXT_MARKER;
          var tree_id = marker.tree_id;
          var pos = marker.getLatLng();
          if (key == 'info') {
              const m_url = get_module_url(tree_id);
              load_module_data(m_url);
          } else if (key == 'tmap') {
              load_area_data('trees', tree_id);
          } else if (key == 'gmap') {
              var url = `http://maps.google.com/maps?z=12&t=m&q=loc:${pos.lat}+${pos.lng}`;
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
    if (window.map_tree_id != 0) {
        set_chosen_image(window.map_tree_id);
    }
}

function marker_on_click(e) {
    var tree_id = e.target.tree_id;
    window.map_tree_id = tree_id;
    var area_marker_list = window.area_marker_list;
    for (var i = 0; i < area_marker_list.length; i++) {
        var marker = area_marker_list[i];
        var icon = get_needed_icon((marker.tree_id == tree_id), marker.blooming);
        marker.setIcon(icon);
    }
    find_area_carousel_tree(tree_id);
}

function load_module_data_with_id(tree_id) {
    window.map_tree_id = tree_id;
    const m_url = get_module_url(tree_id);
    load_module_data(m_url);
}

function marker_on_doubleclick(e) {
    var tree_id = e.target.tree_id;
    load_module_data_with_id(tree_id);
}

function marker_on_contextmenu(e) {
    window.TREE_CONTEXT_MARKER = this;
}

function draw_map_on_move(ev) {
    var osm_map = window.map_osm_map;
    var a_name = window.map_area_name;
    var aid = window.map_area_id;
    var tid = window.map_tree_id;
    var latlong = osm_map.getCenter();
    window.map_area_move = true;
    show_area_latlong_in_osm(a_name, aid, tid, latlong.lat, latlong.lng);
    window.map_area_move = false;
}

function get_area_centre() {
    if (window.map_osm_map == undefined) {
        return [];
    }
    var latlong = window.map_osm_map.getCenter();
    var area_latlong = [ latlong.lat, latlong.lng ];
    return area_latlong;
}

function handle_geocoder_mark(ev) {
    draw_map_on_move(ev);
    add_history('maps', { 'type' : window.area_type, 'id' : window.parent.map_area_id });
}

function show_area_latlong_in_osm(a_name, aid, tid, c_lat, c_long) {
    var lang = window.render_language;
    var map_dict = window.tree_lang_data['Keys'];
    var area = window.area_type;
    var old_a_name = window.map_area_name;
    window.map_area_name = a_name;
    window.map_area_id = aid;
    if (tid == 0 && window.map_tree_id != undefined) {
        tid = window.map_tree_id;
    }
    window.map_tree_id = tid;

    if (area == 'trees') {
        var n_name = get_module_name(null, tid);
    } else {
        var n_name = get_lang_map_word(lang, map_dict, capitalize_word(a_name));
        if (aid != '') {
            n_name = aid + '. ' + n_name;
        }
    }
    $('#TITLE_HEADER').html(n_name);

    if (window.map_initialized) {
        var osm_map = window.map_osm_map;
        var area_marker_list = window.area_marker_list;
        for (var i = 0; i < area_marker_list.length; i++) {
            osm_map.removeLayer(area_marker_list[i]);
        }
        osm_map.setView([c_lat, c_long]);
    } else {
        var id_name = 'MAPINFO';
        var osm_map = create_osm_map('area', id_name, c_lat, c_long);
        window.map_osm_map = osm_map;
        window.map_area_move = false;
        window.map_initialized = true;
    }
    if (tid != undefined && tid != 0) {
        set_chosen_image(tid);
    }
    if (area == 'trees') {
        osm_map.options.minZoom = 12;
    }
    draw_area_latlong_in_osm(n_name, a_name, aid, tid, c_lat, c_long);
    window.area_latlong = [];
}

function load_area_latlong_in_osm(a_name, aid, tid, c_lat, c_long) {
    window.area_latlong = [];
    show_area_latlong_in_osm(a_name, aid, tid, c_lat, c_long);
    add_history('maps', { 'type' : window.area_type, 'id' : aid });
}

function find_area_carousel_tree(tree_id) {
    var tree_image_list = window.tree_image_list;
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
    window.map_tree_id = tree_id;
    var area_marker_list = window.area_marker_list;
    for (var i = 0; i < area_marker_list.length; i++) {
        var marker = area_marker_list[i];
        var icon = get_needed_icon((marker.tree_id == tree_id), marker.blooming);
        marker.setIcon(icon);
    }
    set_chosen_image(tree_id);
}

function area_highlight_tree(tree_id) {
    var tree_image_list = window.tree_image_list;
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
    window.tree_image_list = tree_image_list;
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

    var tree_id = window.map_tree_id;
    var start_id = find_area_carousel_tree(tree_id);
    area_highlight_tree(start_id);
}

function draw_area_latlong_in_osm(n_name, a_name, aid, tid, c_lat, c_long) {
    var osm_map = window.map_osm_map;
    var area = window.area_type;
    var lang_obj = window.tree_lang_data;
    var lang = window.render_language;
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
    var grid_flora = window.GRID_FLORA;
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
            const tree_handle = handle_map[tree_id];
            var blooming = tree_handle[H_BLOOM];
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

    window.area_marker_list = area_marker_list;

    if (area == 'trees' && !window.map_area_move && area_marker_list.length > 0) {
        var layer = new L.featureGroup(area_marker_list);
        osm_map.fitBounds(layer.getBounds());
    }

    if (area == 'current') {
        var latlong = area_marker_list[area_marker_list.length - 1].getLatLng();
        var point_list = [ L.latLng(c_lat, c_long), L.latLng(latlong.lat, latlong.lng) ];
        if (window.map_area_routing != undefined) {
            var routing = window.map_area_routing;
            osm_map.removeControl(routing);
        }
        var routing = new L.Routing.control({ geocoder: get_geocoder_nominatim() });
        routing.addTo(osm_map);
        routing.setWaypoints(point_list);
        window.map_area_routing = routing;
    }

    var tree_stat_list = [];
    var tree_image_list = [];
    for (var tid in tree_dict) {
        if (!tree_dict.hasOwnProperty(tid)) {
            continue;
        }
        var t_name = key_name[tid];
        const tree_handle = handle_map[tid];
        var blooming = tree_handle[H_BLOOM];
        var icon = (blooming) ? 'icons/marker_bloom_green.png' : 'icons/marker_tree_green.png';
        tree_stat_list.push({ 'TN' : t_name, 'TC' : tree_dict[tid], 'TI' : icon, 'AID' : aid, 'TID' : tid, 'ALAT' : c_lat, 'ALONG' : c_long })

        if (area != 'trees') {
            const [ m_url, image_url ] = get_image_url(tree_handle, 'thumbnail');
            tree_image_list.push({ 'SN' : t_name, 'SI' : image_url, 'SH' : m_url, 'TID' : tid, 'SC' : tree_dict[tid] })
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
    if (window.green_tree_icon == undefined) {
        create_icons();
    }

    if (area == undefined) {
        var area = window.area_type;
        var aid = window.area_id;
    }
    window.area_type = area;
    window.area_id = aid;
    window.area_data = item_data;

    if (window.info_initialized == undefined) {
        window.tree_card_data = data;
        var url = 'language.json';
        $.getJSON(url, function(lang_obj) {
            window.tree_lang_data = lang_obj;
            window.render_language = 'English';
            window.info_initialized = true;
            lang_name_init();
            create_icons();
            tree_area_init(undefined, undefined, window.area_data);
        });
        return;
    }

    var lang_obj = window.tree_lang_data;
    var lang = window.render_language;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];
    var handle_map = lang_obj['Handle'];

    var lat_long = BANGALORE_LAT_LONG;
    if (window.area_latlong == undefined) {
        window.area_latlong = [];
    }
    if (window.area_latlong.length > 0) {
        lat_long = window.area_latlong;
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
        window.GRID_FLORA = grid_obj['grid flora'];
        window.GRID_MESH = grid_obj['grid mesh'];
        window.GRID_CENTRE = grid_obj['grid centre'];
        window.map_initialized = false;

        var tid = 0;
        if (window.map_tree_id != undefined) {
            tid = window.map_tree_id;
        }
        if (area == 'trees') {
            var m_name = get_module_name(handle_map, aid);
            if (aid != 0) {
                tid = aid;
                name = m_name;
            } else if (tid != 0) {
                aid = tid;
                name = m_name;
            } else if (aid == 0 || aid == '0') {
                var tree_list = Object.keys(handle_map);
                aid = tree_list[Math.floor(Math.random() * tree_list.length)];
                name = m_name;
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
    var lang = window.render_language;
    var map_dict = window.tree_lang_data['Keys'];
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
    var collection_data = {};
    render_template_data('#page-template', '#SECTION', collection_data);
    var url = get_region_url('page');
    $.getJSON(url, function(item_data) {
        tree_collection_init(type, letter, page_index, page_max, item_data);
        add_history('collections', { 'type' : type, 'letter' : letter, 'page' : page_index, 'max' : page_max });
    });
}

function load_category_data(type) {
    var grid_data = {};
    render_template_data('#grid-template', '#SECTION', grid_data);
    var url = get_region_url('grid');
    $.getJSON(url, function(item_data) {
        tree_grid_init(type, item_data[type]);
        add_history('categories', { 'type' : type });
    });
}

function load_simple_data() {
    var simple_data = {};
    render_template_data('#simple-template', '#SECTION', simple_data);
    var url = get_region_url('simple');
    $.getJSON(url, function(item_data) {
        tree_simple_init(item_data);
        add_history('alphabetical', { 'region' : window.tree_region });
    });
}

function load_module_data(file_name) {
    var module_data = {};
    render_template_data('#module-template', '#SECTION', module_data);
    var url = `Flora/${file_name}.json`;
    $.getJSON(url, function(item_data) {
        tree_module_init(file_name, item_data);
        add_history('trees', { 'module' : file_name });
    });
}

function transliterator_word() {
    var source = $('#SOURCE').val();
    source = source.replace(/\n/g, "<br />");
    var target = transliterate_text(source);
    $('#TARGET').html(target);
}

/*
    Speech To Text
*/

function speech_to_text_init() {
    window.speech_recognizing = false;
    window.speech_final_transcript = '';
    window.speech_recognizing = false;
    window.speech_ignore_onend;
    window.speech_start_timestamp;
    if (!('webkitSpeechRecognition' in window)) {
        console.log('Speech not working:');
    } else {
        window.speech_recognition = new webkitSpeechRecognition();
        window.speech_recognition.continuous = true;
        window.speech_recognition.interimResults = true;

        window.speech_recognition.onstart = function() {
            window.speech_recognizing = true;
            console.log('Speech Starting:');
        };

        window.speech_recognition.onerror = function(event) {
            if (event.error == 'no-speech') {
                console.log('Speech Error: No Speech');
                window.speech_ignore_onend = true;
            }
            if (event.error == 'audio-capture') {
                console.log('Speech Error: Audio Capture');
              window.speech_ignore_onend = true;
            }
            if (event.error == 'not-allowed') {
                if (event.timeStamp - window.speech_start_timestamp < 100) {
                    console.log('Speech Error: Info Blocked');
                } else {
                    console.log('Speech Error: Info Denied');
                }
                window.speech_ignore_onend = true;
            }
        };

        window.speech_recognition.onend = function() {
            window.speech_recognizing = false;
            if (window.speech_ignore_onend) {
                console.log('Speech Error: Ignore End');
                return;
            }
            if (!window.speech_final_transcript) {
                console.log('Speech End:');
                return;
            }
        };

        window.speech_recognition.onresult = function(event) {
            var interim_transcript = '';
            /*
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    window.speech_final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
                console.log('Speech Interim: ' + event.resultIndex + ' ' + event.results.length + ' ' + event.results[i][0].transcript);
            }
            console.log('Speech Result: ' + event.resultIndex + ' ' + event.results.length + ' ' + interim_transcript);
            */
            if (event.results.length > 0) {
                window.speech_final_transcript = event.results[0][0].transcript;
            } else {
                window.speech_final_transcript = '';
            }
            if (window.speech_final_transcript || interim_transcript) {
                window.speech_recognition.stop();
                $('#MIC_IMAGE').attr('src', 'icons/mic-mute.svg');
                document.getElementById('SEARCH_WORD').value = window.speech_final_transcript;
                // console.log('Speech Final: ' + window.speech_final_transcript);
                load_search_data();
            }
        };
    }
}

function speech_start(event) {
    if (!('webkitSpeechRecognition' in window)) {
        return;
    }
    if (window.speech_recognizing) {
        window.speech_recognition.stop();
        return;
    }
    var lang = window.render_language;
    var s_lang = MAP_ISO_DICT[lang];
    window.speech_final_transcript = '';
    window.speech_recognition.lang = s_lang;
    window.speech_recognition.start();
    window.speech_ignore_onend = false;
    window.speech_start_timestamp = event.timeStamp;
    $('#MIC_IMAGE').attr('src', 'icons/mic.svg');
}

function load_keyboard(event) {
    var lang = window.render_language;
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
        window.area_latlong = data['latlong'];
        // console.log('HISTORY POP: ', window.area_latlong);
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
    window.tree_popstate = true;
    handle_history_context(data);
}

function add_history(context, data) {
    var url = 'trees.html';
    if (!window.tree_popstate) {
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
        // console.log('PUSH: ', data, window.tree_popstate);
        history.pushState(data, title, url);
    }
    window.history_data = data;
    window.tree_popstate = false;
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
    var map_dict = window.tree_lang_data['Keys'];
    n_dict['T'] = get_lang_map_word(lang, map_dict, n_dict['T']);
    var i_list = n_dict['items'];
    for (var i = 0; i < i_list.length; i++) {
        var i_dict = i_list[i];
        i_dict['N'] = get_lang_map_word(lang, map_dict, i_dict['N']);
    }
}

function load_menu_data() {
    var lang = window.render_language;
    var map_dict = window.tree_lang_data['Keys'];
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
                            'items' : [ { 'N' : 'Name',   'A' : 'alphabetical', 'L' : 'A' },
                                        { 'N' : 'Family', 'A' : 'family',       'L' : 'A' },
                                        { 'N' : 'Genus',  'A' : 'genus',        'L' : 'A' }
                                      ]
                          };
    var category_list = { 'T' : 'Categories',
                          'items' : [ { 'N' : 'Flower Color',  'C' : 'Flower Color',  'A' : 'flowers' },
                                      { 'N' : 'Flower Season', 'C' : 'Flower Season', 'A' : 'season' },
                                      { 'N' : 'Fruit Color',   'C' : 'Fruit Color',   'A' : 'fruits' },
                                      { 'N' : 'Leaf Type',     'C' : 'Leaf Type',     'A' : 'leaves' },
                                      { 'N' : 'Bark Color',    'C' : 'Bark Color',    'A' : 'bark' }
                                    ]
                        };
    var region_list = { 'T' : 'Regions',
                          'items' : [ { 'N' : 'Bangalore', 'R' : 'bangalore' },
                                      { 'N' : 'India',     'R' : 'india' }
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

    if (window.history_data == undefined) {
        if (Object.keys(window.tree_lang_data).length != 0) {
            load_intro_data(window.tree_region);
        }
    } else  {
        handle_history_context(window.history_data);
    }
}

function load_content() {
    var url = 'language.json';
    $.getJSON(url, function(lang_obj) {
        window.tree_lang_data = lang_obj;
        lang_name_init();
        transliterator_init();
        var tree_id = window.url_params['tid'];
        if (tree_id == undefined) {
            load_intro_data(window.tree_region);
        } else {
            load_module_data_with_id(tree_id);
        }
    });
    search_init();
}

function tree_main_init() {
    window.info_initialized = true;
    window.render_language = 'English';
    window.history_data = undefined;
    window.tree_lang_data = {};
    window.tree_region = 'bangalore';
    window.search_initialized = false;
    window.area_marker_list = [];
    window.area_popup_list = [];
    window.area_tooltip_list = [];
    window.area_latlong = [];
    window.map_initialized = false;
    window.tree_popstate = false;
    window.url_params = get_url_params();

    $('.nav li').bind('click', function() {
       $(this).addClass('active').siblings().removeClass('active');
    });

    window.addEventListener('popstate', handle_popstate);
    window.onload = load_content;

    init_input_keyboard();
    load_menu_data();
}


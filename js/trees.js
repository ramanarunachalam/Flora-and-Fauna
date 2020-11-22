const BANGALORE_LAT  = 12.97729;
const BANGALORE_LONG = 77.59973;

function is_array(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

function set_language(obj) {
    window.parent.LANG_OPT = obj.value;
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
    window.CARD_DATA = data;
    window.MAP_DATA = data['mapinfo'];
    window.BOX_DATA = data['mapregion'];

    var lang_obj = window.parent.LANG_DATA;
    var lang = window.parent.LANG_OPT;
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
    var card_data = window.CARD_DATA;
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
    var lang_obj = window.parent.LANG_DATA;
    var lang = window.parent.LANG_OPT;
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
    window.parent.LANG_OPT = 'English';
    window.parent.search_initialized = false;
    window.parent.area_marker_list = [];

    window.onload = tree_info_init;

    render_template_data('#carousel-template', '#SLIDERINFO', data);
    create_icons();
    search_init();
}

function tree_info_init() {
    var url = '../language.json';
    $.getJSON(url, function(lang_obj) {
        window.parent.LANG_DATA = lang_obj;
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

    var lang_obj = window.parent.LANG_DATA;
    var lang = window.parent.LANG_OPT;
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

function get_search_results(search_word, search_options, item_list, id_list) {
    var search_engine = window.parent.flora_fauna_search_engine;
    var results = search_engine.search(search_word, search_options);
    if (results.length > 0) {
        var max_score = results[0].score;
        results.forEach(function (result_item, result_index) {
            if (!id_list.has(result_item.id)) {
                var item = { 'T' : result_item.category, 'H' : result_item.href, 'N' : result_item.name, 'G' : result_item.genus, 'S' : result_item.species, 'P' : result_item.pop };
                item_list.push(item);
                id_list.add(result_item.id);
            }
        });
    }
}

function tree_search_init() {
    var params = new UrlParameters(window.location.search);
    var search_word = params.getValue('word');
    search_word = search_word.replace(/\+/g, ' ');
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
}

function geo_distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344
        return dist;
    }
}

function create_osm_map(module, id_name, c_lat, c_long) {
    var map = L.map(id_name, { center: [c_lat, c_long], zoom: 18, minZoom: 12, maxZoom: 21 });

    L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: ['a', 'b', 'c'],
      maxNativeZoom: 18,
      maxZoom: 21 
    }).addTo(map);

    var geocoder = L.Control.geocoder();
    geocoder.addTo(map);
    if (module == 'area') {
        geocoder.on('markgeocode', handle_geocoder_mark);
    }
    return map;
}

function create_icons() {
    window.parent.green_tree_icon = L.icon({
        iconUrl: 'icons/marker_tree_green.png',
        iconSize: [24, 24],
    });
    window.parent.green_bloom_icon = L.icon({
        iconUrl: 'icons/marker_bloom_green.png',
        iconSize: [24, 24],
    });
    window.parent.red_tree_icon = L.icon({
        iconUrl: 'icons/marker_tree_red.png',
        iconSize: [24, 24],
    });
    window.parent.red_bloom_icon = L.icon({
        iconUrl: 'icons/marker_bloom_red.png',
        iconSize: [24, 24],
    });
    window.parent.parent_green_tree_icon = L.icon({
        iconUrl: '../../icons/marker_tree_green.png',
        iconSize: [24, 24],
    });
    window.parent.parent_green_bloom_icon = L.icon({
        iconUrl: '../../icons/marker_bloom_green.png',
        iconSize: [24, 24],
    });
}

function get_url_info(handle_map, tree_id, name, level) {
    var handle = handle_map[tree_id];
    if (level == 'module') {
        var prefix = '';
    } else {
        var prefix = handle[0] + '/' + handle[1] + ' - ' + handle[2] + '/';
    }
    if (level == 'popup') {
        var image_url = prefix + handle[2] + ' - ' + handle[3] + '.jpg'
        var image_stype = 'style="width: 240px; height: 180px;"';
    } else {
        var image_url = prefix + 'Thumbnails/' + handle[2] + ' - ' + handle[3] + '.thumbnail'
        var image_stype = '';
    }
    var url = prefix + handle[2] + '.html'
    var html = '<a href="' + url + '" ><div class="thumbnail"><img ' + image_stype + ' src="' + image_url + '" class="shadow-box"><p align="center">' + name + '</p></a>';
    var blooming = handle[4];
    return [ html, blooming ]
}

function show_module_latlong_in_osm(tree_id, name) {
    var markers = window.MAP_DATA;
    var bbox = window.BOX_DATA;
    var i = 0;
    var id_name = 'MAP_MODAL';
    var id_name = 'PHOTO_GALLERY';
    var handle_id_name = '#' + id_name;
    var lang_obj = window.parent.LANG_DATA;
    var lang = window.parent.LANG_OPT;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];
    var handle_map = lang_obj['Handle'];
    var english_lang_map = lang_obj['English'];
    var c_lat = (parseFloat(bbox[0][0]) + parseFloat(bbox[1][0])) / 2;
    var c_long = (parseFloat(bbox[0][1]) + parseFloat(bbox[1][1])) / 2;

    var name = key_name[tree_id];
    const [ html, blooming ] = get_url_info(handle_map, tree_id, name, 'module');
    if (blooming) {
        var icon = window.parent.parent_green_bloom_icon;
    } else {
        var icon = window.parent.parent_green_tree_icon;
    }
    var map = create_osm_map('tree', id_name, c_lat, c_long);
    for (var i = 0; i < markers.length; i++) {
        var marker = L.marker([markers[i].lat, markers[i].long], {icon: icon});
        var popup = L.popup({ maxWidth: 600, maxHeight: 480 }).setContent(html);
        marker.bindPopup(popup).bindTooltip(html, { direction: 'top' }).addTo(map);
    }
    map.fitBounds(bbox);
    map.invalidateSize();
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

function draw_map_on_move(ev) {
    var map = window.parent.map_area_map;
    var a_name = window.parent.map_area_name;
    var a_id = window.parent.map_area_id;
    var t_id = window.parent.map_tree_id;
    var latlong = map.getCenter();
    window.parent.map_area_move = true;
    show_area_latlong_in_osm(a_name, a_id, t_id, latlong.lat, latlong.lng);
    window.parent.map_area_move = false;
}

function handle_geocoder_mark(ev) {
    draw_map_on_move(ev);
}

function show_area_latlong_in_osm(a_name, a_id, t_id, c_lat, c_long) {
    var id_name = 'MAPINFO';
    var lang_obj = window.parent.LANG_DATA;
    var lang = window.parent.LANG_OPT;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];
    var handle_map = lang_obj['Handle'];
    var english_lang_map = lang_obj['English'];
    var area = window.parent.AREA_TYPE;

    window.parent.map_area_name = a_name;
    window.parent.map_area_id = a_id;
    window.parent.map_tree_id = t_id;

    var state = window.parent.map_initialized;
    if (state) {
        var map = window.parent.map_area_map;
        var area_marker_list = window.parent.area_marker_list;
        for (var i = 0; i < area_marker_list.length; i++) {
            area_marker_list[i].remove();
        }
        map.setView([c_lat, c_long]);
    } else {
        var map = create_osm_map('area', id_name, c_lat, c_long);
        window.parent.map_area_map = map;
        window.parent.map_area_move = false;
        map.on('zoomend', draw_map_on_move);
        map.on('dragend', draw_map_on_move);
    }
    window.parent.map_initialized = true;

    $('#TITLE_HEADER').html(a_name);

    var DISTANCE_THRESHOLD = 0.5;
    if (area == 'parks') {
        var DISTANCE_THRESHOLD = 0.5;
    } else if (area == 'wards') {
        var DISTANCE_THRESHOLD = 1.0;
    } else if (area == 'current') {
        var latlong = map.getCenter();
        c_lat = latlong.lat;
        c_long = latlong.lng;
    }

    var s_id = 0;
    if (area == 'trees') {
        s_id = a_id;
    } else if (t_id != 0) {
        s_id = t_id;
    }

    var min_lat = 0;
    var max_lat = 0;
    var min_long = 0;
    var max_long = 0;
    var bounds = map.getBounds();

    var area_marker_list = [];
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
            if (area == 'trees' && a_id != tree_id) {
                continue;
            }
            var name = key_name[tree_id];
            const [ popup_html, popup_blooming ] = get_url_info(handle_map, tree_id, name, 'popup');
            const [ tooltip_html, tooltip_blooming ] = get_url_info(handle_map, tree_id, name, 'tooltip');
            var icon = get_needed_icon((s_id == tree_id), popup_blooming);
            var latlong_list = mesh_latlong_dict[tree_id];
            for (var i = 0; i < latlong_list.length; i++) {
                var latlong = latlong_list[i];
                var m_lat = parseFloat(latlong[0]);
                var m_long = parseFloat(latlong[1]);
                if (area == 'trees') {
                    var distance = 0;
                    if (min_lat == 0 && max_lat == 0) {
                        min_lat = m_lat;
                        max_lat = m_lat;
                        min_long = m_long;
                        max_long = m_long;
                    } else {
                        min_lat = Math.min(m_lat, min_lat);
                        max_lat = Math.max(m_lat, min_lat);
                        min_long = Math.min(m_long, min_long);
                        max_long = Math.max(m_long, min_long);
                    }
                    var visible = true;
                } else {
                    var visible = bounds.contains([m_lat, m_long]);
                }
                if (visible) {
                    var marker = L.marker([m_lat, m_long], {icon: icon});
                    var popup = L.popup({ maxWidth: 300, maxHeight: 240 }).setContent(popup_html);
                    marker.bindPopup(popup).bindTooltip(tooltip_html, { direction: 'top' }).addTo(map);
                    marker.on('click', marker_on_click);
                    marker.tree_id = tree_id;
                    marker.blooming = popup_blooming;
                    area_marker_list.push(marker);
                }
            }
        }
    }
    window.parent.area_marker_list = area_marker_list;

    if (area == 'trees' && !window.parent.map_area_move && area_marker_list.length > 0) {
        var group = new L.featureGroup(area_marker_list);
        map.fitBounds(group.getBounds());
    }

    if (area == 'current') {
        if (state) {
            var routing = window.parent.map_area_routing;
        } else {
            var latlong = area_marker_list[area_marker_list.length - 1].getLatLng();
            var routing = L.Routing.control({
              waypoints: [
                L.latLng(c_lat, c_long),
                L.latLng(latlong.lat, latlong.lng)
              ],
              geocoder: L.Control.Geocoder.nominatim()
            });
            routing.addTo(map);
            /*
            routing.hide();
            */
        }
        window.parent.map_area_routing = routing;
    }

    var tree_dict = {};
    for (var i = 0; i < area_marker_list.length; i++) {
        var marker = area_marker_list[i]; 
        var tid = marker.tree_id; 
        if (tree_dict.hasOwnProperty(tid)) {
            tree_dict[tid] += 1;
        } else {
            tree_dict[tid] = 1;
        }
    }
    var tree_list = [];
    for (var tid in tree_dict) {
        if (!tree_dict.hasOwnProperty(tid)) {
            continue;
        }
        var t_name = key_name[tid];
        tree_list.push({ 'TN' : t_name, 'TC' : tree_dict[tid], 'AID' : a_id, 'TID' : tid, 'ALAT' : c_lat, 'ALONG' : c_long })
    }
    if (tree_list.length > 0) {
        tree_list.sort(function (a, b) { return b.TC - a.TC; });
        var data = { 'trees' : tree_list };
        render_template_data('#tree-stats-template', '#STATINFO', data);
    }
}

function tree_area_init(item_data) {
    var params = new UrlParameters(window.location.search);
    var area = params.getValue('area');
    var aid = params.getValue('aid');
    window.parent.AREA_TYPE = area;
    window.parent.AREA_DATA = item_data;

    var lang_obj = window.parent.LANG_DATA;
    var lang = window.parent.LANG_OPT;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];

    var lat_long = [ BANGALORE_LAT, BANGALORE_LONG ];

    if (area == 'parks') {
        var data = item_data['parks'];
        if (aid != '') {
            var area_list = data['parkinfo'];
            for (var i = 0; i < area_list.length; i++) {
                var park_list = area_list[i]['parks'];
                for (var j = 0; j < park_list.length; j++) {
                    var park = park_list[j];
                    if (park['PID'] == aid) {
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
            an['AN'] = key_name[an['AN']];
        }
        render_template_data('#sidenav-template', '#NAVINFO', data);
    } else if (area == 'current') {
    } else {
        return;
    }

    window.parent.map_initialized = false;

    var url = 'grid.json';
    $.getJSON(url, function(grid_obj) {
        window.parent.GRID_FLORA = grid_obj['grid flora'];
        window.parent.GRID_MESH = grid_obj['grid mesh'];
        window.parent.GRID_CENTRE = grid_obj['grid centre'];

        var name = area[0].toUpperCase() + area.slice(1);
        show_area_latlong_in_osm(name, 0, 0, lat_long[0], lat_long[1]);
    });
}

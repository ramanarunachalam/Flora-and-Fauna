
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
    var info_list = card_data['cardinfo']
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
    render_template_data('#card-info-template', '#CARDINFO', data);
}

function tree_simple_init(data) {
    render_template_data('#card-info-template', '#CARDINFO', data);
}

var start_tree = 0;

function tree_intro_init(data) {
    window.parent.LANG_OPT = 'English';
    window.parent.search_initialized = false;
    window.onload = tree_info_init;

    render_template_data('#carousel-template', '#SLIDERINFO', data);

    start_tree = Math.floor((Math.random() * $('.carousel-item').length));
    var $img = $('.carousel-item').eq(start_tree);
    $img.attr('src', $img.attr('data_src'));
    $next = $('img', this).next();
    $next.attr('src', $next.attr('data_src'));

    search_init();
}

function tree_info_init() {
    var url = '../language.json';
    $.getJSON(url, function(lang_obj) {
        window.parent.LANG_DATA = lang_obj;
    });

    var $img = $('.carousel-item').eq(start_tree);
    $img.addClass("active");

    $('.carousel').on('slide.bs.carousel', function(){
        var $img = $('.active img', this);
        $img.attr('src', $img.attr('data_src'));

        var $next = $('.active', this).next();
        if ($next != undefined) {
            $next = $('img', $next);
            $next.attr('src', $next.attr('data_src'));
        }
    });

    $('.carousel').carousel({
          pause: "hover",
          interval: 3000
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

function show_module_latlong_in_osm(name) {
    var url = 'http://wikipedia.org';
    var markers = window.MAP_DATA;
    var bbox = window.BOX_DATA;
    var i = 0;
    var id_name = 'MAP_MODAL';
    var id_name = 'PHOTO_GALLERY';
    var c_lat = (bbox[0][0] + bbox[1][0]) / 2;
    var c_long = (bbox[0][1] + bbox[1][1]) / 2;

    var pinIcon = L.icon({
        iconUrl: '../../icons/marker_tree_green.png',
        iconSize: [24, 24],
    });

    var map = L.map(id_name, { center: [c_lat, c_long] });
    L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: ['a', 'b', 'c']
    }).addTo(map);
    for (var i = 0; i < markers.length; i++) {
        var u = '<a href="' + url + '" target="_blank">' + name + '</a>';
        L.marker([markers[i].lat, markers[i].long], {icon: pinIcon}).bindPopup(u).addTo(map);
    }
    map.fitBounds(bbox);

    var handle_id_name = '#' + id_name;
    /* $(handle_id_name).modal(); */
}

function show_area_latlong_in_osm(c_lat, c_long) {
    var id_name = 'MAPINFO';
    var lang_obj = window.parent.LANG_DATA;
    var lang = window.parent.LANG_OPT;
    var lang_map = lang_obj[lang];
    var key_name = lang_map['Name'];
    var english_lang_map = lang_obj['English'];
    var english_key_info = english_lang_map['Key Name'];
    var english_key_part = english_lang_map['Key Part'];
    var english_key_name = english_lang_map['Name'];

    var genus_key_id = 0; 
    for (var key_id in english_key_part) {
        if (!english_key_part.hasOwnProperty(key_id)) {
            continue;
        }
        var name = english_key_part[key_id];
        if (name == 'Genus' ) {
            genus_key_id = parseInt(key_id);
        }
    }

    var pinIcon = L.icon({
        iconUrl: 'icons/marker_tree_green.png',
        iconSize: [24, 24],
    });

    if ( window.parent.map_initialized ) {
        var map = window.parent.MAP;
        map.setView([c_lat, c_long]);
    } else {
        var map = L.map(id_name, { center: [c_lat, c_long], zoom: 17, minZoom: 4, maxZoom: 21 });
        window.parent.MAP = map;
        L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          subdomains: ['a', 'b', 'c']
        }).addTo(map);
    }
    window.parent.map_initialized = true;

    if (window.AREA_TYPE == 'parks') {
        var DISTANCE_THRESHOLD = 0.3;
    } else if (window.AREA_TYPE == 'wards') {
        var DISTANCE_THRESHOLD = 1.0;
    } else {
        var DISTANCE_THRESHOLD = 0.2;
    }

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
            var latlong_list = mesh_latlong_dict[tree_id];
            for (var i = 0; i < latlong_list.length; i++) {
                var marker = latlong_list[i];
                var m_lat = parseFloat(marker[0]);
                var m_long = parseFloat(marker[1]);
                var distance = geo_distance(c_lat, c_long, m_lat, m_long)
                if (distance <= DISTANCE_THRESHOLD) {
                    var name = key_name[tree_id];
                    var url = english_key_name[tree_id];
                    var u = '<a href="' + url + '" target="_blank">' + name + '</a>';
                    L.marker([m_lat, m_long], {icon: pinIcon}).bindPopup(u).addTo(map);
                }
            }
        }
    }
}

function tree_map_init() {
    var url = 'grid.json';
    $.getJSON(url, function(grid_obj) {
        window.GRID_FLORA = grid_obj['grid flora'];
        window.GRID_MESH = grid_obj['grid mesh'];
        window.GRID_CENTRE = grid_obj['grid centre'];
    });
}

function tree_area_init(item_data) {
    var params = new UrlParameters(window.location.search);
    var area = params.getValue('area');
    window.AREA_TYPE = area;

    if (area == 'parks') {
        var data = item_data['parks'];
        render_template_data('#sidenav-template', '#NAVINFO', data);
        render_template_data('#stats-template', '#STATINFO', data);
    } else if (area == 'wards') {
        var data = item_data['wards'];
        render_template_data('#sidenav-template', '#NAVINFO', data);
        render_template_data('#stats-template', '#STATINFO', data);
    } else {
        return;
    }

    window.parent.map_initialized = false;

    var url = 'grid.json';
    $.getJSON(url, function(grid_obj) {
        window.GRID_FLORA = grid_obj['grid flora'];
        window.GRID_MESH = grid_obj['grid mesh'];
        window.GRID_CENTRE = grid_obj['grid centre'];
    });
}

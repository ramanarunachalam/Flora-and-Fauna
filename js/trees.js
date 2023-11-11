const BANGALORE_LAT    = 12.97729;
const BANGALORE_LONG   = 77.59973;
const BANGALORE_CENTER = [ BANGALORE_LAT, BANGALORE_LONG ];
const BANGALORE_BBOX   = '77.299805,12.762250,77.879333,13.170423';
const HEATMAP_CENTER   = [ 12.96621, 77.60680 ]; // Shoolay Circle

const INIT_COUNT       = 5;
const IMP_COUNT        = 4;

const MAP_ICON_SIZE    = [24, 24];
const MAP_ANCHOR_POS   = [12, 24];

const MAP_MARKER_COUNT = 1000;
const MAP_MARKER_TIME  = 100;

const SEARCH_BASE_0    = 0;
const SEARCH_BASE_1    = 1000;
const SEARCH_BASE_2    = 4000;
const SEARCH_BASE_3    = 5000;
const MAX_RESULTS      = 25;

const SPEECH_TIME      = 100;
const MAX_PAGES        = 100;

const TREE_MIN_COUNT   = 200;
const TREE_MAX_COUNT   = 750;

const MIN_ZOOM         = 12;
const AREA_MIN_ZOOM    = 16;
const DEFAULT_ZOOM     = 18;
const MAX_ZOOM         = 21;

const MAX_RADIUS       = 12;

const WARD_COLOR       = '#CE8CF8';

const EMPTY_THUMBNAIL  = 'blank.svg';

const FLORA_BASE       = 'Flora';
const LANGUAGE_URL     = 'language.json';
const SEARCH_URL       = 'flora_index.json';
const AREA_URL         = 'area.json';
const GRID_URL         = 'grid.json';
const HISTORY_URL      = 'history.json';

const OSM_TILE_URL     = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_BUILDING_URL = 'https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json';
const OSM_ATTR_URL     = 'https://www.openstreetmap.org/copyright';
const OSM_ATTRIBUTION  = `&copy; <a href="${OSM_ATTR_URL}">OpenStreetMap</a>`;

const SEARCH_OPTIONS   = { prefix: true, boost: { title: 2 }, combineWith: 'AND', fuzzy: null };
const SEARCH_END_CHAR  = '.';
const SEARCH_MAP_DICT  = { 'c' : 's', 'p' : 'b' };

const TILE_OPTIONS = {
    attribution: OSM_ATTRIBUTION,
    subdomains: ['a', 'b', 'c'],
    maxNativeZoom: DEFAULT_ZOOM,
    maxZoom: MAX_ZOOM
};

const INTRO_SWIPER_OPTIONS = {
    direction: 'horizontal',
    speed: 500,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    autoplay: { delay: 5000, disableOnInteraction: false }
};

const AREA_SWIPER_OPTIONS = {
    direction: 'horizontal',
    centeredSlides: true,
    slidesPerView: 3,
    spaceBetween: 5,
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }
};

const SEARCH_REPLACE_LIST =  [ [ /(e)\1+/g, 'i' ],
                               [ /(o)\1+/g, 'u' ],
                               [ /(.)\1+/g, '$1' ],
                               [ /([bcdfgjklpst])h/g, '$1' ],
                               [ /([sd])v/g, '$1w' ],
                               [ /([ao])u/g, 'ow' ]
                             ];

const [ H_NAME, H_FAMILY, H_GENUS, H_SPECIES, H_AUTH, H_BLOOM, H_PART, H_GROW, H_LEAF ] = [...Array(9).keys()];


function capitalize_word(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function get_url_params() {
    const args = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function(m, key, value) { args[key] = value;
    });
    return args;
}

async function wait_sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec))
}

class LangMap {
    constructor() {
        const lang = window.render_language;
        let lang_data = window.tree_lang_data;
        this.iso = lang_data['iso'];
        this.language = lang_data['language'];
        this.park_map = lang_data['Parks'];
        this.ward_map = lang_data['Wards'];
        this.handle_map = lang_data['Handle'];
        lang_data = window.tree_lang_map_data;
        this.lang_map = lang_data;
        this.map_dict = lang_data['Keys'];
        this.lang_name_map = lang_data['Name'];
        this.lang_key_image = lang_data['Image'];
        const english_map = window.tree_eng_map_data;
        this.english_key_image = english_map['Image'];
        this.english_key_name = english_map['Key Name'];
    }
}

function lang_name_init() {
    const lang = window.render_language;
    transliterator_lang_init(lang);
    window.id_map = new LangMap();
}

async function set_language(n, o) {
    window.GOT_LANGUAGE = n;
    const lang_dict = window.id_map.language;
    window.render_language = lang_dict[n];
    const lang = window.render_language;
    const l_lang = lang.toLowerCase();
    window.tree_lang_map_data = await d3.json(`${l_lang}_map.json`);
    load_menu_data();
}

function toggle_icon(id_name, old_class, new_class) {
    id_name = '#' + id_name;
    d3.selectAll(id_name).classed(old_class, false);
    d3.selectAll(id_name).classed(new_class, true);
}

function toggle_brightness() {
    window.COLOR_SCHEME = (window.COLOR_SCHEME === 'dark') ? 'light' : 'dark';
    d3.select('html').attr('data-bs-theme', window.COLOR_SCHEME);
    const [ o, n ] = (window.COLOR_SCHEME === 'dark') ? [ 'bi-moon-fill', 'bi-brightness-high-fill' ] : [ 'bi-brightness-high-fill', 'bi-moon-fill' ];
    toggle_icon('BRIGHTNESS', o, n)
}

function render_template_data(template_name, id_name, data) {
    const ul_template = d3.select('#' + template_name).html();
    const template_html = Mustache.render(ul_template, data);
    d3.select('#' + id_name).html(template_html);
}

function set_key_value_map(d_obj, d_key) {
    const imap = window.id_map;
    const d = d_obj[d_key];
    if (d[0] === 1) {
        const l_name = imap.english_key_name[d[1]];
        const l_map = imap.lang_map[l_name];
        d_obj[d_key] = l_map[d[2]];
    } else {
        d_obj[d_key] = d[2];
    }
}

function get_lang_map_word(n) {
    const t = window.id_map.map_dict[n];
    return (t === undefined) ? n : t;
}

function get_module_base(h) {
    return `${h[H_GENUS]} - ${h[H_NAME]}/${h[H_NAME]}`;
}

function get_part_image_urls(h, part_name) {
    const m_base = get_module_base(h);
    const i_url = `${m_base} - ${part_name}.jpg`;
    const t_url = `${h[H_GENUS]} - ${h[H_NAME]}/Thumbnails/${h[H_NAME]} - ${part_name}.thumbnail`;
    return [ i_url, t_url ];
}

function get_module_name(tree_id) {
    return (tree_id === 0) ? '' : window.id_map.handle_map[tree_id][H_NAME];
}

async function tree_module_init(data) {
    if (window.info_initialized === undefined) {
        window.tree_card_data = data;
        const url = `../../${LANGUAGE_URL}`;
        const lang_obj = await d3.json(url);
        if (lang_obj !== null) {
            window.tree_lang_data = lang_obj;
            window.render_language = 'English';
            lang_name_init();
            window.info_initialized = true;
            tree_module_init(window.tree_card_data);
        };
        return;
    }

    window.tree_card_data = data;
    window.tree_map_data = data['mapinfo'];
    window.tree_box_data = data['mapregion'];

    const imap = window.id_map;
    const key_name = imap.lang_name_map;
    const card_data = window.tree_card_data;
    const gallery_info = card_data['galleryinfo']
    const tree_id = gallery_info['HID'];

    const key_group = imap.lang_map['Key Group'];
    const key_part = imap.lang_map['Key Part'];
    const h = imap.handle_map[tree_id];
    gallery_info['HH'] = key_group[gallery_info['HH']];
    gallery_info['HN'] = imap.lang_name_map[gallery_info['HN']];
    const gallery_list = gallery_info['gallery'].split(',');
    const new_gallery_list = [];
    for (const image_id of gallery_list) {
        const is_digit = image_id.length === 4;
        const caption = is_digit ? image_id : imap.lang_key_image[image_id];
        const part_name = is_digit ? image_id : imap.english_key_image[image_id];
        const [ i_url, t_url ] = get_part_image_urls(h, part_name);
        const new_item = { 'IC': caption, 'IN': i_url };
        new_gallery_list.push(new_item);
    }
    gallery_info['gallery'] = new_gallery_list;
    const info_list = card_data['cardinfo'];
    for (const cv_info of info_list) {
        cv_info['CN'] = key_group[cv_info['CN']];
        for (const cv of cv_info['CV']) {
            cv['N'] = key_part[cv['N']];
            set_key_value_map(cv, 'V');
        }
    }
    render_template_data('module-card-info-template', 'CARDINFO', card_data);
}

function tree_grid_init(type, data) {
    const imap = window.id_map;
    const card_list = data['cardinfo'];
    const MAX_COL = 6;
    for (const card of card_list) {
        set_key_value_map(card, 'N');
        const new_row_list = [];
        let new_col_list = [];
        for (const row of card['ROW']) {
            const [ tree_id, image_id ] = row.split(',');
            const h = imap.handle_map[tree_id];
            const [ i_url, t_url ] = get_part_image_urls(h, imap.english_key_image[image_id]);
            new_item = { CI: tree_id, CN: imap.lang_name_map[tree_id], CT: (image_id === '') ? EMPTY_THUMBNAIL : t_url };
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
    render_template_data('grid-card-info-template', 'CARDINFO', data);
}

function tree_simple_init(data) {
    render_template_data('simple-card-info-template', 'CARDINFO', data);
}

function get_region_url(type) {
    return `${FLORA_BASE}/trees_${window.tree_region}_${type}.json`;
}

function tree_intro_init(slider_data) {
    const lang = window.render_language;
    const imap = window.id_map;

    const stats_info = slider_data['statsinfo'];
    get_lang_map(stats_info);
    stats_info['title'] = { T: get_lang_map_word('Trees'),
                            R: get_lang_map_word(capitalize_word(window.tree_region))
                          };
    const stats_data = {};
    for (const item of stats_info['items']) {
        if (item.N === 'Locations') stats_data['L'] = item.C;
        if (item.N === 'Parks') stats_data['P'] = item.C;
        if (item.N === 'Wards') stats_data['W'] = item.C;
        if (item.N === 'Maps') stats_data['M'] = item.C;
    }
    stats_data['R'] = stats_info['deletes'];
    window.stats_data = stats_data;

    const slider_info = slider_data['sliderinfo'];
    let slider_list = [];
    for (const slider of slider_info['items']) {
        const [ tree_id, count ] = slider;
        window.tree_count_data[tree_id] = count;
        const h = imap.handle_map[tree_id];
        const image_id = h[H_PART];
        const [ i_url, t_url ] = get_part_image_urls(h, imap.english_key_image[image_id]);
        const item = { SD: tree_id, SC: count, SN: imap.lang_name_map[tree_id],
                       SB: `${h[H_GENUS]} ${h[H_SPECIES]}`, SA: h[H_AUTH],
                       SI: i_url, ST: t_url
                     }
        slider_list.push(item);
    }
    slider_info['items'] = [];
    render_template_data('intro-carousel-template', 'INTRO_SLIDER', slider_data);
    setTimeout(() => {
        slider_list = d3.shuffle(slider_list);
        slider_info['items'] = slider_list.slice(0, INIT_COUNT);
        render_template_data('intro-carousel-template', 'INTRO_SLIDER', slider_data);
        const swiper = new Swiper('#INTRO_CAROUSEL', INTRO_SWIPER_OPTIONS);
        setTimeout(() => {
            slider_info['items'] = slider_list.slice(INIT_COUNT);
            render_template_data('intro-carousel-template', 'INTRO_SLIDER', slider_data);
            const swiper = new Swiper('#INTRO_CAROUSEL', INTRO_SWIPER_OPTIONS);
        }, 26000);
    }, 0);
}

async function load_intro_data(region, slider_obj) {
    window.tree_region = region;
    const lang = window.render_language;
    const c_region = capitalize_word(region);
    const intro_data = { 'N' : 'Tree', 'T' : 'Trees', 'P' : c_region,
                         'I' : 'Keys To Identify', 'R' : 'References', 'B' : 'Books',
                         'L' : 'Leaves', 'F' : 'Flowers', 'BA' : 'Bark', 'FR' : 'Fruits', 'FI' : 'Figs', 'PO' : 'Pods',
                         'SP' : 'Spines', 'TW' : 'Branch', 'A' : 'Aerial Root', 'G' : 'Gall'
                       };
    for (let k in intro_data) {
        if (!intro_data.hasOwnProperty(k)) continue;
        intro_data[k] = get_lang_map_word(intro_data[k]);
    }
    render_template_data('intro-template', 'SECTION', intro_data);
    let slider_data = slider_obj;
    if (slider_obj === undefined) slider_data = await d3.json(get_region_url('intro'));
    if (slider_data === null) return;
    tree_intro_init(slider_data);
    add_history('introduction', { 'region' : region });
}

class Paginator {
    constructor() {
        this.current_page = 1;
        this.max_page = MAX_PAGES;
    }

    show_page(which, is_prev) {
        const path_list = window.location.pathname.split('/');
        let new_page = 1;
        if (is_prev) {
            new_page = 1;
            if (this.current_page > 1) {
                new_page = this.current_page - 1;
            }
        } else {
            new_page = this.max_page;
            if (this.current_page < this.max_page) {
                new_page = this.current_page + 1;
            }
        }
        this.current_page = new_page;
        const href = d3.select(`li#${which}_${new_page} a`).attr('href');
        window.open(href, '_self', false);
    }

    set_grid_page(n_current_page, n_max_page) {
        d3.select('#top-page-next').on('click', () => { this.show_page('top', false); });
        d3.select('#top-page-previous').on('click', () => { this.show_page('top', true); });
        d3.select('#bottom-page-next').on('click', () => { this.show_page('bottom', false); });
        d3.select('#bottom-page-previous').on('click', () => { this.show_page('bottom', true); });

        this.current_page = (n_current_page === undefined) ? 1 : n_current_page;
        d3.selectAll('li.page-item.active').classed('active', false);
        d3.select(`li#top_${this.current_page}`).classed('active', true);
        d3.select(`li#bottom_${this.current_page}`).classed('active', true);
        this.max_page = (n_max_page === undefined) ? MAX_PAGES : n_max_page;
    }
}

function tree_collection_init(type, letter, page_index, max_page, full_data) {
    const imap = window.id_map;
    const data = full_data[type];
    const image_data = full_data['Images'];
    const letter_data = data['LETTER'];
    const new_row_list = [];
    const col_name = 'COL' + type[0].toUpperCase();
    let i = 0;
    for (const tree_id of letter_data[letter]) {
        const h = imap.handle_map[tree_id];
        const new_image_list = [];
        const image_list = image_data[tree_id].split(',');
        for (const image_id of image_list) {
            const [ i_url, t_url ] = get_part_image_urls(h, imap.english_key_image[image_id]);
            const new_item = { CI: tree_id, CT: (image_id === '') ? EMPTY_THUMBNAIL : t_url };
            new_image_list.push(new_item);
        }
        const new_item = { COLIMAGE: new_image_list };
        new_item[col_name] = { CC: ++i, CI: tree_id, CN: imap.lang_name_map[tree_id], CF: h[H_FAMILY],
                               CB: `${h[H_GENUS]} ${h[H_SPECIES]}`, CA: h[H_AUTH]
                             }
        new_row_list.push(new_item);
    }
    i = 0;
    const [ group, max_pages, links ] = data['PAGES'];
    const link_list = links.split(',')
    const new_link_list = [];
    for (const page of link_list) {
        const page_id = ++i;
        const item = { PL: page, PC: page_id, PH: `load_collection_data('${group}', '${page}', ${page_id}, ${max_pages})` };
        new_link_list.push(item);
    }
    const page_data = { N: 'Page', links: new_link_list };
    const new_data = { cardinfo: { N: letter, ROW: new_row_list }, pageinfo: page_data };

    new_data['pageinfo']['N'] = 'top';
    render_template_data('pagination-template', 'TOPPAGE', new_data);
    new_data['pageinfo']['N'] = 'bottom';
    render_template_data('pagination-template', 'BOTTOMPAGE', new_data);
    render_template_data('collection-card-info-template', 'CARDINFO', new_data);

    window.paginator.set_grid_page(page_index, max_page);
}

function get_bs_modal(id) {
    return new bootstrap.Modal(d3.select(id).node());
}

function show_bigger_image(image_src, caption) {
    d3.select('#IMAGE_IN_MODAL').attr('src', image_src);
    d3.select('#IMAGE_MODEL_LABEL').html(caption);
    get_bs_modal('#IMAGE_MODAL').show();
}

function normalize_search_text(search_text) {
    search_text = search_text.toLowerCase();
    for (const expr of SEARCH_REPLACE_LIST) {
        search_text = search_text.replace(expr[0], expr[1]);
    }
    return search_text;
}

function search_load(search_obj) {
    if (window.search_initialized) return;
    if (search_obj === null) return;
    let data_id = 0;
    for (let category in search_obj) {
        if (!search_obj.hasOwnProperty(category)) continue;
        const data_list = search_obj[category];
        for (const item of data_list) {
            const t_list = item.A.slice(0, IMP_COUNT);
            const a_list = item.A.slice(IMP_COUNT);
            const pop = (item.P !== undefined) ? item.P : -1;
            const count = (item.C !== undefined) ? item.C : 0;
            const data_doc = { id: data_id, category: item.T, name: item.N, title: t_list, aka: a_list,
                               href: item.H, pop: pop, count: count
                             };
            window.flora_search_engine.add(data_doc);
            data_id += 1;
        }
    }
}

function search_init() {
    window.flora_search_engine = new MiniSearch({
        fields: [ 'title', 'aka' ], // fields to index for full-text search
        storeFields: ['name', 'genus', 'species', 'href', 'category', 'pop', 'count'] // fields to return with search results
    });
    window.search_initialized = false;
    d3.json(SEARCH_URL).then((search_obj) => { search_load(search_obj); window.search_initialized = true; });
}

function get_search_href(category, arg_list) {
    const func = (category === 'Trees') ? 'load_module_data' : 'load_area_data';
    const args = arg_list.join("', '");
    const href = `${func}('${args}')`;
    return href;
}

function get_search_results(search_word, item_list, id_list, base_pop) {
    const lang = window.render_language;
    const imap = window.id_map;
    const results = window.flora_search_engine.search(search_word, SEARCH_OPTIONS);
    if (results.length <= 0) return;
    const max_score = results[0].score;
    const score_ratio = 400 / results[0].score;
    const pop_ratio = 0.6;
    const calculate_pop = search_word.length > 3;
    for (const item of results) {
        if (id_list.has(item.id)) continue;
        // if (item.category === 'Maps' && item.count <= 0) continue;
        if (item.category === 'Maps') continue;
        const name_id = item.name;
        let name = '';
        let href = '';
        if (item.category === 'Trees') {
            href = [ name_id ];
            name = imap.lang_name_map[name_id];
        } else if (item.category === 'Maps') {
            name = imap.lang_name_map[name_id];
            href = [ 'trees', name_id ];
        } else if (item.category === 'Parks') {
            name = imap.park_map[name_id];
            href = [ 'parks', name_id, name.replace("'", "") ];
        } else if (item.category === 'Wards') {
            name = imap.ward_map[name_id];
            href = [ 'wards', name_id, name ];
        }
        const category = get_lang_map_word(item.category);
        href = get_search_href(item.category, href);
        const new_pop = (score_ratio * item.score) + (pop_ratio * item.pop);
        let pop = (calculate_pop) ? new_pop : item.pop;
        if (item.category === 'Maps') pop -= 1;
        pop = base_pop + pop;
        let r_item = { 'T' : category, 'N' : name, 'H' : href, 'P' : pop, 'SC' : item.score, 'C' : item.count, 'I' : name_id };
        if (item.category === 'Trees' || item.category === 'Maps') {
            const h = imap.handle_map[name_id];
            r_item['G'] = h[H_GENUS];
            r_item['S'] = h[H_SPECIES];
        }
        if (name_id !== '') r_item['I'] = name_id;
        item_list.push(r_item);
        id_list.add(item.id);
    }
}

function get_tamil_phonetic_word(word) {
    const w_list = [];
    const new_word = word.toLowerCase();
    for (const c of new_word) {
        w_list.push((c in SEARCH_MAP_DICT) ? SEARCH_MAP_DICT[c] : c);
    }
    return w_list.join('');
}

function load_search_part(search_word, non_english) {
    const s_search_word = search_word.replace(/\s/g, '');
    const item_list = [];
    const id_list = new Set();
    SEARCH_OPTIONS.fuzzy = term => term.length > 3 ? 0.1 : null;
    get_search_results(search_word, item_list, id_list, SEARCH_BASE_2);
    if (search_word !== s_search_word) {
        get_search_results(s_search_word, item_list, id_list, SEARCH_BASE_1);
    }
    let n_search_word = '';
    if (non_english) {
        n_search_word = get_tamil_phonetic_word(search_word);
        get_search_results(n_search_word, item_list, id_list, SEARCH_BASE_3);
    }
    if (search_word.length > 2) {
        SEARCH_OPTIONS.fuzzy = term => term.length > 3 ? 0.3 : null;
        get_search_results(search_word, item_list, id_list, SEARCH_BASE_0);
        if (non_english && n_search_word) {
            get_search_results(n_search_word, item_list, id_list, SEARCH_BASE_0);
        }
        if (search_word !== s_search_word) {
            get_search_results(s_search_word, item_list, id_list, SEARCH_BASE_0);
        }
    }
    item_list.sort(function (a, b) { return b.P - a.P; });
    const new_item_list = item_list.slice(0, MAX_RESULTS);
    // console.log('Search results:', new_item_list);
    return new_item_list;
}

function handle_search_word(search_word) {
    const c = search_word.charCodeAt(0);
    if (c > 127) search_word = transliterate_lang_to_hk(search_word);
    const non_english = (0x0B80 <= c && c <= 0x0BFF) ? true : false;
    const new_item_list = load_search_part(search_word, non_english);
    const item_data = { "searchinfo" : { "results" : new_item_list } };
    render_template_data('search-template', 'SECTION', item_data);
    window.scrollTo(0, 0);
    add_history('search', { 'search' : search_word });
}

function get_geocoder_nominatim() {
    const nominatim =  L.Control.Geocoder.nominatim({
        geocodingQueryParams: { viewbox: BANGALORE_BBOX, countrycodes: 'in', bounded: 1 }
    });
    window.geocoder_nominatim = nominatim;
    return nominatim;
}

function get_geocoder_search_results(search_word) {
    if (window.geocoder_nominatim === null || window.geocoder_nominatim === undefined) {
        window.geocoder_nominatim = get_geocoder_nominatim();
    }
    window.geocoder_nominatim.geocode(search_word, handle_geocoder_search_results, search_word);
}

function handle_geocoder_search_results(results, context) {
    // console.log('handle_geocoder_search_results:', results, context);
    const search_items = [];
    let i = 0;
    for (const item of results) {
        const name = item.name.split(',').slice(0, 3).join(',');
        const ll = item.center;
        const lat_long = `${ll.lat},${ll.lng}`;
        const href = get_search_href('parks', [ 'parks', name.replace("'", ""), lat_long ]);
        const new_item = { I: i++, T: 'Geocoder', N: name, H: href, P: i, SC: i };
        search_items.push(new_item);
    }
    const item_data = { "searchinfo" : { "results" : search_items } };
    render_template_data('search-template', 'SECTION', item_data);
    window.scrollTo(0, 0);
}

function load_search_data() {
    let search_word = d3.select('#SEARCH_WORD').property('value');
    search_word = decodeURI(search_word);
    const search_len = search_word.length;
    if (search_len > 1 && search_word[search_len - 1] === SEARCH_END_CHAR) {
        get_geocoder_search_results(search_word.slice(0, search_len - 1))
    } else {
        handle_search_word(search_word);
    }
}

function init_search_listener() {
    d3.select('#SEARCH_WORD').on('input', load_search_data);
}

function load_search_history(data) {
    const search_word = data['search'];
    d3.select('#SEARCH_WORD').property('value', search_word);
    handle_search_word(search_word);
}

function get_zoom(osm_map) {
    let zoom = DEFAULT_ZOOM;
    if (osm_map !== null && !window.map_area_click) zoom = osm_map.getZoom();
    if (window.area_type === 'trees' && window.map_area_click) zoom = MIN_ZOOM;
    // console.log('get_zoom:', window.area_type, window.map_area_click, zoom);
    return zoom;
}

function create_osm_map(module, c_lat, c_long, zoom, min_zoom) {
    const map_options  = { center: [ c_lat, c_long ],
                           rotate: true,
                           touchRotate: true,
                           zoom: zoom,
                           minZoom: min_zoom,
                           maxZoom: MAX_ZOOM
                         };
    const osm_map = new L.map('MAPINFO', map_options);
    osm_map.on('zoomend dragend', draw_map_on_move);
    window.map_osm_map = osm_map;
    window.map_osm_layer = new L.LayerGroup();
    osm_map.addLayer(window.map_osm_layer);
    const tile_layer = new L.tileLayer(OSM_TILE_URL, TILE_OPTIONS);
    tile_layer.addTo(osm_map);
    const geocoder = new L.Control.geocoder({ geocoder: get_geocoder_nominatim() });
    geocoder.addTo(osm_map);
    if (module === 'area') {
        geocoder.on('finishgeocode', handle_geocoder_mark);
    }

    /*
    <script src="https://cdn.osmbuildings.org/classic/0.2.2b/OSMBuildings-Leaflet.js" defer></script>
      const osm_building = new OSMBuildings(osm_map).load(OSM_BUILDING_URL);
    */
    return osm_map;
}

function create_marker_icon(file_name) {
    return new L.icon({ iconUrl: `icons/${file_name}`, iconSize: MAP_ICON_SIZE, iconAnchor: MAP_ANCHOR_POS });
}

function create_icons() {
    window.green_tree_icon = create_marker_icon('marker_tree_green.png');
    window.green_bloom_icon = create_marker_icon('marker_bloom_green.png');
    window.red_tree_icon = create_marker_icon('marker_tree_red.png');
    window.red_bloom_icon = create_marker_icon('marker_bloom_red.png');
}

function get_needed_icon(selected, blooming) {
    if (selected) return (blooming) ? window.red_bloom_icon : window.red_tree_icon;
    else if (blooming) return window.green_bloom_icon;
    return window.green_tree_icon;
}

async function set_removed_data() {
    let deleted_data = null;
    if (window.deleted_quad_tree === null) {
        const history_data = await d3.json(HISTORY_URL);
        if (history_data === null) return;
        deleted_data = history_data['deleted'];
        if (deleted_data === null) return;
    }
    if (window.deleted_quad_tree === null && deleted_data !== null) {
        const quad_tree = d3.quadtree();
        for (const tree_id in deleted_data) {
            const latlong_list = deleted_data[tree_id];
            for (const latlong of deleted_data[tree_id]) {
                quad_tree.add([+latlong[0], +latlong[1], +tree_id]);
            }
        }
        window.deleted_quad_tree = quad_tree;
    }
}

function clear_layers() {
    if (!window.map_initialized) return;
    if (window.map_type === 'basic' && !window.map_area_click) return;
    if (window.map_type !== 'heatmap') window.map_osm_layer.clearLayers();
    window.ward_boundary = null;
    window.area_marker_list = [];
    window.area_marker_dict = {};
}

function create_map_layer(map_type) {
    if (window.map_osm_layer !== null) window.map_osm_map.removeLayer(window.map_osm_layer);
    if (map_type === 'heatmap') { window.map_osm_layer = L.heatLayer([], { radius: MAX_RADIUS });
    } else if (map_type === 'cluster') { window.map_osm_layer = L.markerClusterGroup();
    } else { window.map_osm_layer = new L.featureGroup(); }
    window.map_osm_map.addLayer(window.map_osm_layer);
}

async function render_map_type(map_type) {
    const old_map_type = window.map_type;
    clear_layers();
    map_type = (old_map_type === map_type) ? 'basic' : map_type;
    window.map_type = map_type;
    create_map_layer(map_type);

    if (map_type === 'removed') await set_removed_data();
    window.quad_tree = (map_type === 'removed') ? window.deleted_quad_tree : window.all_quad_tree;

    const osm_map = window.map_osm_map;
    const zoom = (map_type !== 'basic' && map_type !== 'cluster') ? MIN_ZOOM : DEFAULT_ZOOM;
    let latlong = get_area_centre();
    if (map_type === 'heatmap') latlong = HEATMAP_CENTER;
    else if (map_type === 'cluster') latlong = window.default_latlong;
    else if (map_type === 'removed') latlong = HEATMAP_CENTER;

    window.map_area_click = true;
    setTimeout(() => {
        osm_map.setView(latlong, zoom);
        window.map_area_click = false;
        draw_map_on_move();
    }, 0);
}

function set_chosen_image(tree_id) {
    const imap = window.id_map;
    const name = imap.lang_name_map[tree_id];
    const h = imap.handle_map[tree_id];
    const image_id = h[H_PART];
    const [ i_url, t_url ] = get_part_image_urls(h, imap.english_key_image[image_id]);
    const h_url = `javascript:load_module_data('${tree_id}');`;
    const a_url = `javascript:load_area_data('trees', '${tree_id}');`;
    const name_html = `<a href="${a_url}">${name}</a>`;
    const img_html = `<center><a href="${h_url}"><div class="thumbnail"><img src="${FLORA_BASE}/${t_url}" class="shadow-box"></div></a></center>`;
    d3.select('#CHOSEN_ID').html(name_html);
    d3.select('#CHOSEN_IMG').html(img_html);
}

function handle_context_menu(key) {
    bootstrap.Modal.getInstance(d3.select('#CONTEXT_MODAL').node()).hide();

    const marker = window.TREE_CONTEXT_MARKER;
    const tree_id = marker.tree_id;
    const pos = marker.getLatLng();
    if (key === 'info') {
        load_module_data(tree_id);
    } else if (key === 'tmap') {
        load_area_data('trees', tree_id);
    } else if (key === 'gmap') {
        const url = `https://maps.google.com/maps?z=12&t=m&q=loc:${pos.lat}+${pos.lng}`;
        window.open(url, '');
    }
}

function marker_on_mouseover() {
    set_chosen_image(this.tree_id);
}

function marker_on_mouseout() {
    if (window.map_tree_id !== 0) set_chosen_image(window.map_tree_id);
}

function marker_on_click(e) {
    const tree_id = e.target.tree_id;
    window.map_tree_id = tree_id;
    for (const marker of window.area_marker_list) {
        const icon = get_needed_icon((marker.tree_id === tree_id), marker.blooming);
        marker.setIcon(icon);
    }
    find_area_carousel_tree(tree_id);
}

function load_module_data_with_id(tree_id) {
    window.map_tree_id = tree_id;
    load_module_data(tree_id);
}

function marker_on_doubleclick(e) {
    const tree_id = e.target.tree_id;
    load_module_data_with_id(tree_id);
}

function marker_on_contextmenu(e) {
    const marker = this;
    window.TREE_CONTEXT_MARKER = marker;
    const imap = window.id_map;
    const name = imap.lang_name_map[marker.tree_id];
    d3.select('#CONTEXT_MODEL_LABEL').html(name);
    get_bs_modal('#CONTEXT_MODAL').show();
}

function get_area_centre() {
    if (window.map_osm_map === null) return [];
    const latlong = window.map_osm_map.getCenter();
    const area_latlong = [ latlong.lat, latlong.lng ];
    return area_latlong;
}

function handle_geocoder_mark(ev) {
    draw_map_on_move(ev);
    add_history('maps', { 'type' : window.area_type, 'id' : window.map_area_id });
}

async function fetch_area_data() {
    if (window.area_data === null) window.area_data = await d3.json(AREA_URL);
    return window.area_data;
}

function create_quad_tree(grid_flora_list) {
    const quad_tree = d3.quadtree();
    for (const grid_flora of grid_flora_list) {
        const [ g_sw_lat, g_sw_long, g_ne_lat, g_ne_long, md_name, flora_list ] = grid_flora;
        for (const flora of flora_list) {
            let [ tree_id, latlong_list ] = flora;
            for (const latlong of latlong_list) {
                quad_tree.add([+latlong[0], +latlong[1], +tree_id]);
            }
        }
    }
    return quad_tree;
}

function quad_tree_visit(quad_tree) {
    let node_count = 0;
    let leaf_count = 0;
    quad_tree.visit((node, x1, y1, x2, y2) => {
        if (!node.length) {
            do ++leaf_count; while (node = node.next);
        }
        else {
            ++node_count;
        }
        return false;
    });
    console.log('Quad Tree:', quad_tree.size(), node_count, leaf_count);
}

function quad_tree_find(quad_tree, xmin, ymin, xmax, ymax, tree_id) {
    const results = [];
    quad_tree.visit((node, x1, y1, x2, y2) => {
        if (!node.length) {
            do {
                const [ dLat, dLong, dTreeId ] = node.data;
                if ((tree_id <= 0 || tree_id === dTreeId) && (xmin <= dLat && dLat < xmax && ymin <= dLong && dLong < ymax)) {
                    results.push(node.data);
                }
            } while (node = node.next);
        }
        return (x1 >= xmax || y1 >= ymax || x2 < xmin || y2 < ymin);
    });
    return results;
}

async function fetch_grid_data() {
    if (window.all_quad_tree === null) {
        const grid_data = await d3.json(GRID_URL);
        window.all_quad_tree = create_quad_tree(grid_data);
        window.quad_tree = window.all_quad_tree;
    }
}

function find_area_carousel_tree(tree_id) {
    for (const [i, tree_image] of window.tree_image_list.entries()) {
        if (tree_id === tree_image['TID']) {
            const swiper = d3.select('#AREA_CAROUSEL').node().swiper;
            swiper.slideTo(i);
            return i;
        }
    }
    return 0;
}

function area_chosen_tree(tree_id) {
    window.map_tree_id = tree_id;
    for (const marker of window.area_marker_list) {
        const icon = get_needed_icon((marker.tree_id === tree_id), marker.blooming);
        marker.setIcon(icon);
    }
    set_chosen_image(tree_id);
}

function area_highlight_tree(active_index) {
    const tree_index = active_index % window.tree_image_list.length;
    const tree_id = window.tree_image_list[tree_index]['TID'];
    area_chosen_tree(tree_id);
}

function area_click_tree(tree_id) {
    const tree_index = find_area_carousel_tree(tree_id);
    area_chosen_tree(tree_id);
    window.scrollTo(0, 0);
}

function area_carousel_init() {
    const swiper = new Swiper('#AREA_CAROUSEL', AREA_SWIPER_OPTIONS);
    swiper.on('slideChange', function (ev) {
        area_highlight_tree(ev.activeIndex);
    });

    let start_id = find_area_carousel_tree(window.map_tree_id);
    area_highlight_tree(start_id);
}

function add_marker(i_tree_id, m_lat, m_long, c_tree_id, blooming) {
    const icon = get_needed_icon(c_tree_id === i_tree_id, blooming);
    const marker = new L.marker([m_lat, m_long], {icon: icon});
    marker.state = 'new';
    marker.tree_id = i_tree_id;
    marker.blooming = blooming;
    const center = window.map_osm_map.getCenter();
    marker.distance = center.distanceTo(marker.getLatLng());
    marker.on('mouseover', marker_on_mouseover);
    marker.on('mouseout', marker_on_mouseout);
    marker.on('click', marker_on_click);
    marker.on('dblclick', marker_on_doubleclick);
    marker.on('contextmenu', marker_on_contextmenu);
    return marker;
}

function area_map_callback() {
    let count = 0;
    let new_count = 0;
    const marker_list = [];
    for (let i = window.area_marker_offset; i < window.area_marker_list.length; i++) {
        const marker = window.area_marker_list[i];
        if (window.map_type === 'heatmap') {
            const pos = marker.getLatLng();
            window.map_osm_layer.addLatLng([ pos.lat, pos.lng, 1.0 ]);
            new_count++;
        } else if (window.map_type === 'cluster' && marker.state === 'new') { marker_list.push(marker); new_count++;
        } else if (marker.state === 'new') { window.map_osm_layer.addLayer(marker); new_count++; }
        count++;
        if (new_count >= MAP_MARKER_COUNT) break;
    }
    if (window.map_type === 'cluster') window.map_osm_layer.addLayers(marker_list);
    window.area_marker_offset += count;
    if (window.area_marker_offset < window.area_marker_list.length) {
        const timer_id = setTimeout(() => { area_map_callback(); }, MAP_MARKER_TIME);
        window.area_marker_timer_list.push(timer_id);
    }
    // console.log('area_map_callback:', window.map_type, window.area_marker_list.length, count, new_count, window.area_marker_offset);
}

function draw_area_map(n_name, a_name, aid, tid, c_lat, c_long) {
    const osm_map = window.map_osm_map;
    const area = window.area_type;
    const imap = window.id_map;

    const bounds = osm_map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const area_marker_list = [];
    const area_marker_dict = {};
    const tree_dict = {};
    const is_tree = (area === 'trees');
    const c_tree_id = is_tree ? +aid : ((tid !== 0) ? +tid : 0);
    const point_list = quad_tree_find(window.quad_tree, sw.lat, sw.lng, ne.lat, ne.lng, is_tree ? c_tree_id : 0);
    let old_count = 0;
    let new_count = 0; 
    for (const point of point_list) {
        const [ m_lat, m_long, i_tree_id ] = point;
        tree_id = i_tree_id.toString();
        const h = imap.handle_map[tree_id];
        const blooming = h[H_BLOOM];
        let marker = window.area_marker_dict[[m_lat, m_long]];
        if (marker === undefined) {
            marker = add_marker(i_tree_id, m_lat, m_long, c_tree_id, blooming);
            new_count++;
        } else {
            marker.state = 'old';
            old_count++;
        }
        area_marker_list.push(marker);
        area_marker_dict[[m_lat, m_long]] = marker;
        tree_dict[tree_id] = (tree_dict[tree_id] || 0) + 1;
    }
    for (const ll in window.area_marker_dict) {
        const marker = window.area_marker_dict[ll];
        if (area_marker_dict[ll] === undefined) {
            if (window.map_type !== 'heatmap') window.map_osm_layer.removeLayer(marker);
        }
    }
    window.area_marker_dict = area_marker_dict;
    area_marker_list.sort(function (a, b) { return a.distance - b.distance; });
    window.area_marker_offset = 0;
    window.area_marker_list = area_marker_list;
    for (const timer_id of window.area_marker_timer_list) {
        clearTimeout(timer_id);
    }
    window.area_marker_timer_list = [];
    // console.log('Timer: after', window.area_marker_timer_list.length, window.area_marker_timer_list);
    if (window.map_type === 'heatmap') create_map_layer('heatmap');
    area_map_callback();

    const tree_stat_list = [];
    const tree_image_list = [];
    for (const tid in tree_dict) {
        if (!tree_dict.hasOwnProperty(tid)) continue;
        const t_name = imap.lang_name_map[tid];
        const h = imap.handle_map[tid];
        const blooming = h[H_BLOOM];
        const icon = (blooming) ? 'icons/marker_bloom_green.png' : 'icons/marker_tree_green.png';
        tree_stat_list.push({ 'TN' : t_name, 'TC' : tree_dict[tid], 'TI' : icon, 'AID' : aid,
                              'TID' : tid, 'ALAT' : c_lat, 'ALONG' : c_long
                           });
        if (!is_tree) {
            const image_id = h[H_PART];
            const [ i_url, t_url ] = get_part_image_urls(h, imap.english_key_image[image_id]);
            tree_image_list.push({ 'SN' : t_name, 'SI' : `${t_url}`, 'TID' : +tid, 'SC' : tree_dict[tid] })
        }
    }
    if (tree_stat_list.length > 0) {
        tree_stat_list.sort(function (a, b) { return b.TC - a.TC; });
        let tin = 1;
        let tcount = 0;
        for (const info of tree_stat_list) {
            info['TIN'] = tin;
            tin += 1;
            tcount += info['TC'];
        }
        if (!is_tree) {
            tin -= 1;
            let n_title = `${n_name} (<font class="NUM_COLOR">${tin} / ${tcount}</font>)`;
            d3.select('#TITLE_HEADER').html(n_title);
        }
        let data = { 'trees' : tree_stat_list };
        render_template_data('tree-stats-template', 'STATINFO', data);
        tree_image_list.sort(function (a, b) { return b.SC - a.SC; });
        data = { 'sliderinfo' : { 'items' : tree_image_list } };
        render_template_data('tree-carousel-template', 'MAP_SLIDER', data);
        if (is_tree) {
            d3.select('#MAP_SLIDER').html('');
        } else {
            window.tree_image_list = tree_image_list;
            area_carousel_init();
        }
    }

    if (area === 'wards') {
        const polygon_list = [];
        for (const p_list of window.area_data['wards']['wardarea'][aid.toString()]) {
            const new_l_list = [];
            for (const l_list of p_list[0]) {
                const [ lat, lng ] = l_list;
                new_l_list.push([ +lat, +lng ]);
            }
            polygon_list.push([ new_l_list ]);
        }
        const options = { color: WARD_COLOR };
        window.ward_boundary = L.polygon(polygon_list, options);
        window.map_osm_layer.addLayer(window.ward_boundary);
    }

    window.scrollTo(0, 0);
}

async function show_area_map(a_name, aid, tid, c_lat, c_long) {
    const lang = window.render_language;
    const area = window.area_type;
    const old_a_name = window.map_area_name;
    window.map_area_name = a_name;
    window.map_area_id = aid;
    if (tid === 0 && window.map_tree_id !== 0) tid = window.map_tree_id;
    window.map_tree_id = +tid;

    let n_name = '';
    if (area === 'trees') {
        n_name = get_module_name(tid);
    } else {
        n_name = get_lang_map_word(capitalize_word(a_name));
        if (aid !== '') {
            n_name = isFinite(aid) ? `${aid}. ${n_name}` : aid;
        }
    }
    if (window.map_type !== 'basic') n_name = capitalize_word(window.map_type);
    d3.select('#TITLE_HEADER').html(n_name);

    let osm_map;
    let zoom = DEFAULT_ZOOM;
    const min_zoom = (window.map_type === 'basic' && area !== 'trees') ? AREA_MIN_ZOOM : MIN_ZOOM;
    const map_type = (window.map_initialized) ? 'initialized' : 'created';
    if (window.map_initialized) {
        osm_map = window.map_osm_map;
        osm_map.options.minZoom = min_zoom;
        zoom = get_zoom(osm_map);
        osm_map.setView([c_lat, c_long], zoom);
    } else {
        zoom = get_zoom(null);
        osm_map = create_osm_map('area', c_lat, c_long, zoom, min_zoom);
        window.map_area_move = false;
        window.map_initialized = true;
    }
    // console.log('osm:', map_type, window.area_type, a_name, aid, tid, c_lat, c_long, zoom, osm_map.options.minZoom, osm_map.options.maxZoom);
    if (tid !== undefined && tid !== 0) set_chosen_image(tid);
    draw_area_map(n_name, a_name, aid, tid, c_lat, c_long);
    window.area_latlong = [];
}

function draw_map_on_move(ev) {
    if (window.map_area_click) return;
    const osm_map = window.map_osm_map;
    const latlong = osm_map.getCenter();
    window.map_area_move = true;
    setTimeout(() => {
        show_area_map(window.map_area_name, window.map_area_id, window.map_tree_id, latlong.lat, latlong.lng);
        window.map_area_move = false;
    }, 0);
}

function render_area_map(a_type, a_name, aid, tid, c_lat, c_long) {
    clear_layers();
    window.map_type = 'basic';
    create_map_layer(window.map_type);

    window.area_type = a_type;
    window.area_latlong = [];
    window.map_area_move = false;
    window.map_area_click = true;
    setTimeout(() => {
        show_area_map(a_name, aid, tid, c_lat, c_long);
        window.map_area_click = false;
    }, 0);
    add_history('maps', { 'type' : a_type, 'id' : aid });
}

async function tree_area_init(area, aid, item_data) {
    if (window.green_tree_icon === undefined) create_icons();

    if (area === undefined) {
        area = window.area_type;
        aid = window.area_id;
    }
    window.area_type = area;
    window.area_id = aid;
    window.area_data = item_data;

    if (window.info_initialized === undefined) {
        window.tree_card_data = data;
        const lang_obj = await d3.json(LANGUAGE_URL);
        if (lang_obj !== null) {
            window.tree_lang_data = lang_obj;
            window.render_language = 'English';
            window.info_initialized = true;
            lang_name_init();
            create_icons();
            tree_area_init(undefined, undefined, window.area_data);
        };
        return;
    }

    const imap = window.id_map;
    let name = capitalize_word(area);
    let lat_long = window.default_latlong;
    if (window.area_latlong === undefined) window.area_latlong = [];
    if (window.area_latlong.length > 0) lat_long = window.area_latlong;

    let data = item_data['parks'];
    let area_list = data['parkinfo'];
    for (const [i, park_area] of area_list.entries()) {
        park_area['SN'] = i + 1;
        const park_list = park_area['parks'];
        for (const park of park_list) {
            if (aid !== '' && park['PID'] === aid) {
                if (area === 'parks') {
                    name = park['PN'];
                    lat_long = [ +park['PLAT'], +park['PLONG'] ];
                }
            }
        }
    }
    render_template_data('map-nav-template', 'PARK_BODY', data);
    render_template_data('stats-template', 'STATINFO', data);

    data = item_data['wards'];
    ward_list = data['wardinfo'];
    for (const [i, ward] of ward_list.entries()) {
        ward['SN'] = i + 1;
        if (aid !== '' && ward['AID'] === aid) {
            if (area === 'wards') {
                name = ward['AN'];
                lat_long = [ +ward['ALAT'], +ward['ALONG'] ];
            }
        }
    }
    render_template_data('map-nav-template', 'WARD_BODY', data);
    render_template_data('stats-template', 'STATINFO', data);

    data = item_data['maps'];
    tree_list = data['mapinfo'];
    for (const [i, an] of tree_list.entries()) {
        const an = tree_list[i];
        const tree_id = +an['AID'];
        an['AN'] = imap.lang_name_map[tree_id];
        an['SN'] = i + 1;
        if (tree_id === aid) {
            if (area === 'trees') {
                lat_long = [ +an['ALAT'], +an['ALONG'] ];
            }
        }
    }
    render_template_data('map-nav-template', 'TREE_BODY', data);

    await fetch_grid_data();
    if (window.all_quad_tree === null) return;
    window.map_initialized = false;

    let tid = (window.map_tree_id !== 0) ? window.map_tree_id : 0;
    if (area === 'trees') {
        const m_name = get_module_name(aid);
        if (aid !== 0) {
            tid = aid;
            name = m_name;
        } else if (tid !== 0) {
            aid = tid;
            name = m_name;
        } else if (aid === 0 || aid === '0') {
            const tree_list = Object.keys(imap.handle_map);
            const tree_index = d3.randomInt(0, tree_list.length)();
            aid = tree_list[tree_index];
            name = m_name;
        } else {
            name = params.getValue('name');
            name = name.replace(/%20/g, ' ');
        }
        if (tid === 0) tid = aid;
    }
    window.map_area_click = true;
    setTimeout(() => {
        show_area_map(name, aid, tid, lat_long[0], lat_long[1]);
        window.map_area_click = false;
    }, 0);
}

async function load_area_data(area_type, area_id, area_latlong) {
    window.map_type = 'basic';
    const lang = window.render_language;
    const area_info = { 'T' : get_lang_map_word('Tree'),
                        'H' : get_lang_map_word(capitalize_word(area_type)),
                        'LN' : get_lang_map_word('Locations'),
                        'LC' : window.stats_data['L'],
                        'R' : window.stats_data['R'],
                        'items' : [ { N: get_lang_map_word('Parks'), P: 'PARK', C: window.stats_data['P'] },
                                    { N: get_lang_map_word('Wards'), P: 'WARD', C: window.stats_data['W'] },
                                    { N: get_lang_map_word('Trees'), P: 'TREE', C: window.stats_data['M'] },
                                  ],
                        'types' : [ { N: 'Heatmap', P: 'heatmap', I: 'soundwave' },
                                    { N: 'Cluster', P: 'cluster', I: 'dpad' }, 
                                    { N: 'Removed', P: 'removed', I: 'x' },
                                  ]
                      };
    render_template_data('map-template', 'SECTION', area_info);
    if (area_latlong !== undefined) {
        area_latlong = area_latlong.split(',');
        if (area_latlong.length === 2) window.area_latlong = area_latlong;
    }
    const area_data = await fetch_area_data();
    if (area_data !== null) {
        tree_area_init(area_type, area_id, area_data);
        add_history('maps', { 'type' : area_type, 'id' : area_id });
    };
}

async function load_collection_data(type, letter, page_index, page_max) {
    const collection_data = {};
    render_template_data('page-template', 'SECTION', collection_data);
    const url = get_region_url('page');
    const item_data = await d3.json(url);
    if (item_data !== null) {
        tree_collection_init(type, letter, page_index, page_max, item_data);
        add_history('collections', { 'type' : type, 'letter' : letter, 'page' : page_index, 'max' : page_max });
    };
}

async function load_category_data(type) {
    const category_grid_data = {};
    render_template_data('grid-template', 'SECTION', category_grid_data);
    const url = get_region_url('grid');
    const item_data = await d3.json(url);
    if (item_data !== null) {
        tree_grid_init(type, item_data[type]);
        add_history('categories', { 'type' : type });
    };
}

async function load_simple_data() {
    const simple_data = {};
    render_template_data('simple-template', 'SECTION', simple_data);
    const url = get_region_url('simple');
    const item_data = await d3.json(url);
    if (item_data !== null) {
        tree_simple_init(item_data);
        add_history('alphabetical', { 'region' : window.tree_region });
    };
}

async function load_module_data(tree_id) {
    const imap = window.id_map;
    const m_base = get_module_base(imap.handle_map[tree_id]);
    const module_data = {};
    render_template_data('module-template', 'SECTION', module_data);
    const url = `${FLORA_BASE}/${m_base}.json`;
    const item_data = await d3.json(url);
    if (item_data !== null) {
        tree_module_init(item_data);
        add_history('trees', { 'id' : tree_id });
    };
}

function transliterator_word() {
    let source = d3.select('#SOURCE').property('value');
    source = source.replace(/\n/g, "<br />");
    const target = transliterate_search_text(source);
    d3.select('#TARGET').html(target);
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
            if (event.error === 'no-speech') {
                console.log('Speech Error: No Speech');
                window.speech_ignore_onend = true;
            }
            if (event.error === 'audio-capture') {
                console.log('Speech Error: Audio Capture');
              window.speech_ignore_onend = true;
            }
            if (event.error === 'not-allowed') {
                if (event.timeStamp - window.speech_start_timestamp < SPEECH_TIME) {
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
            const interim_transcript = '';
            /*
            const elen = event.results.length;
            for (let i = event.resultIndex; i < elen; ++i) {
                if (event.results[i].isFinal) {
                    window.speech_final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
                console.log('Speech Interim: ' + event.resultIndex + ' ' + elen + ' ' + event.results[i][0].transcript);
            }
            console.log('Speech Result: ' + event.resultIndex + ' ' + elen + ' ' + interim_transcript);
            */
            if (event.results.elen > 0) {
                window.speech_final_transcript = event.results[0][0].transcript;
            } else {
                window.speech_final_transcript = '';
            }
            if (window.speech_final_transcript || interim_transcript) {
                window.speech_recognition.stop();
                d3.select('#MIC_IMAGE').attr('src', 'icons/mic-mute.svg');
                d3.select('#SEARCH_WORD').property('value', window.speech_final_transcript);
                // console.log('Speech Final: ' + window.speech_final_transcript);
                load_search_data();
            }
        };
    }
}

function speech_start(event) {
    if (!('webkitSpeechRecognition' in window)) return;
    if (window.speech_recognizing) {
        window.speech_recognition.stop();
        return;
    }
    const lang = window.render_language;
    const s_lang = window.id_map.iso[lang];
    window.speech_final_transcript = '';
    window.speech_recognition.lang = s_lang;
    window.speech_recognition.start();
    window.speech_ignore_onend = false;
    window.speech_start_timestamp = event.timeStamp;
    d3.select('#MIC_IMAGE').attr('src', 'icons/mic.svg');
}

function load_keyboard(event) {
    set_input_keyboard(window.tree_lang_map_data['keyboard']);
    get_bs_modal('#LANG_KBD').show();
}

function handle_history_context(data) {
    const context = data['context'];
    if (context === 'introduction') {
        load_intro_data(data['region']);
    } else if (context === 'collections') {
        load_collection_data(data['type'], data['letter'], data['page'], data['max']);
    } else if (context === 'categories') {
        load_category_data(data['type']);
    } else if (context === 'alphabetical') {
        load_simple_data();
    } else if (context === 'trees') {
        load_module_data(data['id']);
    } else if (context === 'maps') {
        window.area_latlong = data['latlong'];
        // console.log('HISTORY POP: ', window.area_latlong);
        load_area_data(data['type'], data['id']);
    } else if (context === 'search') {
        load_search_history(data);
    }
}

function handle_popstate(e) {
    const data = e.state;
    if (data === null || data === undefined) return;
    // console.log('POP: ', e);
    window.tree_popstate = true;
    handle_history_context(data);
}

function add_history(context, data) {
    const url = 'trees.html';
    if (!window.tree_popstate) {
        data['context'] = context;
        let title = capitalize_word(context);
        if (context === 'introduction') {
            title += ' ' + capitalize_word(data['region']);
        } else if (context === 'collections') {
            title += ' ' + capitalize_word(data['type']) + ' ' + data['letter'];
        } else if (context === 'categories') {
            title += ' ' + capitalize_word(data['type']);
        } else if (context === 'alphabetical') {
            title += ' Alphabetical'
        } else if (context === 'trees') {
            title += ' ' + data['module'];
        } else if (context === 'maps') {
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

function get_lang_map(n_dict) {
    if (window.render_language === 'English') return;
    n_dict['T'] = get_lang_map_word(n_dict['T']);
    for (const i_dict of n_dict['items']) {
        i_dict['N'] = get_lang_map_word(i_dict['N']);
    }
}

function load_menu_data() {
    lang_name_init();
    const lang = window.render_language;
    const got_lang = window.GOT_LANGUAGE;
    const lang_dict = window.id_map.language;
    const lang_list = [];
    for (const l in lang_dict) {
        const d = (l === got_lang) ? { 'N' : l, 'O' : 'selected' } : { 'N' : l };
        lang_list.push(d);
    }
    let map_list = { 'T' : 'Maps', 'items' : [ { 'N' : 'Parks', 'A' : 'parks', 'I' : '' }
                                             ]
                   };
    let collection_list = { 'T' : 'Collections',
                            'items' : [ { 'N' : 'Name',   'A' : 'alphabetical', 'L' : 'A' },
                                        { 'N' : 'Family', 'A' : 'family',       'L' : 'A' },
                                        { 'N' : 'Genus',  'A' : 'genus',        'L' : 'A' }
                                      ]
                          };
    let category_list = { 'T' : 'Categories',
                          'items' : [ { 'N' : 'Flower Color',  'C' : 'Flower Color',  'A' : 'flowers' },
                                      { 'N' : 'Flower Season', 'C' : 'Flower Season', 'A' : 'season' },
                                      { 'N' : 'Fruit Color',   'C' : 'Fruit Color',   'A' : 'fruits' },
                                      { 'N' : 'Leaf Type',     'C' : 'Leaf Type',     'A' : 'leaves' },
                                      { 'N' : 'Bark Color',    'C' : 'Bark Color',    'A' : 'bark' }
                                    ]
                        };
    let region_list = { 'T' : 'Regions',
                          'items' : [ { 'N' : 'Bangalore', 'R' : 'bangalore' },
                                      { 'N' : 'India',     'R' : 'india' }
                                    ]
                        };
    get_lang_map(map_list);
    get_lang_map(collection_list);
    get_lang_map(category_list);
    get_lang_map(region_list);

    const home_tooltip = 'Home';
    const bright_tooltip = 'Brightness';
    const search_tooltip = 'Prefix Search <br/> e.g. purasam <br/>';
    const mic_tooltip = 'Only in Chrome';
    const kbd_tooltip = 'Language Keyboard';
    let menu_dict = { 'menus' : { 'TITLE' : get_lang_map_word('Trees'),
                                  'LANGUAGE' : window.GOT_LANGUAGE,
                                  'SEARCH' : get_lang_map_word('Search'),
                                  'ALPHABETICAL' : get_lang_map_word('Alphabetical'),
                                  'languages' : lang_list,
                                  'maps' : map_list,
                                  'collections' : collection_list,
                                  'categories' : category_list,
                                  'regions' : region_list,
                                  'HTP' : home_tooltip, 'BTP' : bright_tooltip,
                                  'STP' : search_tooltip, 'MTP' : mic_tooltip, 'KTP' : kbd_tooltip
                                }
                    };
    render_template_data('menu-template', 'MENU_DATA', menu_dict);

    const tooltipTriggerList = [].slice.call(d3.selectAll('[data-bs-toggle="tooltip"]').nodes())
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    init_search_listener();
    speech_to_text_init();

    if (window.history_data === null || window.history_data === undefined) {
        if (Object.keys(window.tree_lang_data).length !== 0) {
            load_intro_data(window.tree_region);
        }
    } else  {
        handle_history_context(window.history_data);
    }
}

async function load_content(values) {
    const [ lang_data, english_map_data, slider_data ] = values;
    if (lang_data === undefined) return;
    window.tree_lang_data = lang_data;
    window.tree_eng_map_data = english_map_data;
    const lang = window.render_language;
    const l_lang = lang.toLowerCase();
    window.tree_lang_map_data = await d3.json(`${l_lang}_map.json`);
    load_menu_data();
    const tree_id = window.url_params['tid'];
    if (tree_id === undefined) {
        load_intro_data(window.tree_region, slider_data);
    } else {
        load_module_data_with_id(+tree_id);
    }
    search_init();
}

function show_geo_location(position) {
    console.log("show_geo_location: ", position);
    window.default_latlong = [ position.coords.latitude, position.coords.longitude ];
}

function error_geo_location(error) {
    console.log("error_geo_location: ", error);
}

function get_geo_location() {
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(show_geo_location, error_geo_location, options);
    } else {
        console.log("Geolocation is not supported.");
    }
}

function tree_main_init() {
    window.render_language = 'English';
    window.GOT_LANGUAGE = 'English';
    window.COLOR_SCHEME = d3.select('html').attr('data-bs-theme');
    window.tree_region = 'bangalore';
    window.default_latlong = BANGALORE_CENTER;
    window.info_initialized = true;
    window.search_initialized = false;
    window.map_initialized = false;
    window.map_area_move = false;
    window.map_area_click = false;
    window.tree_popstate = false;
    window.map_type = 'basic';
    window.map_tree_id = 0;
    window.area_marker_offset = 0;
    window.area_marker_timer_list = [];
    window.area_marker_list = [];
    window.area_marker_dict = {};
    window.area_latlong = [];
    window.tree_image_list = [];
    window.tree_lang_data = {};
    window.tree_eng_map_data = {};
    window.tree_lang_map_data = {};
    window.tree_count_data = {};
    window.stats_data = {};
    window.map_osm_map = null;
    window.map_osm_layer = null;
    window.area_data = null;
    window.quad_tree = null;
    window.all_quad_tree = null;
    window.deleted_quad_tree = null;
    window.ward_boundary = null;
    window.history_data = null;
    window.geocoder_nominatim = null;

    window.paginator = new Paginator();
    window.id_map = {};

    window.url_params = get_url_params();
    window.addEventListener('popstate', handle_popstate);

    get_geo_location();

    const url_list = [ d3.json(LANGUAGE_URL), d3.json(`english_map.json`), d3.json(get_region_url('intro')) ];
    Promise.all(url_list).then((values) => { load_content(values); });

    transliterator_init();
}


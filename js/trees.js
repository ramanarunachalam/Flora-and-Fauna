const BANGALORE_LAT  = 12.97729;
const BANGALORE_LONG = 77.59973;
const BANGALORE_LAT_LONG = [ BANGALORE_LAT, BANGALORE_LONG ];
const BANGALORE_BBOX = '77.299805,12.762250,77.879333,13.170423';

const [ H_NAME, H_FAMILY, H_GENUS, H_SPECIES, H_AUTH, H_BLOOM, H_PART, H_GROW, H_LEAF ] = [...Array(9).keys()];
const SEARCH_MAP_DICT = { 'c' : 's', 'p' : 'b' };

const MAP_ICON_SIZE  = [24, 24];
const MAP_ANCHOR_POS = [12, 24];

const SEARCH_OPTIONS  = { prefix: true, boost: { title: 2 }, combineWith: 'AND', fuzzy: null };
const SEARCH_END_CHAR = '.';

const SEARCH_BASE_0 = 0;
const SEARCH_BASE_1 = 1000;
const SEARCH_BASE_2 = 4000;
const SEARCH_BASE_3 = 5000;
const MAX_RESULTS   = 25;

const SPEECH_TIME = 100; 
const MAX_PAGES   = 100;

const LANGUAGE_URL = 'language.json';
const SEARCH_URL   = 'flora_index.json';
const AREA_URL     = 'area.json';
const GRID_URL     = 'grid.json';

const OSM_TILE_URL     = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_BUILDING_URL = 'https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json';
const OSM_ATTR_URL     = 'https://www.openstreetmap.org/copyright';
const OSM_ATTRIBUTION  = `&copy; <a href="${OSM_ATTR_URL}">OpenStreetMap</a>`;

const TREE_MIN_COUNT = 200;
const TREE_MAX_COUNT = 750;

const TREE_ZOOM   = 12;
const MIN_ZOOM    = 16;
const NATIVE_ZOOM = 18;
const MAX_ZOOM    = 21;

const TILE_OPTIONS = { attribution: OSM_ATTRIBUTION,
                       subdomains: ['a', 'b', 'c'],
                       maxNativeZoom: NATIVE_ZOOM,
                       maxZoom: MAX_ZOOM
                     };

let current_page = 1;
let max_page = MAX_PAGES;


function capitalize_word(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function get_url_params() {
    const args = {};
    const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function(m, key, value) { args[key] = value; });
    return args;
}

function lang_name_init() {
    const lang = window.render_language;
    if (lang == 'English') return;
    const tree_lang_data = window.tree_lang_data;
    const english_name = tree_lang_data['English']['Name'];
    const lang_name = tree_lang_data[lang]['Name'];
    for (let i = 0; i < english_name.length; i++) {
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
    const ul_template = d3.select('#' + template_name).html();
    const template_html = Mustache.render(ul_template, data);
    d3.select('#' + id_name).html(template_html);
}

function set_key_map(d_obj, d_map, d_key) {
    const d = d_obj[d_key];
    if (d[0] == 1) {
        d_obj[d_key] = d_map[d[1]];
    } else {
        d_obj[d_key] = d[1];
    }
}

function set_key_value_map(d_obj, d_map, lang_map, d_key) {
    const d = d_obj[d_key];
    if (d[0] == 1) {
        const l_name = d_map[d[1]];
        const l_map = lang_map[l_name];
        d_obj[d_key] = l_map[d[2]];
    } else {
        d_obj[d_key] = d[2];
    }
}

function get_tree_handle(tree_id) {
    const lang_obj = window.tree_lang_data;
    const lang = window.render_language;
    const lang_map = lang_obj[lang];
    const key_name = lang_map['Name'];
    const handle_map = lang_obj['Handle'];
    const name = key_name[tree_id];
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
    const prefix = get_handle_prefix(tree_handle);
    return `${prefix} - ${part_name}.jpg`;
}

function get_handle_thumbnail_url(tree_handle, part_name) {
    const prefix = `${tree_handle[H_GENUS]} - ${tree_handle[H_NAME]}/Thumbnails/${tree_handle[H_NAME]}`;
    return `${prefix} - ${part_name}.thumbnail`;
}

function get_handle_thumbnail_image_id_url(tree_handle, english_key_image, image_id) {
    return (image_id == '') ? 'empty.thumbnail' : get_handle_thumbnail_url(tree_handle, english_key_image[image_id]);
}

function get_part_name(tree_handle) {
    const lang_obj = window.tree_lang_data;
    const english_lang_map = lang_obj['English'];
    const english_key_image = english_lang_map['Image'];
    const image_id = tree_handle[H_PART];
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

async function tree_module_init(file_name, data) {
    if (window.info_initialized == undefined) {
        window.tree_card_data = data;
        const url = `../../${LANGUAGE_URL}`;
        const lang_obj = await d3.json(url);
        if (lang_obj != null) {
            window.tree_lang_data = lang_obj;
            window.render_language = 'English';
            lang_name_init();
            window.info_initialized = true;
            tree_module_init('', window.tree_card_data);
        };
        return;
    }

    window.tree_card_data = data;
    window.tree_map_data = data['mapinfo'];
    window.tree_box_data = data['mapregion'];

    const lang_obj = window.tree_lang_data;
    const lang = window.render_language;
    const lang_map = lang_obj[lang];
    const handle_map = lang_obj['Handle'];
    const english_lang_map = lang_obj['English'];
    const english_key_info = english_lang_map['Key Name'];
    const key_group = lang_map['Key Group'];
    const key_part = lang_map['Key Part'];
    const key_image = lang_map['Image'];
    const english_key_image = english_lang_map['Image'];
    const key_name = lang_map['Name'];
    if (key_name === undefined) {
        key_name = english_lang_map['Name']; 
    }
    const card_data = window.tree_card_data;
    const gallery_info = card_data['galleryinfo']
    const tree_id = gallery_info['HID'];

    const tree_handle = handle_map[tree_id];
    gallery_info['HH'] = key_group[gallery_info['HH']];
    gallery_info['HN'] = key_name[gallery_info['HN']];
    const gallery_list = gallery_info['gallery'].split(',');
    const new_gallery_list = [];
    for (let i = 0; i < gallery_list.length; i++) {
        const image_id = gallery_list[i];
        const part_name = (image_id.length == 4) ? image_id : english_key_image[image_id];
        const caption = (image_id.length == 4) ? image_id : key_image[image_id];
        const image = get_handle_image_url(tree_handle, part_name);
        const new_item = { 'IC': caption, 'IN': image };
        new_gallery_list.push(new_item);
    }
    gallery_info['gallery'] = new_gallery_list;
    const info_list = card_data['cardinfo'];
    for (let i = 0; i < info_list.length; i++) {
        const cv_info = info_list[i];
        cv_info['CN'] = key_group[cv_info['CN']];
        const cv_list = cv_info['CV'];
        for (let j = 0; j < cv_list.length; j++) {
            const cv = cv_list[j];
            cv['N'] = key_part[cv['N']]; 
            set_key_value_map(cv, english_key_info, lang_map, 'V');
        } 
    }
    render_template_data('module-card-info-template', 'CARDINFO', card_data);
}

function tree_grid_init(type, data) {
    const lang_obj = window.tree_lang_data;
    const lang = window.render_language;
    const lang_map = lang_obj[lang];
    const key_name = lang_map['Name'];
    const english_lang_map = lang_obj['English'];
    const english_key_info = english_lang_map['Key Name'];
    const english_key_image = english_lang_map['Image'];
    const handle_map = lang_obj['Handle'];
    const card_list = data['cardinfo'];
    const MAX_COL = 6;
    for (let i = 0; i < card_list.length; i++) {
        set_key_value_map(card_list[i], english_key_info, lang_map, 'N');
        const card = card_list[i];
        const new_row_list = [];
        let new_col_list = [];
        const row_list = card['ROW'];
        for (let j = 0; j < row_list.length; j++) {
            const [ tree_id, image_id ] = row_list[j].split(',');
            const tree_handle = handle_map[tree_id];
            const href = get_handle_prefix(tree_handle);
            const new_caption = get_handle_thumbnail_image_id_url(tree_handle, english_key_image, image_id);
            new_item = { CI: tree_id, CN: key_name[tree_id], CH: href, CT: new_caption };
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
    return `Flora/trees_${window.tree_region}_${type}.json`;
}

function tree_intro_init(slider_data) {
    const lang = window.render_language;

    const stats_list = slider_data['statsinfo'];
    get_lang_map(lang, stats_list);

    const lang_obj = window.tree_lang_data;
    const lang_map = lang_obj[lang];
    const key_name = lang_map['Name'];
    const handle_map = lang_obj['Handle'];
    const slider_info = slider_data['sliderinfo'];
    const slider_list = slider_info['items'];
    const new_slider_list = [];
    for (let i = 0; i < slider_list.length; i++) {
        const [ tree_id, count ] = slider_list[i];
        window.tree_count_data[tree_id] = count;
        const tree_handle = handle_map[tree_id];
        const href = get_handle_prefix(tree_handle);
        const part_name = get_part_name(tree_handle);
        const item = { SD: tree_id, SC: count,
                       SB: `${tree_handle[H_GENUS]} ${tree_handle[H_SPECIES]}`, SA: tree_handle[H_AUTH], SH: href,
                       SN: key_name[tree_id], SI: get_handle_image_url(tree_handle, part_name)
                     }
        new_slider_list.push(item);
    }
    const start_id = Math.floor(Math.random() * new_slider_list.length);
    const start_items = new_slider_list.splice(0, start_id);
    const new_slide_items = new_slider_list.concat(start_items);

    slider_info['items'] = new_slide_items;
    render_template_data('intro-carousel-template', 'INTRO_SLIDER', slider_data);

    setTimeout(() => {
        const swiper = new Swiper('#INTRO_CAROUSEL', {
            direction: 'horizontal',
            preLoadImages: false,
            lazy: { loadPrevNext: true },
            effect: 'fade',
            fadeEffect: { crossFade: true },
            autoplay: { delay: 5000, disableOnInteraction: false }
        });
    }, 0);
}

async function load_intro_data(region) {
    window.tree_region = region;
    const lang = window.render_language;
    const lang_obj = window.tree_lang_data;
    const map_dict = lang_obj['Keys'];
    const c_region = capitalize_word(region);
    const intro_data = { 'N' : 'Tree', 'T' : 'Trees', 'P' : c_region,
                         'I' : 'Keys To Identify', 'R' : 'References', 'B' : 'Books',
                         'L' : 'Leaves', 'F' : 'Flowers', 'BA' : 'Bark', 'FR' : 'Fruits', 'FI' : 'Figs', 'PO' : 'Pods',
                         'SP' : 'Spines', 'TW' : 'Branch', 'A' : 'Aerial Root', 'G' : 'Gall'
                       };
    for (let k in intro_data) {
         intro_data[k] = get_lang_map_word(lang, map_dict, intro_data[k]);
    }
    render_template_data('intro-template', 'SECTION', intro_data);
    const url = get_region_url('intro');
    const slider_data = await d3.json(url);
    if (slider_data != null) {
        tree_intro_init(slider_data);
        add_history('introduction', { 'region' : region });
    };
}

function search_init() {
    window.flora_fauna_search_engine = new MiniSearch({
        fields: [ 'title', 'aka' ], // fields to index for full-text search
        storeFields: ['name', 'genus', 'species', 'href', 'category', 'pop', 'count'] // fields to return with search results
    });
    window.search_initialized = false;
    search_load();
}

function set_grid_page(n_current_page, n_max_page) {
    current_page = (n_current_page == '' || n_current_page == undefined) ? 1 : +n_current_page;
    d3.selectAll('li.page-item.active').classed('active', false);
    d3.select(`li#top_${current_page}`).classed('active', true);
    d3.select(`li#bottom_${current_page}`).classed('active', true);
    max_page = (n_max_page == '' || n_max_page == undefined) ? MAX_PAGES : +n_max_page;
}

function show_page(which, is_prev) {
    const path_list = window.location.pathname.split('/');
    let new_page = 1;
    if (is_prev) {
        new_page = 1;
        if (current_page > 1) {
            new_page = +current_page - 1;
        }
    } else {
        new_page = max_page;
        if (current_page < max_page) {
            new_page = +current_page + 1;
        }
    }
    current_page = new_page;
    const href = d3.select(`li#${which}_${new_page} a`).attr('href');
    window.open(href, '_self', false);
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
    const lang_obj = window.tree_lang_data;
    const lang = window.render_language;
    const lang_map = lang_obj[lang];
    const english_lang_map = lang_obj['English'];
    const english_key_image = english_lang_map['Image'];
    const handle_map = lang_obj['Handle'];
    const key_name = lang_map['Name'];
    const data = full_data[type];
    const image_data = full_data['Images'];
    const letter_data = data['LETTER'];
    const new_row_list = [];
    const row_list = letter_data[letter];
    const col_name = 'COL' + type[0].toUpperCase();
    for (let i = 0; i < row_list.length; i++) {
        const tree_id = row_list[i];
        const tree_handle = handle_map[tree_id];
        const new_image_list = [];
        const image_list = image_data[tree_id].split(',');
        for (let k = 0; k < image_list.length; k++) {
            const image_id = image_list[k];
            const href = get_handle_prefix(tree_handle);
            const caption = get_handle_thumbnail_image_id_url(tree_handle, english_key_image, image_id);
            const new_item = { CI: caption, CH: href };
            new_image_list.push(new_item);
        }
        const new_item = { COLIMAGE: new_image_list };
        const href = get_handle_prefix(tree_handle);
        new_item[col_name] = { CC: (i + 1), CI: tree_id, CN: key_name[tree_id], CF: tree_handle[H_FAMILY],
                               CB: `${tree_handle[H_GENUS]} ${tree_handle[H_SPECIES]}`, CA: tree_handle[H_AUTH], CH: href
                             }
        new_row_list.push(new_item);
    }
    const [ group, max_pages, links ] = data['PAGES'];
    const link_list = links.split(',')
    const new_link_list = [];
    for (let i = 0; i < link_list.length; i++) {
        const page = link_list[i];
        const page_id = i + 1;
        const item = { PL: page, PC: (i + 1), PH: `load_collection_data('${group}', '${page}', ${page_id}, ${max_pages})` };
        new_link_list.push(item);
    }
    const page_data = { N: 'Page', links: new_link_list };
    const new_data = { cardinfo: { N: letter, ROW: new_row_list }, pageinfo: page_data };

    new_data['pageinfo']['N'] = 'top';
    render_template_data('pagination-template', 'TOPPAGE', new_data);
    new_data['pageinfo']['N'] = 'bottom';
    render_template_data('pagination-template', 'BOTTOMPAGE', new_data);
    render_template_data('collection-card-info-template', 'CARDINFO', new_data);

    d3.select('#top-page-next').on('click', show_top_next_page);
    d3.select('#top-page-previous').on('click', show_top_prev_page);
    d3.select('#bottom-page-next').on('click', show_bottom_next_page);
    d3.select('#bottom-page-previous').on('click', show_bottom_prev_page);

    set_grid_page(page_index, max_page);
}

function get_bs_modal(id) {
    return new bootstrap.Modal(d3.select(id).node());
}

function show_bigger_image() {
    const [ image_src, caption ] = arguments;
    d3.select('#IMAGE_IN_MODAL').attr('src', image_src);
    d3.select('#IMAGE_MODEL_LABEL').html(caption);
    get_bs_modal('#IMAGE_MODAL').show();
}

const NORMALIZE_LIST = [ [ /(e)\1+/g, 'i' ], [ /(o)\1+/g, 'u' ], [ /(.)\1+/g, '$1' ],
                         [ /([bcdfgjklpst])h/g, '$1' ], [ /([sd])v/g, '$1w' ], [ /([ao])u/g, 'ow' ]
                       ];

function normalize_search_text(search_text) {
    search_text = search_text.toLowerCase();
    for (let i = 0; i < NORMALIZE_LIST.length; i++) {
        const expr = NORMALIZE_LIST[i];
        search_text = search_text.replace(expr[0], expr[1]);
    }
    return search_text;
}

async function search_load() {
    if (window.search_initialized) return;
    const search_engine = window.flora_fauna_search_engine;
    const search_obj = await d3.json(SEARCH_URL);
    if (search_obj != null) {
        let data_id = 0;
        for (let category in search_obj) {
            const data_list = search_obj[category];
            for (let i = 0; i < data_list.length; i++) {
                const item = data_list[i];
                const t_list = item.A.slice(0, 4);
                const a_list = item.A.slice(4);
                const pop = (item.P != undefined) ? item.P : -1;
                const count = (item.C != undefined) ? item.C : 0;
                const data_doc = { id: data_id, category: item.T, name: item.N, title: t_list, aka: a_list,
                                   href: item.H, pop: pop, count: count
                                 };
                search_engine.add(data_doc);
                data_id += 1;
            }
        }
    };
    window.search_initialized = true;
}

const REPLACE_LIST = [ [ /_/g, '' ], [ /G/g, 'n' ], [ /J/g, 'n' ] ];

function transliterator_init() {
    const lang_obj = window.tree_lang_data;
    const char_map = lang_obj['Charmap'];
    const key_list = new Set();
    for (let s in char_map) {
        key_list.add(s); 
    }
    window.char_map_key_list = key_list;
    window.char_map_max_length = d3.max(key_list, d => d.length);
}

function transliterate_text(word) {
    const lang_obj = window.tree_lang_data;
    const char_map = lang_obj['Charmap'];

    const tokenset = window.char_map_key_list;
    const maxlen = window.char_map_max_length;
    let current = 0;
    const tokenlist = [];
    word = word.toString();
    while (current < word.length) {
        const nextstr = word.slice(current, current+maxlen);
        let p = nextstr[0];
        let j = 1;
        let i = maxlen;
        while (i > 0) {
            let s = nextstr.slice(0, i);
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
    let new_word = tokenlist.join('');
    if (word != new_word) {
        for (let i = 0; i < REPLACE_LIST.length; i++) {
            const expr = REPLACE_LIST[i];
            new_word = new_word.replace(expr[0], expr[1]);
        }
    }
    return new_word;
}

function get_search_href(category, arg_list) {
    const func = (category == 'Trees') ? 'load_module_data' : 'load_area_data';
    const args = arg_list.join("', '");
    const href = `${func}('${args}')`;
    return href
}

function get_search_results(search_word, item_list, id_list, base_pop) {
    const lang_obj = window.tree_lang_data;
    const lang = window.render_language;
    const lang_map = lang_obj[lang];
    const key_name = lang_map['Name'];
    const map_dict = lang_obj['Keys'];
    const handle_map = lang_obj['Handle'];
    const park_map = lang_obj['Parks'];
    const ward_map = lang_obj['Wards'];
    const search_engine = window.flora_fauna_search_engine;
    const results = search_engine.search(search_word, SEARCH_OPTIONS);
    if (results.length <= 0) return;
    const max_score = results[0].score;
    const score_ratio = 400 / results[0].score;
    const pop_ratio = 0.6;
    const calculate_pop = search_word.length > 3;
    for (let i = 0; i < results.length; i++) {
        const item = results[i];
        if (id_list.has(item.id)) continue;
        // if (item.category == 'Maps' && item.count <= 0) continue;
        if (item.category == 'Maps') continue;
        const name_id = item.name;
        let name = '';
        let href = '';
        if (item.category == 'Trees') {
            href = [ name_id, get_handle_prefix(handle_map[name_id]) ];
            name = key_name[name_id];
        } else if (item.category == 'Maps') {
            name = key_name[name_id];
            href = [ 'trees', name_id, get_handle_prefix(handle_map[name_id]) ];
        } else if (item.category == 'Parks') {
            name = park_map[name_id];
            href = [ 'parks', name_id, name.replace("'", "") ];
        } else if (item.category == 'Wards') {
            name = ward_map[name_id];
            href = [ 'wards', name_id, name ];
        }
        const category = get_lang_map_word(lang, map_dict, item.category);
        href = get_search_href(item.category, href);
        const new_pop = (score_ratio * item.score) + (pop_ratio * item.pop);
        let pop = (calculate_pop) ? new_pop : item.pop;
        if (item.category == 'Maps') pop -= 1;
        pop = base_pop + pop;
        let r_item = { 'T' : category, 'N' : name, 'H' : href, 'P' : pop, 'SC' : item.score, 'C' : item.count, 'I' : name_id };
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

function get_tamil_phonetic_word(word) {
    const w_list = [];
    const new_word = word.toLowerCase();
    for (let i = 0; i < new_word.length; i++) {
        const c = new_word[i];
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
    if (search_word != s_search_word) {
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
        if (search_word != s_search_word) {
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
    if (c > 127) {
        search_word = transliterate_text(search_word);
    }
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
    if (window.geocoder_nominatim == null || window.geocoder_nominatim == undefined) {
        window.geocoder_nominatim = get_geocoder_nominatim();
    }
    window.geocoder_nominatim.geocode(search_word, handle_geocoder_search_results, search_word);
}

function handle_geocoder_search_results(results, context) {
    // console.log('handle_geocoder_search_results:', results, context);
    const search_items = [];
    for (let i = 0; i < results.length; i++) {
        const item = results[i];
        const name = item.name.split(',').slice(0, 3).join(',');
        const ll = item.center;
        const latlong = `${ll.lat},${ll.lng}`;
        const href = get_search_href('parks', [ 'parks', name.replace("'", ""), latlong ]);
        const new_item = { I: i, T: 'Geocoder', N: name, H: href, P: i, SC: i };
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
    if (search_len > 1 && search_word[search_len - 1] == SEARCH_END_CHAR) {
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

function get_zoom(osm_map, tid) {
    let zoom = (osm_map != null) ? osm_map.getZoom() : NATIVE_ZOOM;
    if (window.area_type == 'Trees') {
        const count = window.tree_count_data[tid];
        if (osm_map != null) {
            zoom = (!window.map_area_move && zoom <= TREE_ZOOM) ? TREE_ZOOM : zoom;
            zoom = (!window.map_area_move && count >= TREE_MAX_COUNT) ? MIN_ZOOM : zoom;
        } else {
            zoom = (count < TREE_MIN_COUNT) ? TREE_ZOOM : MIN_ZOOM;
        }
    }
    return zoom;
}

function create_osm_map(module, id_name, c_lat, c_long, tid) {
    const map_options  = { center: [ c_lat, c_long ],
                           rotate: true,
                           touchRotate: true,
                           zoom: get_zoom(null, tid),
                           minZoom: (window.area_type == 'trees') ? TREE_ZOOM : MIN_ZOOM,
                           maxZoom: MAX_ZOOM
                         };
    const osm_map = new L.map(id_name, map_options);
    osm_map.on('zoomend dragend', draw_map_on_move);

    const tile_layer = new L.tileLayer(OSM_TILE_URL, TILE_OPTIONS);
    tile_layer.addTo(osm_map);

    const geocoder = new L.Control.geocoder({ geocoder: get_geocoder_nominatim() });
    geocoder.addTo(osm_map);
    if (module == 'area') {
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

function get_url_info(tree_id, level) {
    const [ name, handle_map ] = get_tree_handle(tree_id);
    const tree_handle = handle_map[tree_id];
    const [ url, image_url ] = get_image_url(tree_handle, level);
    const m_url = `javascript:load_module_data('${tree_id}', '${url}');`;
    const a_url = `javascript:load_area_data('trees', '${tree_id}');`;
    const image_style = (level == 'popup') ? 'style="width: 240px; height: 180px;"' : '';
    const img_html = `<a href="${m_url}" align="center"><div class="thumbnail" align="center"><img ${image_style} src="${image_url}" class="shadow-box"></a>`;
    const name_html = `<a href="${a_url}"><p align="center"> ${name} </p></div></a>`;
    const html = img_html + name_html;
    return html;
}

function get_needed_icon(selected, blooming) {
    if (selected) {
        return (blooming) ? window.red_bloom_icon : window.red_tree_icon;
    } else if (blooming) return window.green_bloom_icon;
    return window.green_tree_icon;
}

function set_chosen_image(tree_id) {
    const tooltip_html = get_url_info(tree_id, 'tooltip');
    d3.select('#IMAGEINFO').html(tooltip_html);
}

function handle_context_menu(key) {
    bootstrap.Modal.getInstance(d3.select('#CONTEXT_MODAL').node()).hide();

    const marker = window.TREE_CONTEXT_MARKER;
    const tree_id = marker.tree_id;
    const pos = marker.getLatLng();
    if (key == 'info') {
        const m_url = get_module_url(tree_id);
        load_module_data(tree_id, m_url);
    } else if (key == 'tmap') {
        load_area_data('trees', tree_id);
    } else if (key == 'gmap') {
        const url = `https://maps.google.com/maps?z=12&t=m&q=loc:${pos.lat}+${pos.lng}`;
        window.open(url, '');
    }
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
    const tree_id = e.target.tree_id;
    window.map_tree_id = tree_id;
    const area_marker_list = window.area_marker_list;
    for (let i = 0; i < area_marker_list.length; i++) {
        const marker = area_marker_list[i];
        const icon = get_needed_icon((marker.tree_id == tree_id), marker.blooming);
        marker.setIcon(icon);
    }
    find_area_carousel_tree(tree_id);
}

function load_module_data_with_id(tree_id) {
    window.map_tree_id = tree_id;
    const m_url = get_module_url(tree_id);
    load_module_data(tree_id, m_url);
}

function marker_on_doubleclick(e) {
    const tree_id = e.target.tree_id;
    load_module_data_with_id(tree_id);
}

function marker_on_contextmenu(e) {
    const marker = this;
    window.TREE_CONTEXT_MARKER = marker;
    const [ name, handle_map ] = get_tree_handle(marker.tree_id);
    d3.select('#CONTEXT_MODEL_LABEL').html(name);
    get_bs_modal('#CONTEXT_MODAL').show();
}

function get_area_centre() {
    if (window.map_osm_map == undefined) {
        return [];
    }
    const latlong = window.map_osm_map.getCenter();
    const area_latlong = [ latlong.lat, latlong.lng ];
    return area_latlong;
}

function handle_geocoder_mark(ev) {
    draw_map_on_move(ev);
    add_history('maps', { 'type' : window.area_type, 'id' : window.parent.map_area_id });
}

async function fetch_area_data() {
    if (window.area_data == null) {
        window.area_data = await d3.json(AREA_URL);
    }
    return window.area_data;
}

function create_quad_tree(grid_flora) {
    const quad_tree = d3.quadtree();
    for (let i = 0; i < grid_flora.length; i++) {
        const [ g_sw_lat, g_sw_long, g_ne_lat, g_ne_long, md_name, flora_list ] = grid_flora[i];
        for (let j = 0; j < flora_list.length; j++) {
            let [ tree_id, latlong_list ] = flora_list[j];
            for (let k = 0; k < latlong_list.length; k++) {
                const latlong = latlong_list[k];
                quad_tree.add([+latlong[0], +latlong[1], +tree_id]);
            }
        }
    }
    // console.log(`Quad Tree Size: ${quad_tree.size()}`);
    return quad_tree;
}

function quad_tree_find(quad_tree, xmin, ymin, xmax, ymax, tree_id) {
    const results = [];
    quad_tree.visit((node, x1, y1, x2, y2) => {
        if (!node.length) {
            do {
                let d = node.data;
                if (tree_id > 0 && d[2] == tree_id) {
                    results.push(d);
                } else if (tree_id <= 0 && (d[0] >= xmin && d[0] < xmax && d[1] >= ymin && d[1] < ymax)) {
                    results.push(d);
                }
            } while (node = node.next);
        }
        return tree_id <= 0 && (x1 >= xmax || y1 >= ymax || x2 < xmin || y2 < ymin);
    });
    return results;
}

async function fetch_grid_data() {
    if (window.quad_tree == null) {
        const grid_data = await d3.json(GRID_URL);
        window.quad_tree = create_quad_tree(grid_data);
    }
}

function show_area_latlong_in_osm(a_name, aid, tid, c_lat, c_long) {
    const lang = window.render_language;
    const map_dict = window.tree_lang_data['Keys'];
    const area = window.area_type;
    const old_a_name = window.map_area_name;
    window.map_area_name = a_name;
    window.map_area_id = aid;
    if (tid == 0 && window.map_tree_id != undefined) {
        tid = window.map_tree_id;
    }
    window.map_tree_id = tid;

    let n_name = '';
    if (area == 'trees') {
        n_name = get_module_name(null, tid);
    } else {
        n_name = get_lang_map_word(lang, map_dict, capitalize_word(a_name));
        if (aid != '') {
            n_name = isFinite(aid) ? `${aid}. ${n_name}` : aid;
        }
    }
    d3.select('#TITLE_HEADER').html(n_name);

    let osm_map;
    if (window.map_initialized) {
        osm_map = window.map_osm_map;
        const area_marker_list = window.area_marker_list;
        for (let i = 0; i < area_marker_list.length; i++) {
            osm_map.removeLayer(area_marker_list[i]);
        }
        const zoom = get_zoom(osm_map, tid);
        osm_map.setView([c_lat, c_long], zoom);
    } else {
        osm_map = create_osm_map('area', 'MAPINFO', c_lat, c_long, tid);
        window.map_osm_map = osm_map;
        window.map_area_move = false;
        window.map_initialized = true;
    }
    if (tid != undefined && tid != 0) {
        set_chosen_image(tid);
    }
    if (area == 'trees') osm_map.options.minZoom = TREE_ZOOM;
    draw_area_latlong_in_osm(n_name, a_name, aid, tid, c_lat, c_long);
    window.area_latlong = [];
}

function draw_map_on_move(ev) {
    const osm_map = window.map_osm_map;
    const a_name = window.map_area_name;
    const aid = window.map_area_id;
    const tid = window.map_tree_id;
    const latlong = osm_map.getCenter();
    window.map_area_move = true;
    show_area_latlong_in_osm(a_name, aid, tid, latlong.lat, latlong.lng);
    window.map_area_move = false;
}

function load_area_latlong_in_osm(a_name, aid, tid, c_lat, c_long) {
    window.area_latlong = [];
    window.map_area_move = false;
    show_area_latlong_in_osm(a_name, aid, tid, c_lat, c_long);
    add_history('maps', { 'type' : window.area_type, 'id' : aid });
}

function find_area_carousel_tree(tree_id) {
    const tree_image_list = window.tree_image_list;
    for (let i = 0; i < tree_image_list.length; i++) {
        const l_tree_id = tree_image_list[i]['TID'];
        if (l_tree_id == tree_id) {
            const swiper = d3.select('#AREA_CAROUSEL').node().swiper;
            swiper.slideTo(i % tree_image_list.length);
            return i;
        }
    }
    return 0;
}

function area_chosen_tree(tree_id) {
    window.map_tree_id = tree_id;
    const area_marker_list = window.area_marker_list;
    for (let i = 0; i < area_marker_list.length; i++) {
        const marker = area_marker_list[i];
        const icon = get_needed_icon((marker.tree_id == tree_id), marker.blooming);
        marker.setIcon(icon);
    }
    set_chosen_image(tree_id);
}

function area_highlight_tree(tree_id) {
    const tree_image_list = window.tree_image_list;
    const tree_index = tree_id % tree_image_list.length;
    tree_id = tree_image_list[tree_index]['TID'];
    area_chosen_tree(tree_id);
}

function area_click_tree(tree_id) {
    const tree_index = find_area_carousel_tree(tree_id);
    area_chosen_tree(tree_id);
    window.scrollTo(0, 0);
}

function area_carousel_init(tree_image_list) {
    window.tree_image_list = tree_image_list;

    const swiper = new Swiper('#AREA_CAROUSEL', {
        direction: 'horizontal',
        centeredSlides: true,
        preLoadImages: true,
        slidesPerView: 3,
        spaceBetween: 5,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    let start_id = tree_image_list.length - 1;
    swiper.on('slideChange', function (ev) {
        area_highlight_tree(ev.activeIndex);
    });

    const tree_id = window.map_tree_id;
    start_id = find_area_carousel_tree(tree_id);
    area_highlight_tree(start_id);
}

function draw_area_latlong_in_osm(n_name, a_name, aid, tid, c_lat, c_long) {
    const osm_map = window.map_osm_map;
    const area = window.area_type;
    const lang_obj = window.tree_lang_data;
    const lang = window.render_language;
    const lang_map = lang_obj[lang];
    const key_name = lang_map['Name'];
    const handle_map = lang_obj['Handle'];

    const bounds = osm_map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const area_marker_list = [];
    const tree_dict = {};
    const is_tree = (area == 'trees');
    const c_tree_id = is_tree ? +aid : ((tid != 0) ? +tid : 0);
    const points = quad_tree_find(window.quad_tree, sw.lat, sw.lng, ne.lat, ne.lng, (area == 'trees') ? c_tree_id : 0);
    for (let i = 0; i < points.length; i++) {
        const [ m_lat, m_long, i_tree_id ] = points[i];
        tree_id = i_tree_id.toString();
        const tree_handle = handle_map[tree_id];
        const blooming = tree_handle[H_BLOOM];
        const icon = get_needed_icon((c_tree_id == i_tree_id), blooming);
        const marker = new L.marker([m_lat, m_long], {icon: icon});
        marker.tree_id = tree_id;
        marker.blooming = blooming;
        osm_map.addLayer(marker);
        marker.on('mouseover', marker_on_mouseover);
        marker.on('mouseout', marker_on_mouseout);
        marker.on('click', marker_on_click);
        marker.on('dblclick', marker_on_doubleclick);
        marker.on('contextmenu', marker_on_contextmenu);
        area_marker_list.push(marker);
        tree_dict[tree_id] = (tree_dict[tree_id] || 0) + 1;
    }
    window.area_marker_list = area_marker_list;
    if (is_tree && !window.map_area_move && 0 < area_marker_list.length && area_marker_list.length < TREE_MIN_COUNT) {
        const layer = new L.featureGroup(area_marker_list);
        osm_map.fitBounds(layer.getBounds());
    }

    const tree_stat_list = [];
    const tree_image_list = [];
    for (let tid in tree_dict) {
        if (!tree_dict.hasOwnProperty(tid)) continue;
        const t_name = key_name[tid];
        const tree_handle = handle_map[tid];
        const blooming = tree_handle[H_BLOOM];
        const icon = (blooming) ? 'icons/marker_bloom_green.png' : 'icons/marker_tree_green.png';
        tree_stat_list.push({ 'TN' : t_name, 'TC' : tree_dict[tid], 'TI' : icon, 'AID' : aid,
                              'TID' : tid, 'ALAT' : c_lat, 'ALONG' : c_long
                           })
        if (!is_tree) {
            const [ m_url, image_url ] = get_image_url(tree_handle, 'thumbnail');
            tree_image_list.push({ 'SN' : t_name, 'SI' : image_url, 'SH' : m_url, 'TID' : tid, 'SC' : tree_dict[tid] })
        }
    }
    if (tree_stat_list.length > 0) {
        tree_stat_list.sort(function (a, b) { return b.TC - a.TC; });
        let tin = 1;
        let tcount = 0;
        for (let i = 0; i < tree_stat_list.length; i++) {
            let info = tree_stat_list[i];
            info['TIN'] = tin;
            tin += 1;
            tcount += info['TC'];
        }
        if (!is_tree) {
            tin -= 1;
            let n_title = `${n_name} (<font color=brown>${tin} / ${tcount}</font>)`;
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
            area_carousel_init(tree_image_list);
        }
    }
    window.scrollTo(0, 0);
}

async function tree_area_init(area, aid, item_data) {
    if (window.green_tree_icon == undefined) {
        create_icons();
    }

    if (area == undefined) {
        area = window.area_type;
        aid = window.area_id;
    }
    window.area_type = area;
    window.area_id = aid;
    window.area_data = item_data;

    if (window.info_initialized == undefined) {
        window.tree_card_data = data;
        const lang_obj = await d3.json(LANGUAGE_URL);
        if (lang_obj != null) {
            window.tree_lang_data = lang_obj;
            window.render_language = 'English';
            window.info_initialized = true;
            lang_name_init();
            create_icons();
            tree_area_init(undefined, undefined, window.area_data);
        };
        return;
    }

    const lang_obj = window.tree_lang_data;
    const lang = window.render_language;
    const lang_map = lang_obj[lang];
    const key_name = lang_map['Name'];
    const handle_map = lang_obj['Handle'];

    let lat_long = BANGALORE_LAT_LONG;
    if (window.area_latlong == undefined) {
        window.area_latlong = [];
    }
    if (window.area_latlong.length > 0) {
        lat_long = window.area_latlong;
    }
    let name = capitalize_word(area);
    if (area == 'parks') {
        const data = item_data['parks'];
        const area_list = data['parkinfo'];
        for (let i = 0; i < area_list.length; i++) {
            const park_area = area_list[i];
            park_area['SN'] = i + 1;
            const park_list = park_area['parks'];
            for (let j = 0; j < park_list.length; j++) {
                const park = park_list[j];
                if (aid != '' && park['PID'] == aid) {
                    name = park['PN'];
                    lat_long = [ +park['PLAT'], +park['PLONG'] ];
                }
            }
        }
        render_template_data('sidenav-template', 'NAVINFO', data);
        render_template_data('stats-template', 'STATINFO', data);
    } else if (area == 'wards') {
        const data = item_data['wards'];
        const ward_list = data['wardinfo'];
        for (let i = 0; i < ward_list.length; i++) {
            const ward = ward_list[i];
            ward['SN'] = i + 1;
            if (aid != '' && ward['AID'] == aid) {
                name = ward['AN'];
                lat_long = [ +ward['ALAT'], +ward['ALONG'] ];
            }
        }
        render_template_data('sidenav-template', 'NAVINFO', data);
        render_template_data('stats-template', 'STATINFO', data);
    } else if (area == 'trees') {
        const data = item_data['maps'];
        const tree_list = data['mapinfo'];
        for (let i = 0; i < tree_list.length; i++) {
            const an = tree_list[i];
            const tree_id = +an['AID'];
            an['AN'] = key_name[tree_id];
            an['SN'] = i + 1;
            if (tree_id == aid) {
                lat_long = [ +an['ALAT'], +an['ALONG'] ];
            }
        }
        render_template_data('sidenav-template', 'NAVINFO', data);
    } else {
        return;
    }

    await fetch_grid_data();
    if (window.quad_tree == null) return;
    window.map_initialized = false;

    let tid = (window.map_tree_id != undefined) ? window.map_tree_id : 0;
    if (area == 'trees') {
        const m_name = get_module_name(handle_map, aid);
        if (aid != 0) {
            tid = aid;
            name = m_name;
        } else if (tid != 0) {
            aid = tid;
            name = m_name;
        } else if (aid == 0 || aid == '0') {
            const tree_list = Object.keys(handle_map);
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
}

async function load_area_data(area_type, area_id, area_latlong) {
    const lang = window.render_language;
    const map_dict = window.tree_lang_data['Keys'];
    const area_info = { 'T' : get_lang_map_word(lang, map_dict, 'Tree'),
                        'H' : get_lang_map_word(lang, map_dict, capitalize_word(area_type))
                      };
    render_template_data('area-template', 'SECTION', area_info);
    if (area_latlong != undefined) window.area_latlong = area_latlong.split(',');
    const area_data = await fetch_area_data();
    if (area_data != null) {
        tree_area_init(area_type, area_id, area_data);
        add_history('maps', { 'type' : area_type, 'id' : area_id });
    };
}

async function load_collection_data(type, letter, page_index, page_max) {
    const collection_data = {};
    render_template_data('page-template', 'SECTION', collection_data);
    const url = get_region_url('page');
    const item_data = await d3.json(url);
    if (item_data != null) {
        tree_collection_init(type, letter, page_index, page_max, item_data);
        add_history('collections', { 'type' : type, 'letter' : letter, 'page' : page_index, 'max' : page_max });
    };
}

async function load_category_data(type) {
    const category_grid_data = {};
    render_template_data('grid-template', 'SECTION', category_grid_data);
    const url = get_region_url('grid');
    const item_data = await d3.json(url);
    if (item_data != null) {
        tree_grid_init(type, item_data[type]);
        add_history('categories', { 'type' : type });
    };
}

async function load_simple_data() {
    const simple_data = {};
    render_template_data('simple-template', 'SECTION', simple_data);
    const url = get_region_url('simple');
    const item_data = await d3.json(url);
    if (item_data != null) {
        tree_simple_init(item_data);
        add_history('alphabetical', { 'region' : window.tree_region });
    };
}

async function load_module_data(tree_id, file_name) {
    const module_data = {};
    render_template_data('module-template', 'SECTION', module_data);
    const url = `Flora/${file_name}.json`;
    const item_data = await d3.json(url);
    if (item_data != null) {
        tree_module_init(file_name, item_data);
        add_history('trees', { 'module' : file_name, 'id' : tree_id });
    };
}

function transliterator_word() {
    let source = d3.select('#SOURCE').property('value');
    source = source.replace(/\n/g, "<br />");
    const target = transliterate_text(source);
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
            if (event.error == 'no-speech') {
                console.log('Speech Error: No Speech');
                window.speech_ignore_onend = true;
            }
            if (event.error == 'audio-capture') {
                console.log('Speech Error: Audio Capture');
              window.speech_ignore_onend = true;
            }
            if (event.error == 'not-allowed') {
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
            for (let i = event.resultIndex; i < event.results.length; ++i) {
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
                d3.select('#MIC_IMAGE').attr('src', 'icons/mic-mute.svg');
                d3.select('#SEARCH_WORD').property('value', window.speech_final_transcript);
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
    const lang = window.render_language;
    const s_lang = MAP_ISO_DICT[lang];
    window.speech_final_transcript = '';
    window.speech_recognition.lang = s_lang;
    window.speech_recognition.start();
    window.speech_ignore_onend = false;
    window.speech_start_timestamp = event.timeStamp;
    d3.select('#MIC_IMAGE').attr('src', 'icons/mic.svg');
}

function load_keyboard(event) {
    const lang = window.render_language;
    set_input_keyboard(lang.toLowerCase());
    get_bs_modal('#LANG_KBD').show();
    return;
}

function handle_history_context(data) {
    const context = data['context'];
    if (context == 'introduction') {
        load_intro_data(data['region']);
    } else if (context == 'collections') {
        load_collection_data(data['type'], data['letter'], data['page'], data['max']);
    } else if (context == 'categories') {
        load_category_data(data['type']);
    } else if (context == 'alphabetical') {
        load_simple_data();
    } else if (context == 'trees') {
        load_module_data(data['id'], data['module']);
    } else if (context == 'maps') {
        window.area_latlong = data['latlong'];
        // console.log('HISTORY POP: ', window.area_latlong);
        load_area_data(data['type'], data['id']);
    } else if (context == 'search') {
      load_search_history(data);
    }
}

function handle_popstate(e) {
    const data = e.state;
    if (data == null || data == undefined) return;
    // console.log('POP: ', e);
    window.tree_popstate = true;
    handle_history_context(data);
}

function add_history(context, data) {
    const url = 'trees.html';
    if (!window.tree_popstate) {
        data['context'] = context;
        let title = capitalize_word(context);
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
   let t = map_dict[n];
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
    const map_dict = window.tree_lang_data['Keys'];
    n_dict['T'] = get_lang_map_word(lang, map_dict, n_dict['T']);
    const i_list = n_dict['items'];
    for (let i = 0; i < i_list.length; i++) {
        const i_dict = i_list[i];
        i_dict['N'] = get_lang_map_word(lang, map_dict, i_dict['N']);
    }
}

function load_menu_data() {
    const lang = window.render_language;
    const map_dict = window.tree_lang_data['Keys'];
    const LANG_LIST = [];
    for (let l in MAP_LANG_DICT) {
        LANG_LIST.push(MAP_LANG_DICT[l]);
    }
    const lang_list = [];
    for (let i = 0; i < LANG_LIST.length; i++) {
        const l = LANG_LIST[i];
        let t = get_lang_map_word(lang, map_dict, l);
        t = REVERSE_LANG_DICT[l];
        let d = (l == lang) ? { 'N' : t, 'O' : 'selected' } : { 'N' : t };
        lang_list.push(d);
    }
    let map_list = { 'T' : 'Maps', 'items' : [ { 'N' : 'Parks', 'A' : 'parks', 'I' : '' },
                                               { 'N' : 'Wards', 'A' : 'wards', 'I' : '' },
                                               { 'N' : 'Trees', 'A' : 'trees', 'I' : 0 }
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
    // get_lang_map(lang, lang_list);
    get_lang_map(lang, map_list);
    get_lang_map(lang, collection_list);
    get_lang_map(lang, category_list);
    get_lang_map(lang, region_list);
    let menu_dict = { 'menus' : { 'TITLE' : get_lang_map_word(lang, map_dict, 'Trees'),
                                  'SEARCH' : get_lang_map_word(lang, map_dict, 'Search'),
                                  'ALPHABETICAL' : get_lang_map_word(lang, map_dict, 'Alphabetical'),
                                  'languages' : lang_list,
                                  'maps' : map_list,
                                  'collections' : collection_list,
                                  'categories' : category_list,
                                  'regions' : region_list
                                }
                    };
    render_template_data('menu-template', 'MENU_DATA', menu_dict);

    const tooltipTriggerList = [].slice.call(d3.selectAll('[data-bs-toggle="tooltip"]').nodes())
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    init_search_listener();
    speech_to_text_init();

    if (window.history_data == null || window.history_data == undefined) {
        if (Object.keys(window.tree_lang_data).length != 0) {
            load_intro_data(window.tree_region);
        }
    } else  {
        handle_history_context(window.history_data);
    }
}

async function load_content() {
    const lang_obj = await d3.json(LANGUAGE_URL);
    if (lang_obj != null) {
        window.tree_lang_data = lang_obj;
        lang_name_init();
        transliterator_init();
        const tree_id = window.url_params['tid'];
        if (tree_id == undefined) {
            load_intro_data(window.tree_region);
        } else {
            load_module_data_with_id(tree_id);
        }
    };
    search_init();
}

function tree_main_init() {
    window.render_language = 'English';
    window.tree_region = 'bangalore';
    window.info_initialized = true;
    window.search_initialized = false;
    window.map_initialized = false;
    window.tree_popstate = false;
    window.area_marker_list = [];
    window.area_popup_list = [];
    window.area_tooltip_list = [];
    window.area_latlong = [];
    window.tree_image_list = [];
    window.tree_lang_data = {};
    window.tree_count_data = {};
    window.area_data = null;
    window.quad_tree = null;
    window.history_data = null;
    window.geocoder_nominatim = null;

    window.url_params = get_url_params();
    window.addEventListener('popstate', handle_popstate);
    window.onload = load_content;

    init_input_keyboard();
    load_menu_data();
}


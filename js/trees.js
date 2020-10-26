
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

function tree_module_init(data) {
    render_template_data('#card-info-template', '#CARDINFO', data);
}

function tree_part_init(data) {
    render_template_data('#card-info-template', '#CARDINFO', data);
}

function tree_simple_init(data) {
    render_template_data('#card-info-template', '#CARDINFO', data);
}

var start_tree = 0;

function tree_intro_init(data) {
    render_template_data('#carousel-template', '#SLIDERINFO', data);

    start_tree = Math.floor((Math.random() * $('.carousel-item').length));
    var $img = $('.carousel-item').eq(start_tree);
    $img.attr('src', $img.attr('data_src'));
    $next = $('img', this).next();
    $next.attr('src', $next.attr('data_src'));

    window.parent.search_initialized = false;
    search_init();

    window.onload = tree_info_init;
}

function tree_info_init() {
    /*
    $('.carousel-item').eq(Math.floor((Math.random() * $('.carousel-item').length))).addClass("active");
    var $img = $('.active img', this);
    $img.attr('src', $img.attr('data_src'));
    */
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
          interval: 5000
    });
}

function search_init() {
    window.parent.flora_fauna_search_engine = new MiniSearch({
        fields: [ 'aka' ], // fields to index for full-text search
        storeFields: ['name', 'href', 'category', 'pop'] // fields to return with search results
    });
    window.parent.search_initialized = false;
    search_load();
}

var current_page = 1;
var max_page = 100;

function PageQuery(q) {
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

function set_grid_page() {
    var page = new PageQuery(window.location.search);
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
                var data_doc = { "id" : data_id, "name" : data_item.N, 'aka' : data_item.A, "family" : data_item.F, "genus" : data_item.G, "species" : data_item.S, "href" : data_item.H, "category" : data_item.T, "pop" : 0 };
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
                var name = result_item.name;
                var href = result_item.href;
                var category = result_item.category
                var pop = 0;
                var item = { 'T' : category, 'H' : href, 'N' : name, 'P' : pop };
                item_list.push(item);
                id_list.add(result_item.id);
            }
        });
    }
}

function tree_search_init() {
    var query = window.location.search;
    var word_list = query.split('=');
    var search_word = word_list[1];
    search_word = search_word.replace(/\+/g, ' ');
    const s_search_word = search_word.replace(/\s/g, '');
    var item_list = [];
    var id_list = new Set();
    var search_options = { prefix: true, combineWith: 'AND', fuzzy: term => term.length > 3 ? 0.1 : null };
    get_search_results(search_word, search_options, item_list, id_list);
    if (search_word != s_search_word) {
        get_search_results(s_search_word, search_options, item_list, id_list);
    }
    if (search_word.length > 2) {
        var search_options = { prefix: true, combineWith: 'AND', fuzzy: term => term.length > 3 ? 0.3 : null };
        get_search_results(search_word, search_options, item_list, id_list);
        if (search_word != s_search_word) {
            get_search_results(s_search_word, search_options, item_list, id_list);
        }
    }
    item_list.sort(function (a, b) { return b.P - a.P; });
    var new_item_list = item_list.slice(0, 25);
    var item_data = { "searchinfo" : { "results" : new_item_list } };

    render_template_data('#search-template', '#CARDINFO', item_data);
}



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

    var template_name = '#search-template';
    var ul_template = $(template_name).html();
    var template_html = Mustache.to_html(ul_template, item_data);
    $('#CARDINFO').html(template_html);

}


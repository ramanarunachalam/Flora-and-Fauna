$(document).ready(function()
{
    $('.carousel-item').eq(Math.floor((Math.random() * $('.carousel-item').length))).addClass("active");
    var $img = $('.active img', this)
    $img.attr('src', $img.attr('data_src'))

    $('.carousel').on('slide.bs.carousel', function(){
        var $img = $('.active img', this)
        $img.attr('src', $img.attr('data_src'))

        var $next = $('.active', this).next()
        if ($next != undefined) {
            $next = $('img', $next)
            $next.attr('src', $next.attr('data_src'))
        }
    });

    $('.carousel').carousel({
          pause: "hover",
          interval: 5000
    });

    window.parent.search_initialized = false;
    search_init();
});


function search_init() {
    window.parent.flora_fauna_search_engine = new MiniSearch({
        fields: [ 'aka' ], // fields to index for full-text search
        storeFields: ['name', 'href', 'category', 'pop'] // fields to return with search results
    });
    window.parent.search_initialized = false;
    search_load();
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

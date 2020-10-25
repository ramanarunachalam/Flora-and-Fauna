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

function showPage(is_prev)
{
    var path_list = window.location.pathname.split('/');
    var href = path_list[path_list.length - 1];

    var new_page = 1;
    if (is_prev == 1) {
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
    var c_str = current_page.toString();
    if (current_page < 10)
        c_str = '0' + c_str 
    var n_str = new_page.toString();
    if (new_page < 10)
        n_str = '0' + n_str 
    var n_href = href.replace(c_str, n_str);
    var new_href = n_href + '?page=' + new_page.toString() + '&max=' + max_page.toString()
    window.open(new_href,'_self',false);
}

function showPreviousPage()
{
    showPage(1);
}

function showNextPage()
{
    showPage(0);
}

$(document).ready(function(){
    $("#top-page-next").click(showNextPage);
    $("#top-page-previous").click(showPreviousPage);
    $("#bottom-page-next").click(showNextPage);
    $("#bottom-page-previous").click(showPreviousPage);

    /*
    var c_str = current_page.toString();
    if (current_page < 10)
        c_str = '0' + c_str;
    var page_id = '#PAGEID' + c_str;
    $(page_id).dataTable();
    */
});

function tree_grid_init(data) {
    var template_name = '#pagination-template';
    var ul_template = $(template_name).html();
    var template_html = Mustache.to_html(ul_template, data);
    $('#TOPPAGE').html(template_html);
    $('#BOTTOMPAGE').html(template_html);

    var template_name = '#card-info-template';
    var ul_template = $(template_name).html();
    var template_html = Mustache.to_html(ul_template, data);
    $('#CARDINFO').html(template_html);
}

function load_page() {
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

window.onload = load_page;


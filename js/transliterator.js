function transliterate_text(word) {
    var lang_obj = window.parent.TREE_LANG_DATA;
    var char_map = lang_obj['Charmap'];

    var tokenset = window.parent.CHAR_MAP_KEY_LIST;
    var maxlen = window.parent.CHAR_MAP_MAX_LENGTH;
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

function transliterator_word() {
    var source = $('#SOURCE').val();
    source = source.replace(/\n/g, "<br />");
    var target = transliterate_text(source);
    $('#TARGET').html(target);
}

function transliterator_map_init() {
    var lang_obj = window.parent.TREE_LANG_DATA;
    var char_map = lang_obj['Charmap'];
    var key_list = [];
    var max_len = 0;
    for (var s in char_map) {
        key_list.push(s); 
        max_len = Math.max(max_len, s.length);
    }
    window.parent.CHAR_MAP_MAX_LENGTH = max_len;
    window.parent.CHAR_MAP_KEY_LIST = new Set(key_list);
}

function transliterator_init() {
    var url = 'language.json';
    $.getJSON(url, function(lang_obj) {
        window.parent.TREE_LANG_DATA = lang_obj;
        transliterator_map_init();
    });

    var input = document.getElementById('SOURCE');
    input.addEventListener("keyup", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            transliterator_word();
        }
    });
}

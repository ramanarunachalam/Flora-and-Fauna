var REVERSE_LANG_DICT = {}
for (var k in MAP_LANG_DICT) {
    REVERSE_LANG_DICT[MAP_LANG_DICT[k]] = k;
}
let superscript_code_list = new Set(SUPERSCRIPT_CODES.map(i => String.fromCharCode(i)));


/*
     Language Keyboards
*/

const ROW_SIZE = 9;

function render_keys(lang_dict) {
    var row_list = [];
    var row = [];
    var col_id = 1;
    var info_list = [];
    var j = 0;
    var key_list = [ 'vowel', 'middle' ];
    for (var k = 0; k < key_list.length; k++) {
        var key = key_list[k];
        basic_list = lang_dict[key];
        for (var i = 0; i < basic_list.length; i++) {
            if (j > 0 && (j % ROW_SIZE) == 0) {
                row_list.push({ 'col' : row });
                row = []
            }
            var c = basic_list[i];
            c = c != '.' ? c : ' ';
            var info = { 'N' : c, 'K' : c, 'T' : 'key', 'I' : col_id };
            row.push(info);
            info_list.push(info);
            col_id += 1;
            j += 1;
        }
    }
    var punctuation_list = lang_dict['special'].concat([ ' ', ':' ]);
    for (var i = 0; i < punctuation_list.length; i++) {
        var c = punctuation_list[i];
        var info = { 'N' : c, 'K' : c, 'T' : 'key', 'I' : col_id };
        if (j > 0 && (j % ROW_SIZE) == 0) {
            row_list.push({ 'col' : row });
            row = []
        }
        row.push(info);
        info_list.push(info);
        col_id += 1;
        j += 1;
    }
    var icon_list = [ 'chevron-expand', 'backspace', 'arrow-return-left' ];
    var key_name_list = [ 'vowel reset', 'backspace', 'enter' ];
    for (var i = 0; i < icon_list.length; i++) {
        var icon = icon_list[i];
        var img_str = `<img class="ICON" src="icons/${icon}.svg" onclick="on_key_click()">`;
        var info = { 'N' : img_str, 'A' : key_name_list[i], 'K' : icon, 'T' : 'icon', 'I' : col_id };
        row.push(info);
        info_list.push(info);
        col_id += 1;
        j += 1;
    }
    var col_span = ((col_id - 1) % ROW_SIZE) + 1;
    if (col_span > 1) {
        row[row.length - 1]['C'] = `colspan="${col_span}"`;
    }
    row_list.push({ 'col' : row });
    row = []
    j = 0;
    var key_list = [ 'consonant' ];
    for (var k = 0; k < key_list.length; k++) {
        var key = key_list[k];
        basic_list = lang_dict[key];
        for (var i = 0; i < basic_list.length; i++) {
            if (j > 0 && (j % ROW_SIZE) == 0) {
                row_list.push({ 'col' : row });
                row = []
            }
            var c = basic_list[i];
            c = c != '.' ? c : ' ';
            var info = { 'N' : c, 'K' : c, 'T' : 'key', 'I' : col_id };
            row.push(info);
            info_list.push(info);
            col_id += 1;
            j += 1;
        }
    }
    row_list.push({ 'col' : row });
    var key_dict = { 'row' : row_list };
    return [info_list, key_dict];
}

function replace_keys(key_dict, vowel_size, key) {
    var combo_list = window.script_combo_list;
    for (var i = 0; i < vowel_size; i++) {
        var c_key = combo_list[i];
        var c = (key == '' || c_key == 0) ? key_dict[i]['N'] : key + c_key;
        var col_id = '#key_' + (i + 1);
        $(col_id).html(c);
    }
}

function on_key_click() {
   var lang_dict = window.script_lang_dict;
   var text = $('#SEARCH_WORD').val();
   var element = event.srcElement;
   if (element.tagName == 'IMG') {
       event.stopPropagation();
       element = element.parentElement;
   }
   var id = element.getAttribute('id');
   var nid = parseInt(id.replace(/key_/, ''));
   var c = element.innerHTML;
   var s = c[0];
   var f = c.charCodeAt(0);
   var r_key;
   // console.log(`c ${c} f ${f} id ${id} nid ${nid}`);
   if (id == lang_dict['vowel reset']) {
       r_key = '';
   } else if (id == lang_dict['backspace']) {
       if (text.length > 0) {
           text = text.slice(0, text.length - 1);
       }
   } else if (id == lang_dict['enter']) {
       load_search_data();
   } else if (lang_dict['consonant'].includes(s) || lang_dict['middle'].includes(s)) {
       var pos = c.length - 1;
       var r_key = c;
       var l = text[text.length - pos];
       if (l != undefined && l.charCodeAt(0) == f) {
           var p = text.length - 1;
           if (superscript_code_list.has(text[p])) {
               text = text.slice(0, p) + c[pos - 1] + c[pos];
           } else {
               text += c[pos];
           }
           r_key = '';
       } else {
           if (nid <= lang_dict['vowels'] || c.length > 3) {
               r_key = '';
           }
           text += c;
       }
   } else {
       text += c;
   }
   if (r_key != undefined) {
       replace_keys(window.input_key_dict, window.script_vowel_size, r_key);
   }
   $('#SEARCH_WORD').val(text);
   load_search_data();
};

function set_input_keyboard(lang) {
    var lang_dict = MAP_KEYBOARD_DICT[lang];
    window.script_lang_dict = lang_dict;
    window.script_combo_list = lang_dict['glyph'];
    window.script_vowel_size = lang_dict['glyph'].length;
    const [info_list, key_dict] = render_keys(lang_dict);
    for (var i = 0; i < info_list.length; i++) {
        var info_dict = info_list[i];
        var key_name = info_dict['A'];
        if (key_name != undefined) {
            lang_dict[key_name] = 'key_' + info_dict['I'];
        }
    } 
    window.input_key_dict = info_list;
    render_template_data('#lang-key-template', '#GENKBD', key_dict);
}

function init_input_keyboard(lang) {
    for (var lang in MAP_KEYBOARD_DICT) {
        var info_dict = MAP_KEYBOARD_DICT[lang];
        var base = parseInt(info_dict['base'], 16);
        info_dict['base'] = base;
    }
}


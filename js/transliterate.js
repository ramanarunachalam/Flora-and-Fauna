const MAP_LANG_DICT = { 'English' : 'English', 'தமிழ்' : 'Tamil', 'తెలుగు' : 'Telugu', 'ಕನ್ನಡ' : 'Kannada', 'മലയാളം' : 'Malayalam', 'हिन्दी' : 'Hindi', 'বাংলা' : 'Bengali', 'ગુજરાતી' : 'Gujarati', 'मराठी' : 'Marathi', 'ਪੰਜਾਬੀ' : 'Punjabi' };
var REVERSE_LANG_DICT = {}
for (var k in MAP_LANG_DICT) {
    REVERSE_LANG_DICT[MAP_LANG_DICT[k]] = k;
}
const MAP_ISO_DICT = { 'English' : 'en-IN', 'Tamil' : 'ta-IN', 'Telugu' : 'te-IN', 'Kannada' : 'kn-IN', 'Malayalam' : 'ml-IN', 'Hindi' : 'hi-IN', 'Bengali' : 'bn-IN', 'Marathi' : 'mr-IN', 'Gujarati' : 'gu-IN', 'Punjabi' : 'pa-IN' };

/*
     Language Keyboards
*/

const ROW_SIZE = 9;

function render_keys(lang_dict) {
    var basic_list = lang_dict['basic'];
    var combo_list = lang_dict['combo'];
    var row_list = [];
    var row = [];
    var col_id = 1;
    var info_list = [];
    for (var i = 0; i < basic_list.length; i++) {
        if (i > 0 && (i % ROW_SIZE) == 0) {
            row_list.push({ 'col' : row });
            row = []
        }
        var c = basic_list[i];
        c = c != '.' ? c : ' ';
        var info = { 'N' : c, 'K' : c, 'T' : 'key', 'I' : col_id };
        row.push(info);
        info_list.push(info);
        col_id += 1;
    }
    var punctuation_list = [ ':', ' ' ];
    for (var i = 0; i < punctuation_list.length; i++) {
        var c = punctuation_list[i];
        var info = { 'N' : c, 'K' : c, 'T' : 'key', 'I' : col_id };
        row.push(info);
        info_list.push(info);
        col_id += 1;
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
    }
    var col_span = ((col_id - 1) % ROW_SIZE) + 1;
    if (col_span > 1) {
        row[row.length - 1]['C'] = `colspan="${col_span}"`;
    }
    row_list.push({ 'col' : row });
    var key_dict = { 'row' : row_list };
    return [info_list, key_dict];
}

function replace_keys(key_dict, vowel_size, key) {
    var combo_list = window.parent.script_combo_list;
    for (var i = 0; i < vowel_size; i++) {
        var c_key = combo_list[i];
        var c = (key == '' || c_key == 0) ? key_dict[i]['N'] : key + c_key;
        var col_id = '#key_' + (i + 1);
        $(col_id).html(c);
    }
}

function on_key_click() {
   var lang_dict = window.parent.script_lang_dict;
   var text = $('#SEARCH_WORD').val();
   var element = event.srcElement;
   if (element.tagName == 'IMG') {
       event.stopPropagation();
       element = element.parentElement;
   }
   var id = element.getAttribute('id');
   var nid = parseInt(id.replace(/key_/, ''));
   var c = element.innerHTML;
   var f = c.charCodeAt(0);
   var r_key;
   if (id == lang_dict['vowel reset']) {
       r_key = '';
   } else if (id == lang_dict['backspace']) {
       if (text.length > 0) {
           text = text.slice(0, text.length - 1);
       }
   } else if (id == lang_dict['enter']) {
       load_search_data();
   } else if (window.parent.script_consonant_start <= f && f <= window.parent.script_consonant_end) {
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
       replace_keys(window.parent.input_key_dict, window.parent.script_vowel_size, r_key);
   }
   $('#SEARCH_WORD').val(text);
};

function sanskrit_to_indic(base) {
    let basic_list = []
    for (var i = 0; i < sanskrit_basic_list.length; i++) {
        var c = sanskrit_basic_list[i];
        if (c != '.') {
            var k = sanskrit_basic_list[i].charCodeAt(0);
            var l = k + (base - 0x0900);
            c = String.fromCharCode(l);
        }
        basic_list.push(c);
    }
    let combo_code_list = [];
    for (var i = 0; i < sanskrit_basic_list.length; i++) {
        var c = sanskrit_combo_code_list[i] + (base - 0x0900);
        combo_code_list.push(c);
    }
    let combo_list = combo_code_list.map(i => String.fromCharCode(i));
    return [ basic_list, combo_list ];
}

function set_input_keyboard(lang) {
    var lang_dict = lang_key_dict[lang];
    window.parent.script_lang_dict = lang_dict;
    window.parent.script_combo_list = lang_dict['combo'];
    window.parent.script_vowel_size = lang_dict['vowels'];
    var script_consonant_base = (lang_dict['base'] != 0) ? (lang_dict['base'] + 0x0015) : 0;
    window.parent.script_consonant_start = script_consonant_base;
    window.parent.script_consonant_end = script_consonant_base + 36;
    const [info_list, key_dict] = render_keys(lang_dict);
    for (var i = 0; i < info_list.length; i++) {
        var info_dict = info_list[i];
        var key_name = info_dict['A'];
        if (key_name != undefined) {
            lang_dict[key_name] = 'key_' + info_dict['I'];
        }
    } 
    window.parent.input_key_dict = info_list;
    render_template_data('#lang-key-template', '#GENKBD', key_dict);
}

var superscript_code_list = [ 0x00B2, 0x00B3, 0x2074 ];
superscript_code_list = superscript_code_list.map(i => String.fromCharCode(i));
superscript_code_list = new Set(superscript_code_list)

let tamil_basic_keys = (`அ ஆ இ  ஈ உ ஊ எ ஏ ஐ ஒ ஓ ஔ ஜ ஷ ஸ ஶ க்ஷ ஹ க ங ச ஞ ட ண த ந ப ம ய ர ல வ ழ ள ற ன  ஃ ௐ ஸ்ரீ`);
let tamil_basic_list = tamil_basic_keys.split(/\s+/);
let tamil_combo_code_list = [ 0x0BCD, 0x0BBE, 0x0BBF, 0x0BC0, 0x0BC1, 0x0BC2, 0x0BC6, 0x0BC7, 0x0BC8, 0x0BCA, 0x0BCB, 0x0BCC ];
let tamil_combo_list = tamil_combo_code_list.map(i => String.fromCharCode(i));

let sanskrit_basic_keys = (`अ आ इ ई उ ऊ ऋ ऌ ऎ ए ऐ ऒ ओ औ ॠ ॡ  ँ ं ः ऽ ॐ . . . . . . क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न ऩ प फ ब भ म य र ऱ ल ळ ऴ व श ष स ह`);
let sanskrit_basic_list = sanskrit_basic_keys.split(/\s+/);
let sanskrit_combo_code_list = [ 0x094D, 0x093E, 0x093F, 0x0940, 0x0941, 0x0942, 0x0943, 0x0962, 0x0946, 0x0947, 0x0948, 0x094A, 0x094B, 0x094C, 0x0944, 0x0963, 0x0901, 0x0902, 0x903 ];
let sanskrit_combo_list = sanskrit_combo_code_list.map(i => String.fromCharCode(i));

let dummy_combo_list = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
let english_basic_keys = (`a A i I u U R lR e E ai o O au RR lRR ~ M H ' oM K . . . . . k kh g gh n c ch j jh n T Th D Dh N t th d dh n n p ph b bh m y r r l L zh v S sh s h`);
let english_basic_list = english_basic_keys.split(/\s+/);
let english_combo_list = dummy_combo_list;

var lang_key_dict = { 'tamil'     : { 'basic' : tamil_basic_list, 'combo' : tamil_combo_list, 'vowels' : 12, 'base' : 0x0B80 },
                      'telugu'    : { 'vowels' : 19, 'base' : 0x0C00 },
                      'kannada'   : { 'vowels' : 19, 'base' : 0x0C80 },
                      'malayalam' : { 'vowels' : 19, 'base' : 0x0D00 },
                      'hindi'     : { 'vowels' : 19, 'base' : 0x0900 },
                      'marathi'   : { 'vowels' : 19, 'base' : 0x0900 },
                      'bengali'   : { 'vowels' : 19, 'base' : 0x0980 },
                      'punjabi'   : { 'vowels' : 19, 'base' : 0x0A00 },
                      'gujarati'  : { 'vowels' : 19, 'base' : 0x0A80 },
                      'english'   : { 'basic' : english_basic_list, 'combo' : english_combo_list, 'vowels' : 19, 'base' : 0 }
                    }

for (var key in lang_key_dict) {
    var info_dict = lang_key_dict[key];
    if (info_dict['basic'] == undefined) {
        var base = info_dict['base'];
        var [basic_list, combo_list] = sanskrit_to_indic(base);
        info_dict['basic'] = basic_list;
        info_dict['combo'] = combo_list;
    }
}


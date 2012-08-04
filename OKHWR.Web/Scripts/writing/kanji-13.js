function create_node(type, parent) {
  var new_node = document.createElement(type);
  parent.appendChild(new_node);
  return new_node;
}

function createXmlHttp() {
  xmlhttp = false;
  try {
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } catch (E) {
      xmlhttp = false;
    }
  }
  if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
    xmlhttp = new XMLHttpRequest();
  }
  return xmlhttp;
}

function sendget(sendmessage, callback, cgi_override) {
  var cgi;
  if (cgi_override) {
    cgi = cgi_override;
  } else {
    cgi = cgiscript;
  }
  if (!this.xmlhttp) this.xmlhttp = createXmlHttp();
  if (!this.xmlhttp) return;
  if (this.xmlhttp.readyState == 1 || this.xmlhttp.readyState == 2 || this.xmlhttp.readyState == 3) {
    this.xmlhttp.abort();
  }
  this.xmlhttp.open("GET", cgi + "?" + sendmessage, true);
  var self = this;
  this.xmlhttp.onreadystatechange = function () {
    if (self.xmlhttp.readyState == 4) {
      if (self.xmlhttp.status == 200) {
        callback(self.xmlhttp.responseText);
      }
    }
  }
  this.xmlhttp.send();
}

function delete_cookie(name) {
  document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
}

function clear(o) {
  while (o.firstChild)
    o.removeChild(o.firstChild);
}

function getbyid(id) {
  var element = document.getElementById(id);
  return element;
}

function parse_json(json) {
  var result;
  try {
    result = eval('(' + json + ')');
  } catch (err) {
    throw ("JSON parse");
  }
  return result;
}

function gup(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS, "g");
  var values = new Array();
  while (1) {
    var results = regex.exec(window.location.href);
    if (results == null) {
      if (values.length == 0) {
        return "";
      } else if (values.length == 1) {
        return values[0];
      } else {
        return values;
      }
    } else {
      values.push(results[1]);
    }
  }
}

function set_cookie(value) {
  var date_now = new Date();
  var one_year_later = new Date(date_now.getTime() + 31536000000);
  var expiry_date = one_year_later.toGMTString();
  document.cookie = value + ';expires=' + expiry_date + ';';
}

function append_text(parent, text) {
  var text_node = document.createTextNode(text);
  parent.appendChild(text_node);
}

function get_cookie(cookie_string) {
  if (!document.cookie) return;
  var c_start = document.cookie.indexOf(cookie_string);
  if (c_start == -1) return;
  c_start += cookie_string.length;
  var c_end = document.cookie.indexOf(";", c_start);
  if (c_end == -1) c_end = document.cookie.length;
  var cookie = document.cookie.substring(c_start, c_end);
  return cookie;
}

function create_text_node(type, parent, text) {
  var new_node = create_node(type, parent);
  var text_node = document.createTextNode(text);
  new_node.appendChild(text_node);
  return new_node;
}
var cgiscript = "kanji-0.016.cgi";

function KanjiResults(kanji, n_kanji) {
  this.found_kanji = getbyid("found_kanji");
  this.down_button = getbyid("down_button");
  this.up_button = getbyid("up_button");
  this.kanji = kanji.match(/\d+|./g);
  this.n_kanji = n_kanji;
  var self = this;
  this.down_button.onclick = function () {
    self.go_down();
  }
  this.up_button.onclick = function () {
    self.go_up();
  }
  if (typeof (results_table_columns) == "undefined") {
    this.columns = 10;
  } else {
    this.columns = results_table_columns;
  }
  if (typeof (max_kanji) == "undefined") {
    this.max_cells = 100;
  } else {
    this.max_cells = max_kanji;
  }
  this.silly_amount = 20;
  this.offset = 0;
  this.scroll = 0;
  this.scrolled_numbers = 0;
  this.numbers = new Array();
  for (var i = 0; i <= n_kanji / 100; i++) {
    this.numbers[i] = 0;
  }
  for (var i = 0; i < n_kanji; i++) {
    var j = Math.floor(i / this.max_cells);
    if (this.kanji[i].match(/^\d+$/)) this.numbers[j]++;
  }
}
KanjiResults.prototype.adjust_scroll = function (chng) {
  if (this.scroll + chng < 0) return;
  this.scroll += chng;
  this.offset = this.offset + chng * this.max_cells;
  this.scrolled_numbers = 0;
  for (var i = 0; i < this.scroll; i++) {
    this.scrolled_numbers += this.numbers[i];
  }
}
KanjiResults.prototype.go_down = function () {
  this.adjust_scroll(+1);
  this.show();
}
KanjiResults.prototype.go_up = function () {
  this.adjust_scroll(-1);
  this.show();
}
KanjiResults.prototype.clear_found_kanji = function () {
  clear(this.found_kanji);
}
KanjiResults.prototype.clear_down_button = function () {
  clear(this.down_button);
}
KanjiResults.prototype.clear_up_button = function () {
  clear(this.up_button);
}
KanjiResults.prototype.clear = function () {
  this.clear_found_kanji();
  this.clear_down_button();
  this.clear_up_button();
}
KanjiResults.prototype.overflow_button = function () {
  var remaining = this.n_kanji - this.max_cells - this.offset;
  if (this.offset == 0 && remaining <= 0) return;
  this.clear_down_button();
  var above = this.offset - this.scrolled_numbers;
  if (!this.silly_remaining && remaining > 0) {
    var below = this.n_kanji - (above + this.max_cells - this.numbers[this.scroll]);
    var downbutton = create_text_node("a", this.down_button, "?" + below + " more");
  }
  this.clear_up_button();
  if (this.offset != 0) {
    var upbutton = create_text_node("a", this.up_button, "?" + above + " more");
  } else {
    if (!this.silly_remaining && remaining > 0) {
      upbutton = create_text_node("a", this.up_button, "? 0 more");
      upbutton.className = "deadupbutton";
    }
  }
}
var link_cookie_string = "link=";

function set_link_preference(link) {
  set_cookie(link_cookie_string + link);
}

function get_link_preference() {
  return get_cookie(link_cookie_string);
}
var window_cookie_string = "newwindow=";

function set_window_preference() {
  var newwindow = getbyid("nwc");
  var value;
  if (newwindow.checked) {
    value = 1;
  } else {
    value = 0;
  }
  set_cookie(window_cookie_string + value);
}

function get_window_preference() {
  var nwindow = get_cookie(window_cookie_string);
  return nwindow;
}

function draw_cookie(pref_id) {
  return "draw_" + pref_id + "=";
}

function wwwjdic_href(kanji) {
  var href = "http://www.csse.monash.edu.au/~jwb/cgi-bin/wwwjdic.cgi?1MMJ" + encodeURI(kanji);
  return href;
}
var use_input_box_cookie = "uib=";

function show_input_box() {
  var wbd = getbyid("input_box_div");
  wbd.style.display = "block";
  var som = getbyid("string-option-message");
  som.style.display = "none";
}

function hide_input_box() {
  var wbd = getbyid("input_box_div");
  wbd.style.display = "none";
  var som = getbyid("string-option-message");
  som.style.display = "block";
}

function set_input_box_preference() {
  var inbox_el = getbyid("inbox");
  var preference = 0;
  if (inbox_el.checked) {
    preference = 1;
    show_input_box();
  } else {
    clear_input_box();
    hide_input_box();
  }
  set_cookie(use_input_box_cookie + preference);
}

function get_input_box_preference() {
  var preference = get_cookie(use_input_box_cookie)
  if (preference == 1) {
    return true;
  }
  return false;
}
var use_input_box = false;
var input_box_cookie = "wbv=";

function write_kanji(kanji) {
  input_box_el = getbyid("input_box_input");
  if (input_box_el.selectionStart != undefined) {
    if (input_box_el.selectionStart == input_box_el.value.length) {
      input_box_el.value += kanji;
    } else {
      var value = input_box_el.value;
      var s = input_box_el.selectionStart;
      var e = input_box_el.selectionEnd;
      var v_start = value.substring(0, input_box_el.selectionStart);
      var v_end = value.substring(input_box_el.selectionEnd, value.length);
      value = v_start + kanji + v_end;
      input_box_el.value = value;
      input_box_el.selectionStart = s + kanji.length;
      input_box_el.selectionEnd = input_box_el.selectionStart;
    }
  } else {
    input_box_el.value += kanji;
  }
  input_box_el.focus();
  set_cookie(input_box_cookie + encodeURI(input_box_el.value));
}

function create_link(parent, kanji, window_preference) {
  if (use_input_box) {
    var write_kanji_el = create_text_node("span", parent, kanji);
    write_kanji_el.className = "write_kanji";
    write_kanji_el.onclick = function () {
      write_kanji(kanji);
    }
  } else {
    var make_link = true;
    var link_preference = get_link_preference();
    if (link_preference == 'no_link') {
      make_link = false;
    }
    if (make_link) {
      var href = 'minidic.cgi?r=' + encodeURI(kanji);
      var anchor = create_text_node("a", parent, kanji);
      anchor.href = href;
      if (window_preference == "1") {
        anchor.onclick = function () {
          window.open(this.href);
          return false;
        }
      }
    } else {
      append_text(parent, kanji);
      parent.className = "unlinked_kanji";
    }
  }
}

function clear_input_box() {
  var el = document.getElementById("input_box_input");
  if (el) {
    el.value = "";
    el.focus();
  }
  delete_cookie(input_box_cookie);
}

function wwwjdic_search_href(search_string) {
  var href = "http://www.csse.monash.edu.au/~jwb/cgi-bin/wwwjdic.cgi?QMUJ" + encodeURI(search_string);
  return href;
}

function search_input_box() {
  var link_preference = get_link_preference();
  if (link_preference == 'no_link') {
    return;
  }
  var el = getbyid("input_box_input");
  var search_string = el.value;
  if (search_string.length == 0) {
    alert(ml.empty_search);
    return;
  }
  var href = 'minidic.cgi?r=' + encodeURI(search_string);
  var window_preference = get_window_preference();
  if (window_preference == 1) {
    window.open(href);
  } else {
    location.href = href;
  }
}

function change_input_box() {
  var el = getbyid("input_box_input");
  var value = el.value;
  set_cookie(input_box_cookie + encodeURI(value));
}

function initialize_input_box() {
//  use_input_box = get_input_box_preference();
//  if (use_input_box) {
//    show_input_box();
//    var el = getbyid("input_box_input");
//    el.onchange = change_input_box;
//    el.focus();
//    var value = decodeURI(get_cookie(input_box_cookie));
//    if (value && value != "undefined" && value != "=") {
//      el.value = value;
//    }
//    input_box_exists = true;
//  }
}
KanjiResults.prototype.show = function () {
  this.clear();
  var max = this.kanji.length;
  var remaining = 0;
  this.silly_remaining = false;
  if (this.offset + this.max_cells < max) {
    max = this.offset + this.max_cells;
    remaining = this.kanji.length - max;
    if (remaining < this.silly_amount) {
      max = this.kanji.length;
      this.silly_remaining = true;
    }
  }
  var displayed_kanji = 0;
  var table = create_node("table", this.found_kanji);
  var tbody = create_node("tbody", table);
  var tr;
  var link_preference = get_link_preference();
  var window_preference = get_window_preference();
  for (var k = this.offset; k < max; k++) {
    if ((k - this.offset) % this.columns == 0) tr = create_node("tr", tbody);
    var td = create_node("td", tr);
    if (this.kanji[k].match(/^\d+$/)) {
      append_text(td, this.kanji[k]);
      td.className = "number";
    } else {
      create_link(td, this.kanji[k], window_preference);
      displayed_kanji++;
    }
  }
  if (k >= this.max_cells + this.offset || this.offset > 0) {
    this.overflow_button(this.silly_remaining);
  }
}

function was_show_kanji_list(n_kanji, kanji) {
  global_offset = 0;
  global_kanji = kanji;
  global_n_kanji = n_kanji;
  show_kanji_offset();
}
var n_radicals = 252;
var mr_buttons_selected = 0;
var mr_button_states = new Array();
var mr_chosens = new Array();

function mr_update_buttons(button_states) {
  if (!button_states) return;
  for (i = 0; i < n_radicals; i++) {
    var state = button_states.substring(i, i + 1);
    var radical_button = getbyid("rad_" + (i + 1));
    var className = radical_button.className;
    className = className.replace(/\s*(invalid|choice|chosen)/g, "");
    radical_button.className = className;
    if (state == "I") {
      radical_button.className += ' invalid';
      mr_button_states[i + 1] = -1;
    } else if (state == "P") {
      mr_button_states[i + 1] = 0;
      radical_button.className += ' choice';
    } else if (state == "C") {
      mr_button_states[i + 1] = 1;
      radical_button.className += ' chosen';
    }
  }
}
var kanji_results;

function mr_show_kanji_list(data) {
  var kanji_match = parse_json(data);
  if (!kanji_match) {
    return;
  }
  var n_kanji = kanji_match.n_results;
  mr_update_buttons(kanji_match.buttons);
  kanji_results = new KanjiResults(kanji_match.results, n_kanji);
  kanji_results.show();
}

function mr_reset_buttons() {
  for (var i = 1; i <= n_radicals; i++) {
    var radid = "rad_" + i;
    var r = getbyid(radid);
    var className = r.className;
    r.className = r.className.replace(/invalid|chosen/g, "choice");
    mr_chosens[i] = 0;
    mr_button_states[i] = 0;
  }
  mr_buttons_selected = 0;
  kanji_results.clear();
}

function mr_push_button(radical_id) {
  if (mr_button_states[radical_id] == -1) {
    return;
  }
  if (mr_chosens[radical_id] == 1) {
    mr_chosens[radical_id] = 0;
    mr_buttons_selected--;
  } else {
    mr_chosens[radical_id] = 1;
    mr_buttons_selected++;
  }
  if (mr_buttons_selected) mr_get_kanji();
  else mr_reset_buttons();
}

function mr_get_kanji() {
  var params = "M=";
  var m_buttons = new Array();
  for (radical in mr_chosens)
    if (mr_chosens[radical] == 1) m_buttons.push(radical);
  params += m_buttons.join(" ");
  sendget(params, mr_show_kanji_list);
}

function mr_start_buttons() {
  for (var i = 1; i <= n_radicals; i++) {
    var rad_i = getbyid("rad_" + i);
    (function (i) {
      rad_i.onclick = function () {
        mr_push_button(i)
      };
    } (i));
    mr_button_states[i] = 0;
  }
  var pressed = gup("b");
  if (typeof (pressed) == "string" && pressed.length > 0) {
    mr_push_button(pressed);
  } else if (typeof (pressed) == "object") {
    for (var i = 0; i < pressed.length; i++) {
      mr_push_button(pressed[i]);
    }
  }
}
FourCorner.prototype.addResult = function (fc_result_json) {
  var fc_result = parse_json(fc_result_json);
  var buttons = fc_result.buttons;
  var button_states = buttons.split("");
  for (var cn = 0; cn < 5; cn++) {
    for (var bn = 0; bn < 10; bn++) {
      var state;
      var i = cn * 10 + bn;
      if (button_states[i] == "I") {
        state = "invalid";
      } else if (button_states[i] == "P") {
        state = "choice";
      } else if (button_states[i] == "C") {
        state = "chosen";
      }
      var button = this.states[cn][bn].button;
      this.states[cn][bn].state = state;
      button.className = state;
    }
  }
  this.kanji_results = new KanjiResults(fc_result.results, fc_result.n_results);
  this.kanji_results.show();
}
FourCorner.prototype.reset = function () {
  for (var cn = 0; cn < 5; cn++) {
    this.clicked[cn] = -1;
    for (var bn = 0; bn < 10; bn++) {
      var state;
      var button = this.states[cn][bn].button;
      this.states[cn][bn].state = "choice";
      button.className = "choice";
    }
  }
  this.selected = 0;
  if (this.kanji_results) {
    this.kanji_results.clear();
  }
}
FourCorner.prototype.choose = function (cn, bn) {
  var button = this.states[cn][bn].button;
  var clicked = this.clicked[cn];
  if (clicked >= 0) {
    if (clicked == bn) {
      this.clicked[cn] = -1;
      this.selected--;
    } else {
      return;
    }
  } else {
    var state = this.states[cn][bn].state;
    if (state == "invalid") {
      return;
    } else {
      this.clicked[cn] = bn;
      this.selected++;
    }
  }
  if (this.selected > 0) {
    var r = "4=";
    for (x in this.clicked) {
      if (this.clicked[x] >= 0) {
        r += x + " " + this.clicked[x] + "  ";
      }
    }
    var self = this;
    sendget(r, function (reply) {
      self.addResult(reply);
    });
  } else {
    this.reset();
  }
}

function FourCorner() {
  this.selected = 0;
  this.states = new Array();
  this.clicked = new Array();
  var self = this;
  for (var cn = 0; cn < 5; cn++) {
    this.states[cn] = new Array();
    this.clicked[cn] = -1;
    for (var bn = 0; bn < 10; bn++) {
      var id = "fc" + cn + "v" + bn;
      var button = getbyid(id);
      this.states[cn][bn] = {
        "button": button,
        "state": "choice"
      };
      (function (c, b) {
        button.onclick = function () {
          self.choose(c, b)
        };
      } (cn, bn));
    }
  }
  var reset_button = getbyid("reset-button");
  reset_button.onclick = function () {
    self.reset();
  }
}

function fc_start_buttons() {
  var fc = new FourCorner();
}

function change_language() {
  var lang_select = getbyid("lang_select");
  var new_lang = lang_select.value;
  var current_href = location.href;
  var param_string = current_href.match(/(\?.*)$/);
  if (param_string) {
    new_lang += param_string[1];
  }
  location.href = new_lang;
}
var obscurestate = 'visible';

function toggleobscure() {
  var obscure = document.getElementById("obscure");
  if (obscurestate == 'visible') obscurestate = 'hidden';
  else if (obscurestate == 'hidden') obscurestate = 'visible';
  obscure.style.visibility = obscurestate;
  var toggler = document.getElementById("toggleobscuretext");
  if (obscurestate == 'visible') toggler.innerHTML = trans_hide_obscure;
  else toggler.innerHTML = trans_show_obscure;
}

function go_to(link) {
  location.href = link;
}
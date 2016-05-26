/**
 * JSON based light-weight translator, works with any language givent the
 * correct JSON format as the following example for English (default) to French:
 *
 * "text-translator": {
 * 		"Français" : "English",
 * 		"Hello" : "Bonjour"
 * 	}
 * 	"abbrv-translator": {
 * 		"in" : "po"
 * 	}
 * 
 */
function jsonTranslator( file, defaultLang, transLang ){

	// Variable Initializations
	var me = this,
	EXP_DAYS = 1,
	isJSON = true,
	initTrans = false;

	transLang = typeof transLang === "undefined" ? "": transLang;

	// Error handling
	if ( typeof file === "undefined" ){
		console.error("Provide an appropriate JSON object or file path for a JSON file");
	} else if ( typeof file === 'object' ) {
		file = file;
	} else {
    		// Check if JSON String or file path 
    		try {
			file = JSON.parse(file);
    		} catch (e) {
        		isJSON = false;
    		}
	}

	// Initalizer
	this.init = function( file, defaultLang, transLang ){
		if( isJSON ){
			// jsonTranslator object parameters
			me.defaultLang = defaultLang;
			me.transLang = transLang;
			me.lang_json = {};
			me.lang_json[transLang] = file;
	       		me.lang_json[defaultLang] = { "text-translator" : {}, "abbrv-translator" : {} };
	       		me.lang_json[defaultLang]["text-translator"] = swapJson( file["text-translator"] );
			me.lang_json[defaultLang]["abbrv-translator"] = swapJson( file["abbrv-translator"] );
			
			initTrans = true;

		} else {
			// jsonTranslator object parameters
			me.langFilePath = file;
			me.defaultLang = defaultLang;
			me.transLang = transLang;
			me.lang_json = {};
			me.addedJson = typeof add_json !== "undefined" ? add_json : {};
			try{
				loadData(me.langFilePath);
			}catch (e) {
				console.exception(e.message);
			}
		}
	};

	// Auto initialize
	me.init(file, defaultLang, transLang);

	// Public Functions
	
	/**
	 * Loads the json data from the provided file path.
	 * 
	 * @param  {String} filePath The path to the file
	 */
	function loadData( filePath ){
		var xmlHttp = new XMLHttpRequest();

	    xmlHttp.onreadystatechange = function() { 
	        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
	            	var currLang = me.getLangCookie(),
	            	json = JSON.parse( xmlHttp.responseText );
			//Load the language JSON
			me.lang_json[me.transLang] = json;
			//Swap the translation language json to get the default language json
			me.lang_json[me.defaultLang] = { "text-translator" : {}, "abbrv-translator" : {} };
			me.lang_json[me.defaultLang] ["text-translator"] = swapJson( json["text-translator"] );
			me.lang_json[me.defaultLang] ["abbrv-translator"] = swapJson( json["abbrv-translator"] );
			//Only translate initially if language cookie is defined
			if( typeof currLang !== "undefined" &&  currLang !== "" ){
				me.translate(currLang);
			}
		}
	    }

	    xmlHttp.open("GET", filePath, true);
	    xmlHttp.send(null);
	}
	
	/**
	 * Swaps json data key with value and returns the result.
	 * 
	 * @param  {JSON} json The json object to be swaped
	 * @return {JSON}      The swaped version of the json object
	 */
	function swapJson(json) {
		var ret = {};

		for(var key in json){
			ret[ json[key] ] = key;
		}

		return ret;
	}

	/**
	 * Converts and element's text or attributes, based on a provided json.
	 * Replaces "key" with "value".
	 * 
	 * @param  {Object} element JavaScript object for the element to be converted
	 * @param  {JSON}   json    Json from which the convertion parameters are located
	 * @param  {String} ref     Refrencer for reading the data attribute
	 */
	function convertText(element, json, ref){
		var eleText = element.innerHTML;
		var eleContent = element.childNodes;
		var attribute = '';

		//An HTML attribute required translation instead of inline Text (default)
		if( element.getAttribute(ref) !== '' ){
			attribute = element.getAttribute(ref);
			eleText = element.getAttribute(attribute);
		}

		//Translate the Text inbetween Tags, since there's nothing specified
		if( element.getAttribute(ref) === '' && eleContent.length > 1 ){
			for( var i in eleContent ) {
				var elem = eleContent[i];

				//Only translate text (nodeType 3 is simple text, anything else is HTML)
				if( elem.nodeType === 3 ){
					var subText = elem.textContent;

					if( json[subText.trim()] ){
						var key = subText.trim();
						var value = json[subText.trim()];

						subText = subText.replace(key, value);
					}
					else{
						//Yet to be identified Text
						var un_Text = subText;

						for( var key in json ) {
							if( un_Text.indexOf(key) > -1 &&  un_Text.length ){
								//Found text, replace it with the new language
								subText = subText.replaceAll(key, json[key]);
								//Found text, update the yet to be identified text
								un_Text = un_Text.replaceAll(key, "");
							}
						}
					}
					
					elem.textContent = subText;
				}
			}
		}
		//Translate the specified attribute in the HTML 
		else{
			if( json[eleText.trim()] ){
				var key = eleText.trim();
				var value = json[eleText.trim()];

				eleText = eleText.replace(key, value);
			}
			else{
				//Yet to be identified Text
				var un_Text = eleText;

				for( var key in json ) {
					//Each component in the text has been identified
					if( un_Text.length === 0 ){
						break;
					}
					else if( eleText.indexOf(key) > -1 ){
						//Found text, replace it with the new language
						eleText = eleText.replaceAll(key, json[key]);
						//Found text, update the yet to be identified text
						un_Text = un_Text.replaceAll(key, "");
					}
				}
			}
			
			if(attribute !== '' ){
				element.setAttribute(attribute, eleText);
			}
			else{
				element.textContent = eleText;
			}
			
		}
	}

	// Private functions
	
	// Translate the current language.
	// If the language is defaultLang translate to transLang,
	// and vice versa
	this.updateLang = function() {
		var currLang = me.getLangCookie();
		var undefCase = typeof currLang === "undefined" || currLang === "" ? me.transLang : me.defaultLang;
		var newLang = currLang === me.defaultLang ? me.transLang : undefCase;
		var content = me.lang_json[newLang];

		me.setLangCookie(newLang);
		try{
			me.translate(newLang);
		}catch (e) {
			console.exception(e.message);
		}
		
	};
	// Set the cookie "lang"
	this.setLangCookie = function(lang){
		var now = new Date();
		//var expTime = now.setTime( now.getTime() + ( me.getExpHours()*60*60*1000 ) );
		var expDays = typeof me.getExpDays() === "undefined" ? 365 : me.getExpDays();
		setCookie("lang", lang, me.getExpDays());
	};
	// Get the cookie "lang"
	this.getLangCookie = function(){
		return getCookie("lang");
	};
	// Set the expiration days for the cookie
	this.setExpDays = function(days){
		me.EXP_DAYS = days;
	};
	// Get the expiration days for the cookie previously set by the user
	this.getExpDays = function(){
		return me.EXP_DAYS;
	};
	// Translates to the provided language (the key must match the loaded JSON)
	this.translate = function(lang){
		//Json text translations
		var jsonTT = me.lang_json[lang]["text-translator"];
		//Json Abbriviation translations
		var jsonAT = me.lang_json[lang]["abbrv-translator"];

		var TT_Elements = document.querySelectorAll("[data-translator]");
		var AT_Elements = document.querySelectorAll("[data-abbr-translator]");

		for( var i in TT_Elements ) {
			if( TT_Elements[i].nodeType === 1 )
				convertText(TT_Elements[i], jsonTT, "data-translator");
		}
		//Translate abbriviations seperately since text can easily overlap
		for( var i in AT_Elements ) {
			if( AT_Elements[i].nodeType === 1 )
				convertText(AT_Elements[i], jsonAT, "data-abbr-translator");
		}

	};

	// Do an initial Translation if the language cookie is set and initTrans variable
	// is set to true
	if( initTrans ){
		var currLang = me.getLangCookie();
		
		if( typeof currLang !== "undefined" &&  currLang !== "" ){
			me.translate(currLang);
		}
	}
	
}

// Replace all occurencess of sub-string without using regular expressions (slow)
String.prototype.replaceAll = function(_f, _r, _c){ 
  var o = this.toString();
  var r = '';
  var s = o;
  var b = 0;
  var e = -1;
  if(_c){ _f = _f.toLowerCase(); s = o.toLowerCase(); }
  while((e=s.indexOf(_f)) > -1)
  {
    r += o.substring(b, b+e) + _r;
    s = s.substring(e+_f.length, s.length);
    b += e+_f.length;
  }
  // Add Leftover
  if(s.length>0){ r+=o.substring(o.length-s.length, o.length); }
  // Return New String
  return r;
};

// Cookie management courtesy of W3Schools

// Set a cookie with name, value and expiration date from now
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
} 

// Get a cookie set by the user or existing on the site being visited
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
} 

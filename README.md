# jsonTranslator
Light weight JavaScript plugin for translating web pages on the fly, with the following features:

- Translation is done through easy to use, human readable JSON format
- The initialization is as easy as adding an attribute to HTML elements, importing and calling the jsonTranslator in your code
- Utilizes a simple Javascript cookie functionality to save the language preferences (so when the page is reloaded your the page is automatically be in your prefered language)
- Translates whole words and parts of words (including inline text, without affecting other child nodes See Examples below)
- Used two seperate types of translations (see the JSON format below) for Text and Abbriviations since the two can otherwise conflict
- More to come soon...

<strong>Demo:</strong> https://jsfiddle.net/6ma9urte/4/

<h2>How To Use</h2>
- In JSON  { key : value } format add the default language as the "key" and translation language as "value"
- Keep text and abbriviation seperate with <b>text-translator</b> and <b>abbrv-translator</b> sub categories (See example below)

- In HTML add attribute <b>data-translator</b> to element that need inline text translations, and <b>data-translator="{attribute}"</b> for translations
invloving attributes instead of inline text

<h3>Example for English and French:</h3>

<b>JSON:</b>
```json
{
 	"text-translator": {
 		"Français" : "English",
 		"Hello" : "Bonjour"
 	},
 	"abbrv-translator": {
 		"in" : "po"
 	}
 }
```
<b>HTML:</b>
```html
<html>
<!--Include the jsonTranslator.js script-->
  <script type="text/javascript" src="src/js/jsonTranslator.js"></script>
  
  <label data-translator>Hello <img src="wavingHand.png"></label>
  <label data-translator>Whats your Name?</label>
  <input type="text" data-translator="placeholder" placeholder="Your Name">
  
</html>
```

<b>JavaScript:</b>(I'm using Jquery here for the on click event but the plugin doesn't require it)

```javascript
jT = new jsonTranslator(LANG_FILE_PATH_OR_JSON_OBJECT, DEFAULT_LANG, TRANS_LANG);
$("#lng").on("click", function () {
		jT.updateLang();
});
```

 

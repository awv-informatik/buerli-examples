(self.webpackChunkbuerli_examples_client=self.webpackChunkbuerli_examples_client||[]).push([[1201],{"./node_modules/codemirror/mode/sass/sass.js":function(__unused_webpack_module,__unused_webpack_exports,__webpack_require__){!function(CodeMirror){"use strict";CodeMirror.defineMode("sass",(function(config){var cssMode=CodeMirror.mimeModes["text/css"],propertyKeywords=cssMode.propertyKeywords||{},colorKeywords=cssMode.colorKeywords||{},valueKeywords=cssMode.valueKeywords||{},fontProperties=cssMode.fontProperties||{};function tokenRegexp(words){return new RegExp("^"+words.join("|"))}var word,keywordsRegexp=new RegExp("^"+["true","false","null","auto"].join("|")),opRegexp=tokenRegexp(["\\(","\\)","=",">","<","==",">=","<=","\\+","-","\\!=","/","\\*","%","and","or","not",";","\\{","\\}",":"]),pseudoElementsRegexp=/^::?[a-zA-Z_][\w\-]*/;function isEndLine(stream){return!stream.peek()||stream.match(/\s+$/,!1)}function urlTokens(stream,state){var ch=stream.peek();return")"===ch?(stream.next(),state.tokenizer=tokenBase,"operator"):"("===ch?(stream.next(),stream.eatSpace(),"operator"):"'"===ch||'"'===ch?(state.tokenizer=buildStringTokenizer(stream.next()),"string"):(state.tokenizer=buildStringTokenizer(")",!1),"string")}function comment(indentation,multiLine){return function(stream,state){return stream.sol()&&stream.indentation()<=indentation?(state.tokenizer=tokenBase,tokenBase(stream,state)):(multiLine&&stream.skipTo("*/")?(stream.next(),stream.next(),state.tokenizer=tokenBase):stream.skipToEnd(),"comment")}}function buildStringTokenizer(quote,greedy){function stringTokenizer(stream,state){var nextChar=stream.next(),peekChar=stream.peek(),previousChar=stream.string.charAt(stream.pos-2);return"\\"!==nextChar&&peekChar===quote||nextChar===quote&&"\\"!==previousChar?(nextChar!==quote&&greedy&&stream.next(),isEndLine(stream)&&(state.cursorHalf=0),state.tokenizer=tokenBase,"string"):"#"===nextChar&&"{"===peekChar?(state.tokenizer=buildInterpolationTokenizer(stringTokenizer),stream.next(),"operator"):"string"}return null==greedy&&(greedy=!0),stringTokenizer}function buildInterpolationTokenizer(currentTokenizer){return function(stream,state){return"}"===stream.peek()?(stream.next(),state.tokenizer=currentTokenizer,"operator"):tokenBase(stream,state)}}function indent(state){if(0==state.indentCount){state.indentCount++;var currentOffset=state.scopes[0].offset+config.indentUnit;state.scopes.unshift({offset:currentOffset})}}function dedent(state){1!=state.scopes.length&&state.scopes.shift()}function tokenBase(stream,state){var ch=stream.peek();if(stream.match("/*"))return state.tokenizer=comment(stream.indentation(),!0),state.tokenizer(stream,state);if(stream.match("//"))return state.tokenizer=comment(stream.indentation(),!1),state.tokenizer(stream,state);if(stream.match("#{"))return state.tokenizer=buildInterpolationTokenizer(tokenBase),"operator";if('"'===ch||"'"===ch)return stream.next(),state.tokenizer=buildStringTokenizer(ch),"string";if(state.cursorHalf){if("#"===ch&&(stream.next(),stream.match(/[0-9a-fA-F]{6}|[0-9a-fA-F]{3}/)))return isEndLine(stream)&&(state.cursorHalf=0),"number";if(stream.match(/^-?[0-9\.]+/))return isEndLine(stream)&&(state.cursorHalf=0),"number";if(stream.match(/^(px|em|in)\b/))return isEndLine(stream)&&(state.cursorHalf=0),"unit";if(stream.match(keywordsRegexp))return isEndLine(stream)&&(state.cursorHalf=0),"keyword";if(stream.match(/^url/)&&"("===stream.peek())return state.tokenizer=urlTokens,isEndLine(stream)&&(state.cursorHalf=0),"atom";if("$"===ch)return stream.next(),stream.eatWhile(/[\w-]/),isEndLine(stream)&&(state.cursorHalf=0),"variable-2";if("!"===ch)return stream.next(),state.cursorHalf=0,stream.match(/^[\w]+/)?"keyword":"operator";if(stream.match(opRegexp))return isEndLine(stream)&&(state.cursorHalf=0),"operator";if(stream.eatWhile(/[\w-]/))return isEndLine(stream)&&(state.cursorHalf=0),word=stream.current().toLowerCase(),valueKeywords.hasOwnProperty(word)?"atom":colorKeywords.hasOwnProperty(word)?"keyword":propertyKeywords.hasOwnProperty(word)?(state.prevProp=stream.current().toLowerCase(),"property"):"tag";if(isEndLine(stream))return state.cursorHalf=0,null}else{if("-"===ch&&stream.match(/^-\w+-/))return"meta";if("."===ch){if(stream.next(),stream.match(/^[\w-]+/))return indent(state),"qualifier";if("#"===stream.peek())return indent(state),"tag"}if("#"===ch){if(stream.next(),stream.match(/^[\w-]+/))return indent(state),"builtin";if("#"===stream.peek())return indent(state),"tag"}if("$"===ch)return stream.next(),stream.eatWhile(/[\w-]/),"variable-2";if(stream.match(/^-?[0-9\.]+/))return"number";if(stream.match(/^(px|em|in)\b/))return"unit";if(stream.match(keywordsRegexp))return"keyword";if(stream.match(/^url/)&&"("===stream.peek())return state.tokenizer=urlTokens,"atom";if("="===ch&&stream.match(/^=[\w-]+/))return indent(state),"meta";if("+"===ch&&stream.match(/^\+[\w-]+/))return"variable-3";if("@"===ch&&stream.match("@extend")&&(stream.match(/\s*[\w]/)||dedent(state)),stream.match(/^@(else if|if|media|else|for|each|while|mixin|function)/))return indent(state),"def";if("@"===ch)return stream.next(),stream.eatWhile(/[\w-]/),"def";if(stream.eatWhile(/[\w-]/)){if(stream.match(/ *: *[\w-\+\$#!\("']/,!1)){word=stream.current().toLowerCase();var prop=state.prevProp+"-"+word;return propertyKeywords.hasOwnProperty(prop)?"property":propertyKeywords.hasOwnProperty(word)?(state.prevProp=word,"property"):fontProperties.hasOwnProperty(word)?"property":"tag"}return stream.match(/ *:/,!1)?(indent(state),state.cursorHalf=1,state.prevProp=stream.current().toLowerCase(),"property"):(stream.match(/ *,/,!1)||indent(state),"tag")}if(":"===ch)return stream.match(pseudoElementsRegexp)?"variable-3":(stream.next(),state.cursorHalf=1,"operator")}return stream.match(opRegexp)?"operator":(stream.next(),null)}function tokenLexer(stream,state){stream.sol()&&(state.indentCount=0);var style=state.tokenizer(stream,state),current=stream.current();if("@return"!==current&&"}"!==current||dedent(state),null!==style){for(var withCurrentIndent=stream.pos-current.length+config.indentUnit*state.indentCount,newScopes=[],i=0;i<state.scopes.length;i++){var scope=state.scopes[i];scope.offset<=withCurrentIndent&&newScopes.push(scope)}state.scopes=newScopes}return style}return{startState:function(){return{tokenizer:tokenBase,scopes:[{offset:0,type:"sass"}],indentCount:0,cursorHalf:0,definedVars:[],definedMixins:[]}},token:function(stream,state){var style=tokenLexer(stream,state);return state.lastToken={style:style,content:stream.current()},style},indent:function(state){return state.scopes[0].offset},blockCommentStart:"/*",blockCommentEnd:"*/",lineComment:"//",fold:"indent"}}),"css"),CodeMirror.defineMIME("text/x-sass","sass")}(__webpack_require__("./node_modules/codemirror/lib/codemirror.js"),__webpack_require__("./node_modules/codemirror/mode/css/css.js"))}}]);
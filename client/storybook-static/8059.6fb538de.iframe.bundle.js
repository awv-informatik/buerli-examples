(self.webpackChunkbuerli_examples_client=self.webpackChunkbuerli_examples_client||[]).push([[8059],{"./node_modules/codemirror/mode/julia/julia.js":function(__unused_webpack_module,__unused_webpack_exports,__webpack_require__){!function(CodeMirror){"use strict";CodeMirror.defineMode("julia",(function(config,parserConf){function wordRegexp(words,end,pre){return void 0===pre&&(pre=""),void 0===end&&(end="\\b"),new RegExp("^"+pre+"(("+words.join(")|(")+"))"+end)}var octChar="\\\\[0-7]{1,3}",hexChar="\\\\x[A-Fa-f0-9]{1,2}",sChar="\\\\[abefnrtv0%?'\"\\\\]",uChar="([^\\u0027\\u005C\\uD800-\\uDFFF]|[\\uD800-\\uDFFF][\\uDC00-\\uDFFF])",asciiOperatorsList=["[<>]:","[<>=]=","<<=?",">>>?=?","=>","--?>","<--[->]?","\\/\\/","\\.{2,3}","[\\.\\\\%*+\\-<>!\\/^|&]=?","\\?","\\$","~",":"],operators=parserConf.operators||wordRegexp(["[<>]:","[<>=]=","<<=?",">>>?=?","=>","--?>","<--[->]?","\\/\\/","[\\\\%*+\\-<>!\\/^|&\\u00F7\\u22BB]=?","\\?","\\$","~",":","\\u00D7","\\u2208","\\u2209","\\u220B","\\u220C","\\u2218","\\u221A","\\u221B","\\u2229","\\u222A","\\u2260","\\u2264","\\u2265","\\u2286","\\u2288","\\u228A","\\u22C5","\\b(in|isa)\\b(?!.?\\()"],""),delimiters=parserConf.delimiters||/^[;,()[\]{}]/,identifiers=parserConf.identifiers||/^[_A-Za-z\u00A1-\u2217\u2219-\uFFFF][\w\u00A1-\u2217\u2219-\uFFFF]*!*/,chars=wordRegexp([octChar,hexChar,sChar,uChar],"'"),openersList=["begin","function","type","struct","immutable","let","macro","for","while","quote","if","else","elseif","try","finally","catch","do"],closersList=["end","else","elseif","catch","finally"],keywordsList=["if","else","elseif","while","for","begin","let","end","do","try","catch","finally","return","break","continue","global","local","const","export","import","importall","using","function","where","macro","module","baremodule","struct","type","mutable","immutable","quote","typealias","abstract","primitive","bitstype"],builtinsList=["true","false","nothing","NaN","Inf"];CodeMirror.registerHelper("hintWords","julia",keywordsList.concat(builtinsList));var openers=wordRegexp(openersList),closers=wordRegexp(closersList),keywords=wordRegexp(keywordsList),builtins=wordRegexp(builtinsList),macro=/^@[_A-Za-z\u00A1-\uFFFF][\w\u00A1-\uFFFF]*!*/,symbol=/^:[_A-Za-z\u00A1-\uFFFF][\w\u00A1-\uFFFF]*!*/,stringPrefixes=/^(`|([_A-Za-z\u00A1-\uFFFF]*"("")?))/,macroOperators=wordRegexp(asciiOperatorsList,"","@"),symbolOperators=wordRegexp(asciiOperatorsList,"",":");function inArray(state){return state.nestedArrays>0}function inGenerator(state){return state.nestedGenerators>0}function currentScope(state,n){return void 0===n&&(n=0),state.scopes.length<=n?null:state.scopes[state.scopes.length-(n+1)]}function tokenBase(stream,state){if(stream.match("#=",!1))return state.tokenize=tokenComment,state.tokenize(stream,state);var leavingExpr=state.leavingExpr;if(stream.sol()&&(leavingExpr=!1),state.leavingExpr=!1,leavingExpr&&stream.match(/^'+/))return"operator";if(stream.match(/\.{4,}/))return"error";if(stream.match(/\.{1,3}/))return"operator";if(stream.eatSpace())return null;var match,ch=stream.peek();if("#"===ch)return stream.skipToEnd(),"comment";if("["===ch&&(state.scopes.push("["),state.nestedArrays++),"("===ch&&(state.scopes.push("("),state.nestedGenerators++),inArray(state)&&"]"===ch){for(;state.scopes.length&&"["!==currentScope(state);)state.scopes.pop();state.scopes.pop(),state.nestedArrays--,state.leavingExpr=!0}if(inGenerator(state)&&")"===ch){for(;state.scopes.length&&"("!==currentScope(state);)state.scopes.pop();state.scopes.pop(),state.nestedGenerators--,state.leavingExpr=!0}if(inArray(state)){if("end"==state.lastToken&&stream.match(":"))return"operator";if(stream.match("end"))return"number"}if((match=stream.match(openers,!1))&&state.scopes.push(match[0]),stream.match(closers,!1)&&state.scopes.pop(),stream.match(/^::(?![:\$])/))return state.tokenize=tokenAnnotation,state.tokenize(stream,state);if(!leavingExpr&&(stream.match(symbol)||stream.match(symbolOperators)))return"builtin";if(stream.match(operators))return"operator";if(stream.match(/^\.?\d/,!1)){var imMatcher=RegExp(/^im\b/),numberLiteral=!1;if(stream.match(/^0x\.[0-9a-f_]+p[\+\-]?[_\d]+/i)&&(numberLiteral=!0),stream.match(/^0x[0-9a-f_]+/i)&&(numberLiteral=!0),stream.match(/^0b[01_]+/i)&&(numberLiteral=!0),stream.match(/^0o[0-7_]+/i)&&(numberLiteral=!0),stream.match(/^(?:(?:\d[_\d]*)?\.(?!\.)(?:\d[_\d]*)?|\d[_\d]*\.(?!\.)(?:\d[_\d]*))?([Eef][\+\-]?[_\d]+)?/i)&&(numberLiteral=!0),stream.match(/^\d[_\d]*(e[\+\-]?\d+)?/i)&&(numberLiteral=!0),numberLiteral)return stream.match(imMatcher),state.leavingExpr=!0,"number"}if(stream.match("'"))return state.tokenize=tokenChar,state.tokenize(stream,state);if(stream.match(stringPrefixes))return state.tokenize=tokenStringFactory(stream.current()),state.tokenize(stream,state);if(stream.match(macro)||stream.match(macroOperators))return"meta";if(stream.match(delimiters))return null;if(stream.match(keywords))return"keyword";if(stream.match(builtins))return"builtin";var isDefinition=state.isDefinition||"function"==state.lastToken||"macro"==state.lastToken||"type"==state.lastToken||"struct"==state.lastToken||"immutable"==state.lastToken;return stream.match(identifiers)?isDefinition?"."===stream.peek()?(state.isDefinition=!0,"variable"):(state.isDefinition=!1,"def"):(state.leavingExpr=!0,"variable"):(stream.next(),"error")}function tokenAnnotation(stream,state){return stream.match(/.*?(?=[,;{}()=\s]|$)/),stream.match("{")?state.nestedParameters++:stream.match("}")&&state.nestedParameters>0&&state.nestedParameters--,state.nestedParameters>0?stream.match(/.*?(?={|})/)||stream.next():0==state.nestedParameters&&(state.tokenize=tokenBase),"builtin"}function tokenComment(stream,state){return stream.match("#=")&&state.nestedComments++,stream.match(/.*?(?=(#=|=#))/)||stream.skipToEnd(),stream.match("=#")&&(state.nestedComments--,0==state.nestedComments&&(state.tokenize=tokenBase)),"comment"}function tokenChar(stream,state){var match,isChar=!1;if(stream.match(chars))isChar=!0;else if(match=stream.match(/\\u([a-f0-9]{1,4})(?=')/i))((value=parseInt(match[1],16))<=55295||value>=57344)&&(isChar=!0,stream.next());else if(match=stream.match(/\\U([A-Fa-f0-9]{5,8})(?=')/)){var value;(value=parseInt(match[1],16))<=1114111&&(isChar=!0,stream.next())}return isChar?(state.leavingExpr=!0,state.tokenize=tokenBase,"string"):(stream.match(/^[^']+(?=')/)||stream.skipToEnd(),stream.match("'")&&(state.tokenize=tokenBase),"error")}function tokenStringFactory(delimiter){function tokenString(stream,state){if(stream.eat("\\"))stream.next();else{if(stream.match(delimiter))return state.tokenize=tokenBase,state.leavingExpr=!0,"string";stream.eat(/[`"]/)}return stream.eatWhile(/[^\\`"]/),"string"}return'"""'===delimiter.substr(-3)?delimiter='"""':'"'===delimiter.substr(-1)&&(delimiter='"'),tokenString}return{startState:function(){return{tokenize:tokenBase,scopes:[],lastToken:null,leavingExpr:!1,isDefinition:!1,nestedArrays:0,nestedComments:0,nestedGenerators:0,nestedParameters:0,firstParenPos:-1}},token:function(stream,state){var style=state.tokenize(stream,state),current=stream.current();return current&&style&&(state.lastToken=current),style},indent:function(state,textAfter){var delta=0;return("]"===textAfter||")"===textAfter||/^end\b/.test(textAfter)||/^else/.test(textAfter)||/^catch\b/.test(textAfter)||/^elseif\b/.test(textAfter)||/^finally/.test(textAfter))&&(delta=-1),(state.scopes.length+delta)*config.indentUnit},electricInput:/\b(end|else|catch|finally)\b/,blockCommentStart:"#=",blockCommentEnd:"=#",lineComment:"#",closeBrackets:'()[]{}""',fold:"indent"}})),CodeMirror.defineMIME("text/x-julia","julia")}(__webpack_require__("./node_modules/codemirror/lib/codemirror.js"))}}]);
(self.webpackChunkbuerli_examples_client=self.webpackChunkbuerli_examples_client||[]).push([[1105],{"./node_modules/codemirror/mode/ttcn/ttcn.js":function(__unused_webpack_module,__unused_webpack_exports,__webpack_require__){!function(CodeMirror){"use strict";function words(str){for(var obj={},words=str.split(" "),i=0;i<words.length;++i)obj[words[i]]=!0;return obj}function def(mimes,mode){"string"==typeof mimes&&(mimes=[mimes]);var words=[];function add(obj){if(obj)for(var prop in obj)obj.hasOwnProperty(prop)&&words.push(prop)}add(mode.keywords),add(mode.builtin),add(mode.timerOps),add(mode.portOps),words.length&&(mode.helperType=mimes[0],CodeMirror.registerHelper("hintWords",mimes[0],words));for(var i=0;i<mimes.length;++i)CodeMirror.defineMIME(mimes[i],mode)}CodeMirror.defineMode("ttcn",(function(config,parserConfig){var curPunc,indentUnit=config.indentUnit,keywords=parserConfig.keywords||{},builtin=parserConfig.builtin||{},timerOps=parserConfig.timerOps||{},portOps=parserConfig.portOps||{},configOps=parserConfig.configOps||{},verdictOps=parserConfig.verdictOps||{},sutOps=parserConfig.sutOps||{},functionOps=parserConfig.functionOps||{},verdictConsts=parserConfig.verdictConsts||{},booleanConsts=parserConfig.booleanConsts||{},otherConsts=parserConfig.otherConsts||{},types=parserConfig.types||{},visibilityModifiers=parserConfig.visibilityModifiers||{},templateMatch=parserConfig.templateMatch||{},multiLineStrings=parserConfig.multiLineStrings,indentStatements=!1!==parserConfig.indentStatements,isOperatorChar=/[+\-*&@=<>!\/]/;function tokenBase(stream,state){var ch=stream.next();if('"'==ch||"'"==ch)return state.tokenize=tokenString(ch),state.tokenize(stream,state);if(/[\[\]{}\(\),;\\:\?\.]/.test(ch))return curPunc=ch,"punctuation";if("#"==ch)return stream.skipToEnd(),"atom preprocessor";if("%"==ch)return stream.eatWhile(/\b/),"atom ttcn3Macros";if(/\d/.test(ch))return stream.eatWhile(/[\w\.]/),"number";if("/"==ch){if(stream.eat("*"))return state.tokenize=tokenComment,tokenComment(stream,state);if(stream.eat("/"))return stream.skipToEnd(),"comment"}if(isOperatorChar.test(ch))return"@"==ch&&(stream.match("try")||stream.match("catch")||stream.match("lazy"))?"keyword":(stream.eatWhile(isOperatorChar),"operator");stream.eatWhile(/[\w\$_\xa1-\uffff]/);var cur=stream.current();return keywords.propertyIsEnumerable(cur)?"keyword":builtin.propertyIsEnumerable(cur)?"builtin":timerOps.propertyIsEnumerable(cur)?"def timerOps":configOps.propertyIsEnumerable(cur)?"def configOps":verdictOps.propertyIsEnumerable(cur)?"def verdictOps":portOps.propertyIsEnumerable(cur)?"def portOps":sutOps.propertyIsEnumerable(cur)?"def sutOps":functionOps.propertyIsEnumerable(cur)?"def functionOps":verdictConsts.propertyIsEnumerable(cur)?"string verdictConsts":booleanConsts.propertyIsEnumerable(cur)?"string booleanConsts":otherConsts.propertyIsEnumerable(cur)?"string otherConsts":types.propertyIsEnumerable(cur)?"builtin types":visibilityModifiers.propertyIsEnumerable(cur)?"builtin visibilityModifiers":templateMatch.propertyIsEnumerable(cur)?"atom templateMatch":"variable"}function tokenString(quote){return function(stream,state){for(var next,escaped=!1,end=!1;null!=(next=stream.next());){if(next==quote&&!escaped){var afterQuote=stream.peek();afterQuote&&("b"!=(afterQuote=afterQuote.toLowerCase())&&"h"!=afterQuote&&"o"!=afterQuote||stream.next()),end=!0;break}escaped=!escaped&&"\\"==next}return(end||!escaped&&!multiLineStrings)&&(state.tokenize=null),"string"}}function tokenComment(stream,state){for(var ch,maybeEnd=!1;ch=stream.next();){if("/"==ch&&maybeEnd){state.tokenize=null;break}maybeEnd="*"==ch}return"comment"}function Context(indented,column,type,align,prev){this.indented=indented,this.column=column,this.type=type,this.align=align,this.prev=prev}function pushContext(state,col,type){var indent=state.indented;return state.context&&"statement"==state.context.type&&(indent=state.context.indented),state.context=new Context(indent,col,type,null,state.context)}function popContext(state){var t=state.context.type;return")"!=t&&"]"!=t&&"}"!=t||(state.indented=state.context.indented),state.context=state.context.prev}return{startState:function(basecolumn){return{tokenize:null,context:new Context((basecolumn||0)-indentUnit,0,"top",!1),indented:0,startOfLine:!0}},token:function(stream,state){var ctx=state.context;if(stream.sol()&&(null==ctx.align&&(ctx.align=!1),state.indented=stream.indentation(),state.startOfLine=!0),stream.eatSpace())return null;curPunc=null;var style=(state.tokenize||tokenBase)(stream,state);if("comment"==style)return style;if(null==ctx.align&&(ctx.align=!0),";"!=curPunc&&":"!=curPunc&&","!=curPunc||"statement"!=ctx.type)if("{"==curPunc)pushContext(state,stream.column(),"}");else if("["==curPunc)pushContext(state,stream.column(),"]");else if("("==curPunc)pushContext(state,stream.column(),")");else if("}"==curPunc){for(;"statement"==ctx.type;)ctx=popContext(state);for("}"==ctx.type&&(ctx=popContext(state));"statement"==ctx.type;)ctx=popContext(state)}else curPunc==ctx.type?popContext(state):indentStatements&&(("}"==ctx.type||"top"==ctx.type)&&";"!=curPunc||"statement"==ctx.type&&"newstatement"==curPunc)&&pushContext(state,stream.column(),"statement");else popContext(state);return state.startOfLine=!1,style},electricChars:"{}",blockCommentStart:"/*",blockCommentEnd:"*/",lineComment:"//",fold:"brace"}})),def(["text/x-ttcn","text/x-ttcn3","text/x-ttcnpp"],{name:"ttcn",keywords:words("activate address alive all alt altstep and and4b any break case component const continue control deactivate display do else encode enumerated except exception execute extends extension external for from function goto group if import in infinity inout interleave label language length log match message mixed mod modifies module modulepar mtc noblock not not4b nowait of on optional or or4b out override param pattern port procedure record recursive rem repeat return runs select self sender set signature system template testcase to type union value valueof var variant while with xor xor4b"),builtin:words("bit2hex bit2int bit2oct bit2str char2int char2oct encvalue decomp decvalue float2int float2str hex2bit hex2int hex2oct hex2str int2bit int2char int2float int2hex int2oct int2str int2unichar isbound ischosen ispresent isvalue lengthof log2str oct2bit oct2char oct2hex oct2int oct2str regexp replace rnd sizeof str2bit str2float str2hex str2int str2oct substr unichar2int unichar2char enum2int"),types:words("anytype bitstring boolean char charstring default float hexstring integer objid octetstring universal verdicttype timer"),timerOps:words("read running start stop timeout"),portOps:words("call catch check clear getcall getreply halt raise receive reply send trigger"),configOps:words("create connect disconnect done kill killed map unmap"),verdictOps:words("getverdict setverdict"),sutOps:words("action"),functionOps:words("apply derefers refers"),verdictConsts:words("error fail inconc none pass"),booleanConsts:words("true false"),otherConsts:words("null NULL omit"),visibilityModifiers:words("private public friend"),templateMatch:words("complement ifpresent subset superset permutation"),multiLineStrings:!0})}(__webpack_require__("./node_modules/codemirror/lib/codemirror.js"))}}]);
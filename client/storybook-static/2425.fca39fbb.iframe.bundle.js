(self.webpackChunkbuerli_examples_client=self.webpackChunkbuerli_examples_client||[]).push([[2425,9047,9589],{"./node_modules/codemirror/addon/mode/overlay.js":function(__unused_webpack_module,__unused_webpack_exports,__webpack_require__){!function(CodeMirror){"use strict";CodeMirror.overlayMode=function(base,overlay,combine){return{startState:function(){return{base:CodeMirror.startState(base),overlay:CodeMirror.startState(overlay),basePos:0,baseCur:null,overlayPos:0,overlayCur:null,streamSeen:null}},copyState:function(state){return{base:CodeMirror.copyState(base,state.base),overlay:CodeMirror.copyState(overlay,state.overlay),basePos:state.basePos,baseCur:null,overlayPos:state.overlayPos,overlayCur:null}},token:function(stream,state){return(stream!=state.streamSeen||Math.min(state.basePos,state.overlayPos)<stream.start)&&(state.streamSeen=stream,state.basePos=state.overlayPos=stream.start),stream.start==state.basePos&&(state.baseCur=base.token(stream,state.base),state.basePos=stream.pos),stream.start==state.overlayPos&&(stream.pos=stream.start,state.overlayCur=overlay.token(stream,state.overlay),state.overlayPos=stream.pos),stream.pos=Math.min(state.basePos,state.overlayPos),null==state.overlayCur?state.baseCur:null!=state.baseCur&&state.overlay.combineTokens||combine&&null==state.overlay.combineTokens?state.baseCur+" "+state.overlayCur:state.overlayCur},indent:base.indent&&function(state,textAfter,line){return base.indent(state.base,textAfter,line)},electricChars:base.electricChars,innerMode:function(state){return{state:state.base,mode:base}},blankLine:function(state){var baseToken,overlayToken;return base.blankLine&&(baseToken=base.blankLine(state.base)),overlay.blankLine&&(overlayToken=overlay.blankLine(state.overlay)),null==overlayToken?baseToken:combine&&null!=baseToken?baseToken+" "+overlayToken:overlayToken}}}}(__webpack_require__("./node_modules/codemirror/lib/codemirror.js"))},"./node_modules/codemirror/mode/gfm/gfm.js":function(__unused_webpack_module,__unused_webpack_exports,__webpack_require__){!function(CodeMirror){"use strict";var urlRE=/^((?:(?:aaas?|about|acap|adiumxtra|af[ps]|aim|apt|attachment|aw|beshare|bitcoin|bolo|callto|cap|chrome(?:-extension)?|cid|coap|com-eventbrite-attendee|content|crid|cvs|data|dav|dict|dlna-(?:playcontainer|playsingle)|dns|doi|dtn|dvb|ed2k|facetime|feed|file|finger|fish|ftp|geo|gg|git|gizmoproject|go|gopher|gtalk|h323|hcp|https?|iax|icap|icon|im|imap|info|ipn|ipp|irc[6s]?|iris(?:\.beep|\.lwz|\.xpc|\.xpcs)?|itms|jar|javascript|jms|keyparc|lastfm|ldaps?|magnet|mailto|maps|market|message|mid|mms|ms-help|msnim|msrps?|mtqp|mumble|mupdate|mvn|news|nfs|nih?|nntp|notes|oid|opaquelocktoken|palm|paparazzi|platform|pop|pres|proxy|psyc|query|res(?:ource)?|rmi|rsync|rtmp|rtsp|secondlife|service|session|sftp|sgn|shttp|sieve|sips?|skype|sm[bs]|snmp|soap\.beeps?|soldat|spotify|ssh|steam|svn|tag|teamspeak|tel(?:net)?|tftp|things|thismessage|tip|tn3270|tv|udp|unreal|urn|ut2004|vemmi|ventrilo|view-source|webcal|wss?|wtai|wyciwyg|xcon(?:-userid)?|xfire|xmlrpc\.beeps?|xmpp|xri|ymsgr|z39\.50[rs]?):(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]|\([^\s()<>]*\))+(?:\([^\s()<>]*\)|[^\s`*!()\[\]{};:'".,<>?«»“”‘’]))/i;CodeMirror.defineMode("gfm",(function(config,modeConfig){var codeDepth=0;function blankLine(state){return state.code=!1,null}var gfmOverlay={startState:function(){return{code:!1,codeBlock:!1,ateSpace:!1}},copyState:function(s){return{code:s.code,codeBlock:s.codeBlock,ateSpace:s.ateSpace}},token:function(stream,state){if(state.combineTokens=null,state.codeBlock)return stream.match(/^```+/)?(state.codeBlock=!1,null):(stream.skipToEnd(),null);if(stream.sol()&&(state.code=!1),stream.sol()&&stream.match(/^```+/))return stream.skipToEnd(),state.codeBlock=!0,null;if("`"===stream.peek()){stream.next();var before=stream.pos;stream.eatWhile("`");var difference=1+stream.pos-before;return state.code?difference===codeDepth&&(state.code=!1):(codeDepth=difference,state.code=!0),null}if(state.code)return stream.next(),null;if(stream.eatSpace())return state.ateSpace=!0,null;if((stream.sol()||state.ateSpace)&&(state.ateSpace=!1,!1!==modeConfig.gitHubSpice)){if(stream.match(/^(?:[a-zA-Z0-9\-_]+\/)?(?:[a-zA-Z0-9\-_]+@)?(?=.{0,6}\d)(?:[a-f0-9]{7,40}\b)/))return state.combineTokens=!0,"link";if(stream.match(/^(?:[a-zA-Z0-9\-_]+\/)?(?:[a-zA-Z0-9\-_]+)?#[0-9]+\b/))return state.combineTokens=!0,"link"}return stream.match(urlRE)&&"]("!=stream.string.slice(stream.start-2,stream.start)&&(0==stream.start||/\W/.test(stream.string.charAt(stream.start-1)))?(state.combineTokens=!0,"link"):(stream.next(),null)},blankLine:blankLine},markdownConfig={taskLists:!0,strikethrough:!0,emoji:!0};for(var attr in modeConfig)markdownConfig[attr]=modeConfig[attr];return markdownConfig.name="markdown",CodeMirror.overlayMode(CodeMirror.getMode(config,markdownConfig),gfmOverlay)}),"markdown"),CodeMirror.defineMIME("text/x-gfm","gfm")}(__webpack_require__("./node_modules/codemirror/lib/codemirror.js"),__webpack_require__("./node_modules/codemirror/mode/markdown/markdown.js"),__webpack_require__("./node_modules/codemirror/addon/mode/overlay.js"))},"./node_modules/codemirror/mode/markdown/markdown.js":function(__unused_webpack_module,__unused_webpack_exports,__webpack_require__){!function(CodeMirror){"use strict";CodeMirror.defineMode("markdown",(function(cmCfg,modeCfg){var htmlMode=CodeMirror.getMode(cmCfg,"text/html"),htmlModeMissing="null"==htmlMode.name;function getMode(name){if(CodeMirror.findModeByName){var found=CodeMirror.findModeByName(name);found&&(name=found.mime||found.mimes[0])}var mode=CodeMirror.getMode(cmCfg,name);return"null"==mode.name?null:mode}void 0===modeCfg.highlightFormatting&&(modeCfg.highlightFormatting=!1),void 0===modeCfg.maxBlockquoteDepth&&(modeCfg.maxBlockquoteDepth=0),void 0===modeCfg.taskLists&&(modeCfg.taskLists=!1),void 0===modeCfg.strikethrough&&(modeCfg.strikethrough=!1),void 0===modeCfg.emoji&&(modeCfg.emoji=!1),void 0===modeCfg.fencedCodeBlockHighlighting&&(modeCfg.fencedCodeBlockHighlighting=!0),void 0===modeCfg.fencedCodeBlockDefaultMode&&(modeCfg.fencedCodeBlockDefaultMode="text/plain"),void 0===modeCfg.xml&&(modeCfg.xml=!0),void 0===modeCfg.tokenTypeOverrides&&(modeCfg.tokenTypeOverrides={});var tokenTypes={header:"header",code:"comment",quote:"quote",list1:"variable-2",list2:"variable-3",list3:"keyword",hr:"hr",image:"image",imageAltText:"image-alt-text",imageMarker:"image-marker",formatting:"formatting",linkInline:"link",linkEmail:"link",linkText:"link",linkHref:"string",em:"em",strong:"strong",strikethrough:"strikethrough",emoji:"builtin"};for(var tokenType in tokenTypes)tokenTypes.hasOwnProperty(tokenType)&&modeCfg.tokenTypeOverrides[tokenType]&&(tokenTypes[tokenType]=modeCfg.tokenTypeOverrides[tokenType]);var hrRE=/^([*\-_])(?:\s*\1){2,}\s*$/,listRE=/^(?:[*\-+]|^[0-9]+([.)]))\s+/,taskListRE=/^\[(x| )\](?=\s)/i,atxHeaderRE=modeCfg.allowAtxHeaderWithoutSpace?/^(#+)/:/^(#+)(?: |$)/,setextHeaderRE=/^ {0,3}(?:\={1,}|-{2,})\s*$/,textRE=/^[^#!\[\]*_\\<>` "'(~:]+/,fencedCodeRE=/^(~~~+|```+)[ \t]*([\w\/+#-]*)[^\n`]*$/,linkDefRE=/^\s*\[[^\]]+?\]:.*$/,punctuation=/[!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC9\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDF3C-\uDF3E]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]/,expandedTab="    ";function switchInline(stream,state,f){return state.f=state.inline=f,f(stream,state)}function switchBlock(stream,state,f){return state.f=state.block=f,f(stream,state)}function lineIsEmpty(line){return!line||!/\S/.test(line.string)}function blankLine(state){if(state.linkTitle=!1,state.linkHref=!1,state.linkText=!1,state.em=!1,state.strong=!1,state.strikethrough=!1,state.quote=0,state.indentedCode=!1,state.f==htmlBlock){var exit=htmlModeMissing;if(!exit){var inner=CodeMirror.innerMode(htmlMode,state.htmlState);exit="xml"==inner.mode.name&&null===inner.state.tagStart&&!inner.state.context&&inner.state.tokenize.isInText}exit&&(state.f=inlineNormal,state.block=blockNormal,state.htmlState=null)}return state.trailingSpace=0,state.trailingSpaceNewLine=!1,state.prevLine=state.thisLine,state.thisLine={stream:null},null}function blockNormal(stream,state){var firstTokenOnLine=stream.column()===state.indentation,prevLineLineIsEmpty=lineIsEmpty(state.prevLine.stream),prevLineIsIndentedCode=state.indentedCode,prevLineIsHr=state.prevLine.hr,prevLineIsList=!1!==state.list,maxNonCodeIndentation=(state.listStack[state.listStack.length-1]||0)+3;state.indentedCode=!1;var lineIndentation=state.indentation;if(null===state.indentationDiff&&(state.indentationDiff=state.indentation,prevLineIsList)){for(state.list=null;lineIndentation<state.listStack[state.listStack.length-1];)state.listStack.pop(),state.listStack.length?state.indentation=state.listStack[state.listStack.length-1]:state.list=!1;!1!==state.list&&(state.indentationDiff=lineIndentation-state.listStack[state.listStack.length-1])}var allowsInlineContinuation=!(prevLineLineIsEmpty||prevLineIsHr||state.prevLine.header||prevLineIsList&&prevLineIsIndentedCode||state.prevLine.fencedCodeEnd),isHr=(!1===state.list||prevLineIsHr||prevLineLineIsEmpty)&&state.indentation<=maxNonCodeIndentation&&stream.match(hrRE),match=null;if(state.indentationDiff>=4&&(prevLineIsIndentedCode||state.prevLine.fencedCodeEnd||state.prevLine.header||prevLineLineIsEmpty))return stream.skipToEnd(),state.indentedCode=!0,tokenTypes.code;if(stream.eatSpace())return null;if(firstTokenOnLine&&state.indentation<=maxNonCodeIndentation&&(match=stream.match(atxHeaderRE))&&match[1].length<=6)return state.quote=0,state.header=match[1].length,state.thisLine.header=!0,modeCfg.highlightFormatting&&(state.formatting="header"),state.f=state.inline,getType(state);if(state.indentation<=maxNonCodeIndentation&&stream.eat(">"))return state.quote=firstTokenOnLine?1:state.quote+1,modeCfg.highlightFormatting&&(state.formatting="quote"),stream.eatSpace(),getType(state);if(!isHr&&!state.setext&&firstTokenOnLine&&state.indentation<=maxNonCodeIndentation&&(match=stream.match(listRE))){var listType=match[1]?"ol":"ul";return state.indentation=lineIndentation+stream.current().length,state.list=!0,state.quote=0,state.listStack.push(state.indentation),state.em=!1,state.strong=!1,state.code=!1,state.strikethrough=!1,modeCfg.taskLists&&stream.match(taskListRE,!1)&&(state.taskList=!0),state.f=state.inline,modeCfg.highlightFormatting&&(state.formatting=["list","list-"+listType]),getType(state)}return firstTokenOnLine&&state.indentation<=maxNonCodeIndentation&&(match=stream.match(fencedCodeRE,!0))?(state.quote=0,state.fencedEndRE=new RegExp(match[1]+"+ *$"),state.localMode=modeCfg.fencedCodeBlockHighlighting&&getMode(match[2]||modeCfg.fencedCodeBlockDefaultMode),state.localMode&&(state.localState=CodeMirror.startState(state.localMode)),state.f=state.block=local,modeCfg.highlightFormatting&&(state.formatting="code-block"),state.code=-1,getType(state)):state.setext||!(allowsInlineContinuation&&prevLineIsList||state.quote||!1!==state.list||state.code||isHr||linkDefRE.test(stream.string))&&(match=stream.lookAhead(1))&&(match=match.match(setextHeaderRE))?(state.setext?(state.header=state.setext,state.setext=0,stream.skipToEnd(),modeCfg.highlightFormatting&&(state.formatting="header")):(state.header="="==match[0].charAt(0)?1:2,state.setext=state.header),state.thisLine.header=!0,state.f=state.inline,getType(state)):isHr?(stream.skipToEnd(),state.hr=!0,state.thisLine.hr=!0,tokenTypes.hr):"["===stream.peek()?switchInline(stream,state,footnoteLink):switchInline(stream,state,state.inline)}function htmlBlock(stream,state){var style=htmlMode.token(stream,state.htmlState);if(!htmlModeMissing){var inner=CodeMirror.innerMode(htmlMode,state.htmlState);("xml"==inner.mode.name&&null===inner.state.tagStart&&!inner.state.context&&inner.state.tokenize.isInText||state.md_inside&&stream.current().indexOf(">")>-1)&&(state.f=inlineNormal,state.block=blockNormal,state.htmlState=null)}return style}function local(stream,state){var returnType,currListInd=state.listStack[state.listStack.length-1]||0,hasExitedList=state.indentation<currListInd,maxFencedEndInd=currListInd+3;return state.fencedEndRE&&state.indentation<=maxFencedEndInd&&(hasExitedList||stream.match(state.fencedEndRE))?(modeCfg.highlightFormatting&&(state.formatting="code-block"),hasExitedList||(returnType=getType(state)),state.localMode=state.localState=null,state.block=blockNormal,state.f=inlineNormal,state.fencedEndRE=null,state.code=0,state.thisLine.fencedCodeEnd=!0,hasExitedList?switchBlock(stream,state,state.block):returnType):state.localMode?state.localMode.token(stream,state.localState):(stream.skipToEnd(),tokenTypes.code)}function getType(state){var styles=[];if(state.formatting){styles.push(tokenTypes.formatting),"string"==typeof state.formatting&&(state.formatting=[state.formatting]);for(var i=0;i<state.formatting.length;i++)styles.push(tokenTypes.formatting+"-"+state.formatting[i]),"header"===state.formatting[i]&&styles.push(tokenTypes.formatting+"-"+state.formatting[i]+"-"+state.header),"quote"===state.formatting[i]&&(!modeCfg.maxBlockquoteDepth||modeCfg.maxBlockquoteDepth>=state.quote?styles.push(tokenTypes.formatting+"-"+state.formatting[i]+"-"+state.quote):styles.push("error"))}if(state.taskOpen)return styles.push("meta"),styles.length?styles.join(" "):null;if(state.taskClosed)return styles.push("property"),styles.length?styles.join(" "):null;if(state.linkHref?styles.push(tokenTypes.linkHref,"url"):(state.strong&&styles.push(tokenTypes.strong),state.em&&styles.push(tokenTypes.em),state.strikethrough&&styles.push(tokenTypes.strikethrough),state.emoji&&styles.push(tokenTypes.emoji),state.linkText&&styles.push(tokenTypes.linkText),state.code&&styles.push(tokenTypes.code),state.image&&styles.push(tokenTypes.image),state.imageAltText&&styles.push(tokenTypes.imageAltText,"link"),state.imageMarker&&styles.push(tokenTypes.imageMarker)),state.header&&styles.push(tokenTypes.header,tokenTypes.header+"-"+state.header),state.quote&&(styles.push(tokenTypes.quote),!modeCfg.maxBlockquoteDepth||modeCfg.maxBlockquoteDepth>=state.quote?styles.push(tokenTypes.quote+"-"+state.quote):styles.push(tokenTypes.quote+"-"+modeCfg.maxBlockquoteDepth)),!1!==state.list){var listMod=(state.listStack.length-1)%3;listMod?1===listMod?styles.push(tokenTypes.list2):styles.push(tokenTypes.list3):styles.push(tokenTypes.list1)}return state.trailingSpaceNewLine?styles.push("trailing-space-new-line"):state.trailingSpace&&styles.push("trailing-space-"+(state.trailingSpace%2?"a":"b")),styles.length?styles.join(" "):null}function handleText(stream,state){if(stream.match(textRE,!0))return getType(state)}function inlineNormal(stream,state){var style=state.text(stream,state);if(void 0!==style)return style;if(state.list)return state.list=null,getType(state);if(state.taskList)return" "===stream.match(taskListRE,!0)[1]?state.taskOpen=!0:state.taskClosed=!0,modeCfg.highlightFormatting&&(state.formatting="task"),state.taskList=!1,getType(state);if(state.taskOpen=!1,state.taskClosed=!1,state.header&&stream.match(/^#+$/,!0))return modeCfg.highlightFormatting&&(state.formatting="header"),getType(state);var ch=stream.next();if(state.linkTitle){state.linkTitle=!1;var matchCh=ch;"("===ch&&(matchCh=")");var regex="^\\s*(?:[^"+(matchCh=(matchCh+"").replace(/([.?*+^\[\]\\(){}|-])/g,"\\$1"))+"\\\\]+|\\\\\\\\|\\\\.)"+matchCh;if(stream.match(new RegExp(regex),!0))return tokenTypes.linkHref}if("`"===ch){var previousFormatting=state.formatting;modeCfg.highlightFormatting&&(state.formatting="code"),stream.eatWhile("`");var count=stream.current().length;if(0!=state.code||state.quote&&1!=count){if(count==state.code){var t=getType(state);return state.code=0,t}return state.formatting=previousFormatting,getType(state)}return state.code=count,getType(state)}if(state.code)return getType(state);if("\\"===ch&&(stream.next(),modeCfg.highlightFormatting)){var type=getType(state),formattingEscape=tokenTypes.formatting+"-escape";return type?type+" "+formattingEscape:formattingEscape}if("!"===ch&&stream.match(/\[[^\]]*\] ?(?:\(|\[)/,!1))return state.imageMarker=!0,state.image=!0,modeCfg.highlightFormatting&&(state.formatting="image"),getType(state);if("["===ch&&state.imageMarker&&stream.match(/[^\]]*\](\(.*?\)| ?\[.*?\])/,!1))return state.imageMarker=!1,state.imageAltText=!0,modeCfg.highlightFormatting&&(state.formatting="image"),getType(state);if("]"===ch&&state.imageAltText){modeCfg.highlightFormatting&&(state.formatting="image");var type=getType(state);return state.imageAltText=!1,state.image=!1,state.inline=state.f=linkHref,type}if("["===ch&&!state.image)return state.linkText&&stream.match(/^.*?\]/)||(state.linkText=!0,modeCfg.highlightFormatting&&(state.formatting="link")),getType(state);if("]"===ch&&state.linkText){modeCfg.highlightFormatting&&(state.formatting="link");var type=getType(state);return state.linkText=!1,state.inline=state.f=stream.match(/\(.*?\)| ?\[.*?\]/,!1)?linkHref:inlineNormal,type}if("<"===ch&&stream.match(/^(https?|ftps?):\/\/(?:[^\\>]|\\.)+>/,!1))return state.f=state.inline=linkInline,modeCfg.highlightFormatting&&(state.formatting="link"),(type=getType(state))?type+=" ":type="",type+tokenTypes.linkInline;if("<"===ch&&stream.match(/^[^> \\]+@(?:[^\\>]|\\.)+>/,!1))return state.f=state.inline=linkInline,modeCfg.highlightFormatting&&(state.formatting="link"),(type=getType(state))?type+=" ":type="",type+tokenTypes.linkEmail;if(modeCfg.xml&&"<"===ch&&stream.match(/^(!--|\?|!\[CDATA\[|[a-z][a-z0-9-]*(?:\s+[a-z_:.\-]+(?:\s*=\s*[^>]+)?)*\s*(?:>|$))/i,!1)){var end=stream.string.indexOf(">",stream.pos);if(-1!=end){var atts=stream.string.substring(stream.start,end);/markdown\s*=\s*('|"){0,1}1('|"){0,1}/.test(atts)&&(state.md_inside=!0)}return stream.backUp(1),state.htmlState=CodeMirror.startState(htmlMode),switchBlock(stream,state,htmlBlock)}if(modeCfg.xml&&"<"===ch&&stream.match(/^\/\w*?>/))return state.md_inside=!1,"tag";if("*"===ch||"_"===ch){for(var len=1,before=1==stream.pos?" ":stream.string.charAt(stream.pos-2);len<3&&stream.eat(ch);)len++;var after=stream.peek()||" ",leftFlanking=!/\s/.test(after)&&(!punctuation.test(after)||/\s/.test(before)||punctuation.test(before)),rightFlanking=!/\s/.test(before)&&(!punctuation.test(before)||/\s/.test(after)||punctuation.test(after)),setEm=null,setStrong=null;if(len%2&&(state.em||!leftFlanking||"*"!==ch&&rightFlanking&&!punctuation.test(before)?state.em!=ch||!rightFlanking||"*"!==ch&&leftFlanking&&!punctuation.test(after)||(setEm=!1):setEm=!0),len>1&&(state.strong||!leftFlanking||"*"!==ch&&rightFlanking&&!punctuation.test(before)?state.strong!=ch||!rightFlanking||"*"!==ch&&leftFlanking&&!punctuation.test(after)||(setStrong=!1):setStrong=!0),null!=setStrong||null!=setEm)return modeCfg.highlightFormatting&&(state.formatting=null==setEm?"strong":null==setStrong?"em":"strong em"),!0===setEm&&(state.em=ch),!0===setStrong&&(state.strong=ch),t=getType(state),!1===setEm&&(state.em=!1),!1===setStrong&&(state.strong=!1),t}else if(" "===ch&&(stream.eat("*")||stream.eat("_"))){if(" "===stream.peek())return getType(state);stream.backUp(1)}if(modeCfg.strikethrough)if("~"===ch&&stream.eatWhile(ch)){if(state.strikethrough)return modeCfg.highlightFormatting&&(state.formatting="strikethrough"),t=getType(state),state.strikethrough=!1,t;if(stream.match(/^[^\s]/,!1))return state.strikethrough=!0,modeCfg.highlightFormatting&&(state.formatting="strikethrough"),getType(state)}else if(" "===ch&&stream.match("~~",!0)){if(" "===stream.peek())return getType(state);stream.backUp(2)}if(modeCfg.emoji&&":"===ch&&stream.match(/^(?:[a-z_\d+][a-z_\d+-]*|\-[a-z_\d+][a-z_\d+-]*):/)){state.emoji=!0,modeCfg.highlightFormatting&&(state.formatting="emoji");var retType=getType(state);return state.emoji=!1,retType}return" "===ch&&(stream.match(/^ +$/,!1)?state.trailingSpace++:state.trailingSpace&&(state.trailingSpaceNewLine=!0)),getType(state)}function linkInline(stream,state){if(">"===stream.next()){state.f=state.inline=inlineNormal,modeCfg.highlightFormatting&&(state.formatting="link");var type=getType(state);return type?type+=" ":type="",type+tokenTypes.linkInline}return stream.match(/^[^>]+/,!0),tokenTypes.linkInline}function linkHref(stream,state){if(stream.eatSpace())return null;var ch=stream.next();return"("===ch||"["===ch?(state.f=state.inline=getLinkHrefInside("("===ch?")":"]"),modeCfg.highlightFormatting&&(state.formatting="link-string"),state.linkHref=!0,getType(state)):"error"}var linkRE={")":/^(?:[^\\\(\)]|\\.|\((?:[^\\\(\)]|\\.)*\))*?(?=\))/,"]":/^(?:[^\\\[\]]|\\.|\[(?:[^\\\[\]]|\\.)*\])*?(?=\])/};function getLinkHrefInside(endChar){return function(stream,state){if(stream.next()===endChar){state.f=state.inline=inlineNormal,modeCfg.highlightFormatting&&(state.formatting="link-string");var returnState=getType(state);return state.linkHref=!1,returnState}return stream.match(linkRE[endChar]),state.linkHref=!0,getType(state)}}function footnoteLink(stream,state){return stream.match(/^([^\]\\]|\\.)*\]:/,!1)?(state.f=footnoteLinkInside,stream.next(),modeCfg.highlightFormatting&&(state.formatting="link"),state.linkText=!0,getType(state)):switchInline(stream,state,inlineNormal)}function footnoteLinkInside(stream,state){if(stream.match("]:",!0)){state.f=state.inline=footnoteUrl,modeCfg.highlightFormatting&&(state.formatting="link");var returnType=getType(state);return state.linkText=!1,returnType}return stream.match(/^([^\]\\]|\\.)+/,!0),tokenTypes.linkText}function footnoteUrl(stream,state){return stream.eatSpace()?null:(stream.match(/^[^\s]+/,!0),void 0===stream.peek()?state.linkTitle=!0:stream.match(/^(?:\s+(?:"(?:[^"\\]|\\.)+"|'(?:[^'\\]|\\.)+'|\((?:[^)\\]|\\.)+\)))?/,!0),state.f=state.inline=inlineNormal,tokenTypes.linkHref+" url")}var mode={startState:function(){return{f:blockNormal,prevLine:{stream:null},thisLine:{stream:null},block:blockNormal,htmlState:null,indentation:0,inline:inlineNormal,text:handleText,formatting:!1,linkText:!1,linkHref:!1,linkTitle:!1,code:0,em:!1,strong:!1,header:0,setext:0,hr:!1,taskList:!1,list:!1,listStack:[],quote:0,trailingSpace:0,trailingSpaceNewLine:!1,strikethrough:!1,emoji:!1,fencedEndRE:null}},copyState:function(s){return{f:s.f,prevLine:s.prevLine,thisLine:s.thisLine,block:s.block,htmlState:s.htmlState&&CodeMirror.copyState(htmlMode,s.htmlState),indentation:s.indentation,localMode:s.localMode,localState:s.localMode?CodeMirror.copyState(s.localMode,s.localState):null,inline:s.inline,text:s.text,formatting:!1,linkText:s.linkText,linkTitle:s.linkTitle,linkHref:s.linkHref,code:s.code,em:s.em,strong:s.strong,strikethrough:s.strikethrough,emoji:s.emoji,header:s.header,setext:s.setext,hr:s.hr,taskList:s.taskList,list:s.list,listStack:s.listStack.slice(0),quote:s.quote,indentedCode:s.indentedCode,trailingSpace:s.trailingSpace,trailingSpaceNewLine:s.trailingSpaceNewLine,md_inside:s.md_inside,fencedEndRE:s.fencedEndRE}},token:function(stream,state){if(state.formatting=!1,stream!=state.thisLine.stream){if(state.header=0,state.hr=!1,stream.match(/^\s*$/,!0))return blankLine(state),null;if(state.prevLine=state.thisLine,state.thisLine={stream:stream},state.taskList=!1,state.trailingSpace=0,state.trailingSpaceNewLine=!1,!state.localState&&(state.f=state.block,state.f!=htmlBlock)){var indentation=stream.match(/^\s*/,!0)[0].replace(/\t/g,expandedTab).length;if(state.indentation=indentation,state.indentationDiff=null,indentation>0)return null}}return state.f(stream,state)},innerMode:function(state){return state.block==htmlBlock?{state:state.htmlState,mode:htmlMode}:state.localState?{state:state.localState,mode:state.localMode}:{state:state,mode:mode}},indent:function(state,textAfter,line){return state.block==htmlBlock&&htmlMode.indent?htmlMode.indent(state.htmlState,textAfter,line):state.localState&&state.localMode.indent?state.localMode.indent(state.localState,textAfter,line):CodeMirror.Pass},blankLine:blankLine,getType:getType,blockCommentStart:"\x3c!--",blockCommentEnd:"--\x3e",closeBrackets:"()[]{}''\"\"``",fold:"markdown"};return mode}),"xml"),CodeMirror.defineMIME("text/markdown","markdown"),CodeMirror.defineMIME("text/x-markdown","markdown")}(__webpack_require__("./node_modules/codemirror/lib/codemirror.js"),__webpack_require__("./node_modules/codemirror/mode/xml/xml.js"),__webpack_require__("./node_modules/codemirror/mode/meta.js"))},"./node_modules/codemirror/mode/xml/xml.js":function(__unused_webpack_module,__unused_webpack_exports,__webpack_require__){!function(CodeMirror){"use strict";var htmlConfig={autoSelfClosers:{area:!0,base:!0,br:!0,col:!0,command:!0,embed:!0,frame:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0,menuitem:!0},implicitlyClosed:{dd:!0,li:!0,optgroup:!0,option:!0,p:!0,rp:!0,rt:!0,tbody:!0,td:!0,tfoot:!0,th:!0,tr:!0},contextGrabbers:{dd:{dd:!0,dt:!0},dt:{dd:!0,dt:!0},li:{li:!0},option:{option:!0,optgroup:!0},optgroup:{optgroup:!0},p:{address:!0,article:!0,aside:!0,blockquote:!0,dir:!0,div:!0,dl:!0,fieldset:!0,footer:!0,form:!0,h1:!0,h2:!0,h3:!0,h4:!0,h5:!0,h6:!0,header:!0,hgroup:!0,hr:!0,menu:!0,nav:!0,ol:!0,p:!0,pre:!0,section:!0,table:!0,ul:!0},rp:{rp:!0,rt:!0},rt:{rp:!0,rt:!0},tbody:{tbody:!0,tfoot:!0},td:{td:!0,th:!0},tfoot:{tbody:!0},th:{td:!0,th:!0},thead:{tbody:!0,tfoot:!0},tr:{tr:!0}},doNotIndent:{pre:!0},allowUnquoted:!0,allowMissing:!0,caseFold:!0},xmlConfig={autoSelfClosers:{},implicitlyClosed:{},contextGrabbers:{},doNotIndent:{},allowUnquoted:!1,allowMissing:!1,allowMissingTagName:!1,caseFold:!1};CodeMirror.defineMode("xml",(function(editorConf,config_){var type,setStyle,indentUnit=editorConf.indentUnit,config={},defaults=config_.htmlMode?htmlConfig:xmlConfig;for(var prop in defaults)config[prop]=defaults[prop];for(var prop in config_)config[prop]=config_[prop];function inText(stream,state){function chain(parser){return state.tokenize=parser,parser(stream,state)}var ch=stream.next();return"<"==ch?stream.eat("!")?stream.eat("[")?stream.match("CDATA[")?chain(inBlock("atom","]]>")):null:stream.match("--")?chain(inBlock("comment","--\x3e")):stream.match("DOCTYPE",!0,!0)?(stream.eatWhile(/[\w\._\-]/),chain(doctype(1))):null:stream.eat("?")?(stream.eatWhile(/[\w\._\-]/),state.tokenize=inBlock("meta","?>"),"meta"):(type=stream.eat("/")?"closeTag":"openTag",state.tokenize=inTag,"tag bracket"):"&"==ch?(stream.eat("#")?stream.eat("x")?stream.eatWhile(/[a-fA-F\d]/)&&stream.eat(";"):stream.eatWhile(/[\d]/)&&stream.eat(";"):stream.eatWhile(/[\w\.\-:]/)&&stream.eat(";"))?"atom":"error":(stream.eatWhile(/[^&<]/),null)}function inTag(stream,state){var ch=stream.next();if(">"==ch||"/"==ch&&stream.eat(">"))return state.tokenize=inText,type=">"==ch?"endTag":"selfcloseTag","tag bracket";if("="==ch)return type="equals",null;if("<"==ch){state.tokenize=inText,state.state=baseState,state.tagName=state.tagStart=null;var next=state.tokenize(stream,state);return next?next+" tag error":"tag error"}return/[\'\"]/.test(ch)?(state.tokenize=inAttribute(ch),state.stringStartCol=stream.column(),state.tokenize(stream,state)):(stream.match(/^[^\s\u00a0=<>\"\']*[^\s\u00a0=<>\"\'\/]/),"word")}function inAttribute(quote){var closure=function(stream,state){for(;!stream.eol();)if(stream.next()==quote){state.tokenize=inTag;break}return"string"};return closure.isInAttribute=!0,closure}function inBlock(style,terminator){return function(stream,state){for(;!stream.eol();){if(stream.match(terminator)){state.tokenize=inText;break}stream.next()}return style}}function doctype(depth){return function(stream,state){for(var ch;null!=(ch=stream.next());){if("<"==ch)return state.tokenize=doctype(depth+1),state.tokenize(stream,state);if(">"==ch){if(1==depth){state.tokenize=inText;break}return state.tokenize=doctype(depth-1),state.tokenize(stream,state)}}return"meta"}}function Context(state,tagName,startOfLine){this.prev=state.context,this.tagName=tagName||"",this.indent=state.indented,this.startOfLine=startOfLine,(config.doNotIndent.hasOwnProperty(tagName)||state.context&&state.context.noIndent)&&(this.noIndent=!0)}function popContext(state){state.context&&(state.context=state.context.prev)}function maybePopContext(state,nextTagName){for(var parentTagName;;){if(!state.context)return;if(parentTagName=state.context.tagName,!config.contextGrabbers.hasOwnProperty(parentTagName)||!config.contextGrabbers[parentTagName].hasOwnProperty(nextTagName))return;popContext(state)}}function baseState(type,stream,state){return"openTag"==type?(state.tagStart=stream.column(),tagNameState):"closeTag"==type?closeTagNameState:baseState}function tagNameState(type,stream,state){return"word"==type?(state.tagName=stream.current(),setStyle="tag",attrState):config.allowMissingTagName&&"endTag"==type?(setStyle="tag bracket",attrState(type,stream,state)):(setStyle="error",tagNameState)}function closeTagNameState(type,stream,state){if("word"==type){var tagName=stream.current();return state.context&&state.context.tagName!=tagName&&config.implicitlyClosed.hasOwnProperty(state.context.tagName)&&popContext(state),state.context&&state.context.tagName==tagName||!1===config.matchClosing?(setStyle="tag",closeState):(setStyle="tag error",closeStateErr)}return config.allowMissingTagName&&"endTag"==type?(setStyle="tag bracket",closeState(type,stream,state)):(setStyle="error",closeStateErr)}function closeState(type,_stream,state){return"endTag"!=type?(setStyle="error",closeState):(popContext(state),baseState)}function closeStateErr(type,stream,state){return setStyle="error",closeState(type,stream,state)}function attrState(type,_stream,state){if("word"==type)return setStyle="attribute",attrEqState;if("endTag"==type||"selfcloseTag"==type){var tagName=state.tagName,tagStart=state.tagStart;return state.tagName=state.tagStart=null,"selfcloseTag"==type||config.autoSelfClosers.hasOwnProperty(tagName)?maybePopContext(state,tagName):(maybePopContext(state,tagName),state.context=new Context(state,tagName,tagStart==state.indented)),baseState}return setStyle="error",attrState}function attrEqState(type,stream,state){return"equals"==type?attrValueState:(config.allowMissing||(setStyle="error"),attrState(type,stream,state))}function attrValueState(type,stream,state){return"string"==type?attrContinuedState:"word"==type&&config.allowUnquoted?(setStyle="string",attrState):(setStyle="error",attrState(type,stream,state))}function attrContinuedState(type,stream,state){return"string"==type?attrContinuedState:attrState(type,stream,state)}return inText.isInText=!0,{startState:function(baseIndent){var state={tokenize:inText,state:baseState,indented:baseIndent||0,tagName:null,tagStart:null,context:null};return null!=baseIndent&&(state.baseIndent=baseIndent),state},token:function(stream,state){if(!state.tagName&&stream.sol()&&(state.indented=stream.indentation()),stream.eatSpace())return null;type=null;var style=state.tokenize(stream,state);return(style||type)&&"comment"!=style&&(setStyle=null,state.state=state.state(type||style,stream,state),setStyle&&(style="error"==setStyle?style+" error":setStyle)),style},indent:function(state,textAfter,fullLine){var context=state.context;if(state.tokenize.isInAttribute)return state.tagStart==state.indented?state.stringStartCol+1:state.indented+indentUnit;if(context&&context.noIndent)return CodeMirror.Pass;if(state.tokenize!=inTag&&state.tokenize!=inText)return fullLine?fullLine.match(/^(\s*)/)[0].length:0;if(state.tagName)return!1!==config.multilineTagIndentPastTag?state.tagStart+state.tagName.length+2:state.tagStart+indentUnit*(config.multilineTagIndentFactor||1);if(config.alignCDATA&&/<!\[CDATA\[/.test(textAfter))return 0;var tagAfter=textAfter&&/^<(\/)?([\w_:\.-]*)/.exec(textAfter);if(tagAfter&&tagAfter[1])for(;context;){if(context.tagName==tagAfter[2]){context=context.prev;break}if(!config.implicitlyClosed.hasOwnProperty(context.tagName))break;context=context.prev}else if(tagAfter)for(;context;){var grabbers=config.contextGrabbers[context.tagName];if(!grabbers||!grabbers.hasOwnProperty(tagAfter[2]))break;context=context.prev}for(;context&&context.prev&&!context.startOfLine;)context=context.prev;return context?context.indent+indentUnit:state.baseIndent||0},electricInput:/<\/[\s\w:]+>$/,blockCommentStart:"\x3c!--",blockCommentEnd:"--\x3e",configuration:config.htmlMode?"html":"xml",helperType:config.htmlMode?"html":"xml",skipAttribute:function(state){state.state==attrValueState&&(state.state=attrState)},xmlCurrentTag:function(state){return state.tagName?{name:state.tagName,close:"closeTag"==state.type}:null},xmlCurrentContext:function(state){for(var context=[],cx=state.context;cx;cx=cx.prev)context.push(cx.tagName);return context.reverse()}}})),CodeMirror.defineMIME("text/xml","xml"),CodeMirror.defineMIME("application/xml","xml"),CodeMirror.mimeModes.hasOwnProperty("text/html")||CodeMirror.defineMIME("text/html",{name:"xml",htmlMode:!0})}(__webpack_require__("./node_modules/codemirror/lib/codemirror.js"))}}]);
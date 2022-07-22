(self.webpackChunkbuerli_examples_client=self.webpackChunkbuerli_examples_client||[]).push([[2372],{"./node_modules/codemirror/mode/scheme/scheme.js":function(__unused_webpack_module,__unused_webpack_exports,__webpack_require__){!function(CodeMirror){"use strict";CodeMirror.defineMode("scheme",(function(){var BUILTIN="builtin",COMMENT="comment",STRING="string",ATOM="atom",NUMBER="number",BRACKET="bracket",INDENT_WORD_SKIP=2;function makeKeywords(str){for(var obj={},words=str.split(" "),i=0;i<words.length;++i)obj[words[i]]=!0;return obj}var keywords=makeKeywords("λ case-lambda call/cc class cond-expand define-class define-values exit-handler field import inherit init-field interface let*-values let-values let/ec mixin opt-lambda override protect provide public rename require require-for-syntax syntax syntax-case syntax-error unit/sig unless when with-syntax and begin call-with-current-continuation call-with-input-file call-with-output-file case cond define define-syntax define-macro defmacro delay do dynamic-wind else for-each if lambda let let* let-syntax letrec letrec-syntax map or syntax-rules abs acos angle append apply asin assoc assq assv atan boolean? caar cadr call-with-input-file call-with-output-file call-with-values car cdddar cddddr cdr ceiling char->integer char-alphabetic? char-ci<=? char-ci<? char-ci=? char-ci>=? char-ci>? char-downcase char-lower-case? char-numeric? char-ready? char-upcase char-upper-case? char-whitespace? char<=? char<? char=? char>=? char>? char? close-input-port close-output-port complex? cons cos current-input-port current-output-port denominator display eof-object? eq? equal? eqv? eval even? exact->inexact exact? exp expt #f floor force gcd imag-part inexact->exact inexact? input-port? integer->char integer? interaction-environment lcm length list list->string list->vector list-ref list-tail list? load log magnitude make-polar make-rectangular make-string make-vector max member memq memv min modulo negative? newline not null-environment null? number->string number? numerator odd? open-input-file open-output-file output-port? pair? peek-char port? positive? procedure? quasiquote quote quotient rational? rationalize read read-char real-part real? remainder reverse round scheme-report-environment set! set-car! set-cdr! sin sqrt string string->list string->number string->symbol string-append string-ci<=? string-ci<? string-ci=? string-ci>=? string-ci>? string-copy string-fill! string-length string-ref string-set! string<=? string<? string=? string>=? string>? string? substring symbol->string symbol? #t tan transcript-off transcript-on truncate values vector vector->list vector-fill! vector-length vector-ref vector-set! with-input-from-file with-output-to-file write write-char zero?"),indentKeys=makeKeywords("define let letrec let* lambda define-macro defmacro let-syntax letrec-syntax let-values let*-values define-syntax syntax-rules define-values when unless");function stateStack(indent,type,prev){this.indent=indent,this.type=type,this.prev=prev}function pushStack(state,indent,type){state.indentStack=new stateStack(indent,type,state.indentStack)}function popStack(state){state.indentStack=state.indentStack.prev}var binaryMatcher=new RegExp(/^(?:[-+]i|[-+][01]+#*(?:\/[01]+#*)?i|[-+]?[01]+#*(?:\/[01]+#*)?@[-+]?[01]+#*(?:\/[01]+#*)?|[-+]?[01]+#*(?:\/[01]+#*)?[-+](?:[01]+#*(?:\/[01]+#*)?)?i|[-+]?[01]+#*(?:\/[01]+#*)?)(?=[()\s;"]|$)/i),octalMatcher=new RegExp(/^(?:[-+]i|[-+][0-7]+#*(?:\/[0-7]+#*)?i|[-+]?[0-7]+#*(?:\/[0-7]+#*)?@[-+]?[0-7]+#*(?:\/[0-7]+#*)?|[-+]?[0-7]+#*(?:\/[0-7]+#*)?[-+](?:[0-7]+#*(?:\/[0-7]+#*)?)?i|[-+]?[0-7]+#*(?:\/[0-7]+#*)?)(?=[()\s;"]|$)/i),hexMatcher=new RegExp(/^(?:[-+]i|[-+][\da-f]+#*(?:\/[\da-f]+#*)?i|[-+]?[\da-f]+#*(?:\/[\da-f]+#*)?@[-+]?[\da-f]+#*(?:\/[\da-f]+#*)?|[-+]?[\da-f]+#*(?:\/[\da-f]+#*)?[-+](?:[\da-f]+#*(?:\/[\da-f]+#*)?)?i|[-+]?[\da-f]+#*(?:\/[\da-f]+#*)?)(?=[()\s;"]|$)/i),decimalMatcher=new RegExp(/^(?:[-+]i|[-+](?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*)i|[-+]?(?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*)@[-+]?(?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*)|[-+]?(?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*)[-+](?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*)?i|(?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*))(?=[()\s;"]|$)/i);function isBinaryNumber(stream){return stream.match(binaryMatcher)}function isOctalNumber(stream){return stream.match(octalMatcher)}function isDecimalNumber(stream,backup){return!0===backup&&stream.backUp(1),stream.match(decimalMatcher)}function isHexNumber(stream){return stream.match(hexMatcher)}return{startState:function(){return{indentStack:null,indentation:0,mode:!1,sExprComment:!1,sExprQuote:!1}},token:function(stream,state){if(null==state.indentStack&&stream.sol()&&(state.indentation=stream.indentation()),stream.eatSpace())return null;var returnType=null;switch(state.mode){case"string":for(var escaped=!1;null!=(next=stream.next());){if('"'==next&&!escaped){state.mode=!1;break}escaped=!escaped&&"\\"==next}returnType=STRING;break;case"comment":for(var next,maybeEnd=!1;null!=(next=stream.next());){if("#"==next&&maybeEnd){state.mode=!1;break}maybeEnd="|"==next}returnType=COMMENT;break;case"s-expr-comment":if(state.mode=!1,"("!=stream.peek()&&"["!=stream.peek()){stream.eatWhile(/[^\s\(\)\[\]]/),returnType=COMMENT;break}state.sExprComment=0;default:var ch=stream.next();if('"'==ch)state.mode="string",returnType=STRING;else if("'"==ch)"("==stream.peek()||"["==stream.peek()?("number"!=typeof state.sExprQuote&&(state.sExprQuote=0),returnType=ATOM):(stream.eatWhile(/[\w_\-!$%&*+\.\/:<=>?@\^~]/),returnType=ATOM);else if("#"==ch)if(stream.eat("|"))state.mode="comment",returnType=COMMENT;else if(stream.eat(/[tf]/i))returnType=ATOM;else if(stream.eat(";"))state.mode="s-expr-comment",returnType=COMMENT;else{var numTest=null,hasExactness=!1,hasRadix=!0;stream.eat(/[ei]/i)?hasExactness=!0:stream.backUp(1),stream.match(/^#b/i)?numTest=isBinaryNumber:stream.match(/^#o/i)?numTest=isOctalNumber:stream.match(/^#x/i)?numTest=isHexNumber:stream.match(/^#d/i)?numTest=isDecimalNumber:stream.match(/^[-+0-9.]/,!1)?(hasRadix=!1,numTest=isDecimalNumber):hasExactness||stream.eat("#"),null!=numTest&&(hasRadix&&!hasExactness&&stream.match(/^#[ei]/i),numTest(stream)&&(returnType=NUMBER))}else if(/^[-+0-9.]/.test(ch)&&isDecimalNumber(stream,!0))returnType=NUMBER;else if(";"==ch)stream.skipToEnd(),returnType=COMMENT;else if("("==ch||"["==ch){for(var letter,keyWord="",indentTemp=stream.column();null!=(letter=stream.eat(/[^\s\(\[\;\)\]]/));)keyWord+=letter;keyWord.length>0&&indentKeys.propertyIsEnumerable(keyWord)?pushStack(state,indentTemp+INDENT_WORD_SKIP,ch):(stream.eatSpace(),stream.eol()||";"==stream.peek()?pushStack(state,indentTemp+1,ch):pushStack(state,indentTemp+stream.current().length,ch)),stream.backUp(stream.current().length-1),"number"==typeof state.sExprComment&&state.sExprComment++,"number"==typeof state.sExprQuote&&state.sExprQuote++,returnType=BRACKET}else")"==ch||"]"==ch?(returnType=BRACKET,null!=state.indentStack&&state.indentStack.type==(")"==ch?"(":"[")&&(popStack(state),"number"==typeof state.sExprComment&&0==--state.sExprComment&&(returnType=COMMENT,state.sExprComment=!1),"number"==typeof state.sExprQuote&&0==--state.sExprQuote&&(returnType=ATOM,state.sExprQuote=!1))):(stream.eatWhile(/[\w_\-!$%&*+\.\/:<=>?@\^~]/),returnType=keywords&&keywords.propertyIsEnumerable(stream.current())?BUILTIN:"variable")}return"number"==typeof state.sExprComment?COMMENT:"number"==typeof state.sExprQuote?ATOM:returnType},indent:function(state){return null==state.indentStack?state.indentation:state.indentStack.indent},closeBrackets:{pairs:'()[]{}""'},lineComment:";;"}})),CodeMirror.defineMIME("text/x-scheme","scheme")}(__webpack_require__("./node_modules/codemirror/lib/codemirror.js"))}}]);
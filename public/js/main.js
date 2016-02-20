/*
Mithril v0.2.2-rc.1
http://mithril.js.org
(c) 2014-2015 Leo Horie
License: MIT
*/
var m=function a(b,c){"use strict";function d(a){return"function"==typeof a}function e(a){return"[object Object]"===qb.call(a)}function f(a){return"[object String]"===qb.call(a)}function g(a){kb=a.document,lb=a.location,nb=a.cancelAnimationFrame||a.clearTimeout,mb=a.requestAnimationFrame||a.setTimeout}function h(a,b){for(var c=[],d=1;d<arguments.length;d++)c[d-1]=arguments[d];if(e(a))return V(a,c);var g,h=null!=b&&e(b)&&!("tag"in b||"view"in b||"subtree"in b),i=h?b:{},j="class"in i?"class":"className",k={tag:"div",attrs:{}},l=[];if(!f(a))throw new Error("selector in m(selector, attrs, children) should be a string");for(;null!=(g=rb.exec(a));)if(""===g[1]&&g[2])k.tag=g[2];else if("#"===g[1])k.attrs.id=g[2];else if("."===g[1])l.push(g[2]);else if("["===g[3][0]){var m=sb.exec(g[3]);k.attrs[m[1]]=m[3]||(m[2]?"":!0)}var n=h?c.slice(1):c;k.children=1===n.length&&pb(n[0])?n[0]:n;for(var o in i)i.hasOwnProperty(o)&&(o===j&&null!=i[o]&&""!==i[o]?(l.push(i[o]),k.attrs[o]=""):k.attrs[o]=i[o]);return l.length&&(k.attrs[j]=l.join(" ")),k}function i(a,b){for(var c=0;c<a.length&&!b(a[c],c++););}function j(a,b){i(a,function(a,c){return(a=a&&a.attrs)&&null!=a.key&&b(a,c)})}function k(a){try{if(null==a||null==a.toString())return""}catch(b){return""}return a}function l(a,b,c,d){try{n(a,b,c),b.nodeValue=d}catch(e){}}function m(a){for(var b=0;b<a.length;b++)pb(a[b])&&(a=a.concat.apply([],a),b--);return a}function n(a,b,c){a.insertBefore(b,a.childNodes[c]||null)}function o(a,b,c,d){j(a,function(a,d){b[a=a.key]=b[a]?{action:yb,index:d,from:b[a].index,element:c.nodes[b[a].index]||kb.createElement("div")}:{action:xb,index:d}});var e=[];for(var f in b)e.push(b[f]);var g=e.sort(N),h=new Array(c.length);return h.nodes=c.nodes.slice(),i(g,function(b){var e=b.index;if(b.action===wb&&(P(c[e].nodes,c[e]),h.splice(e,1)),b.action===xb){var f=kb.createElement("div");f.key=a[e].attrs.key,n(d,f,e),h.splice(e,0,{attrs:{key:a[e].attrs.key},nodes:[f]}),h.nodes[e]=f}if(b.action===yb){var g=b.element,i=d.childNodes[e];i!==g&&null!==g&&d.insertBefore(g,i||null),h[e]=c[b.from],h.nodes[e]=g}}),h}function p(a,b,c,d){var e=a.length!==b.length;return e||j(a,function(a,c){var d=b[c];return e=d&&d.attrs&&d.attrs.key!==a.key}),e?o(a,c,b,d):b}function q(a,b,c){i(a,function(a,d){null!=b[d]&&c.push.apply(c,b[d].nodes)}),i(b.nodes,function(a,d){null!=a.parentNode&&c.indexOf(a)<0&&P([a],[b[d]])}),a.length<b.length&&(b.length=a.length),b.nodes=c}function r(a){var b=0;j(a,function(){return i(a,function(a){(a=a&&a.attrs)&&null==a.key&&(a.key="__mithril__"+b++)}),1})}function s(a,b,c){(a.tag!==b.tag||c.sort().join()!==Object.keys(b.attrs).sort().join()||a.attrs.id!==b.attrs.id||a.attrs.key!==b.attrs.key||"all"===h.redraw.strategy()&&(!b.configContext||b.configContext.retain!==!0)||"diff"===h.redraw.strategy()&&b.configContext&&b.configContext.retain===!1)&&(b.nodes.length&&P(b.nodes),b.configContext&&d(b.configContext.onunload)&&b.configContext.onunload(),b.controllers&&i(b.controllers,function(a){a.unload&&a.onunload({preventDefault:ub})}))}function t(a,b){return a.attrs.xmlns?a.attrs.xmlns:"svg"===a.tag?"http://www.w3.org/2000/svg":"math"===a.tag?"http://www.w3.org/1998/Math/MathML":b}function u(a,b,c){c.length&&(a.views=b,a.controllers=c,i(c,function(a){if(a.onunload&&a.onunload.$old&&(a.onunload=a.onunload.$old),Ob&&a.onunload){var b=a.onunload;a.onunload=ub,a.onunload.$old=b}}))}function v(a,b,c,e,f){if(d(b.attrs.config)){var g=f.configContext=f.configContext||{};a.push(function(){return b.attrs.config.call(b,c,!e,g,f)})}}function w(a,b,d,e,f,g,h,i){var j=a.nodes[0];return e&&O(j,b.tag,b.attrs,a.attrs,f),a.children=M(j,b.tag,c,c,b.children,a.children,!1,0,b.attrs.contenteditable?j:d,f,h),a.nodes.intact=!0,i.length&&(a.views=g,a.controllers=i),j}function x(a,b,c){var d;a.$trusted?d=R(b,c,a):(d=[kb.createTextNode(a)],b.nodeName.match(tb)||n(b,d[0],c));var e="string"==typeof a||"number"==typeof a||"boolean"==typeof a?new a.constructor(a):a;return e.nodes=d,e}function y(a,b,c,d,e,f){var g=b.nodes;return d&&d===kb.activeElement||(a.$trusted?(P(g,b),g=R(c,e,a)):"textarea"===f?c.value=a:d?d.innerHTML=a:((1===g[0].nodeType||g.length>1||g[0].nodeValue.trim&&!g[0].nodeValue.trim())&&(P(b.nodes,b),g=[kb.createTextNode(a)]),l(c,g[0],e,a))),b=new a.constructor(a),b.nodes=g,b}function z(a,b,c,d,e,f,g){return 0===a.nodes.length?x(b,d,c):a.valueOf()!==b.valueOf()||e===!0?y(b,a,d,f,c,g):(a.nodes.intact=!0,a)}function A(a){if(a.$trusted){var b=a.match(/<[^\/]|\>\s*[^<]/g);if(null!=b)return b.length}else if(pb(a))return a.length;return 1}function B(a,b,d,e,f,g,h,i,k){a=m(a);var l=[],n=b.length===a.length,o=0,s={},t=!1;j(b,function(a,c){t=!0,s[b[c].attrs.key]={action:wb,index:c}}),r(a),t&&(b=p(a,b,s,d));for(var u=0,v=0,w=a.length;w>v;v++){var x=M(d,f,b,e,a[v],b[u],g,e+o||o,h,i,k);x!==c&&(n=n&&x.nodes.intact,o+=A(x),b[u++]=x)}return n||q(a,b,l),b}function C(a,b,c,d,e){if(null!=b){if(qb.call(b)===qb.call(a))return b;if(e&&e.nodes){var f=c-d,g=f+(pb(a)?a:b.nodes).length;P(e.nodes.slice(f,g),e.slice(f,g))}else b.nodes&&P(b.nodes,b)}return b=new a.constructor,b.tag&&(b={}),b.nodes=[],b}function D(a,b){return b===c?a.attrs.is?kb.createElement(a.tag,a.attrs.is):kb.createElement(a.tag):a.attrs.is?kb.createElementNS(b,a.tag,a.attrs.is):kb.createElementNS(b,a.tag)}function E(a,b,c,d){return d?O(b,a.tag,a.attrs,{},c):a.attrs}function F(a,b,d,e,f,g){return null!=a.children&&a.children.length>0?M(b,a.tag,c,c,a.children,d.children,!0,0,a.attrs.contenteditable?b:e,f,g):a.children}function G(a,b,c,d,e,f,g){var h={tag:a.tag,attrs:b,children:c,nodes:[d]};return u(h,f,g),h.children&&!h.children.nodes&&(h.children.nodes=[]),"select"===a.tag&&"value"in a.attrs&&O(d,a.tag,{value:a.attrs.value},{},e),h}function H(a,b,c,d){var e="diff"===h.redraw.strategy()&&a?a.indexOf(b):-1;return e>-1?c[e]:"function"==typeof d?new d:{}}function I(a,b,c,d){null!=d.onunload&&Kb.push({controller:d,handler:d.onunload}),a.push(c),b.push(d)}function J(a,b,c,d,e,f){var g=H(c.views,b,d,a.controller),h=+(a&&a.attrs&&a.attrs.key);return a=0===Ob||Nb||d&&d.indexOf(g)>-1?a.view(g):{tag:"placeholder"},"retain"===a.subtree?c:(h===h&&((a.attrs=a.attrs||{}).key=h),I(f,e,b,g),a)}function K(a,b,c,d){for(var e=b&&b.controllers;null!=a.view;)a=J(a,a.view.$original||a.view,b,e,d,c);return a}function L(a,b,c,d,e,g,h,i){var j=[],k=[];if(a=K(a,b,j,k),!a.tag&&k.length)throw new Error("Component template must return a virtual element, not an array, string, etc.");a.attrs=a.attrs||{},b.attrs=b.attrs||{};var l=Object.keys(a.attrs),m=l.length>("key"in a.attrs?1:0);if(s(a,b,l),f(a.tag)){var o=0===b.nodes.length;h=t(a,h);var p;if(o){p=D(a,h);var q=E(a,p,h,m),r=F(a,p,b,c,h,i);b=G(a,q,r,p,h,j,k)}else p=w(b,a,c,m,h,j,i,k);return(o||g===!0&&null!=p)&&n(d,p,e),v(i,a,p,o,b),b}}function M(a,b,c,f,g,h,i,j,l,m,n){return g=k(g),"retain"===g.subtree?h:(h=C(g,h,j,f,c),pb(g)?B(g,h,a,j,b,i,l,m,n):null!=g&&e(g)?L(g,h,l,a,j,i,m,n):d(g)?h:z(h,g,j,a,i,l,b))}function N(a,b){return a.action-b.action||a.index-b.index}function O(a,b,c,f,g){for(var h in c){var i=c[h],j=f[h];if(h in f&&j===i)"value"===h&&"input"===b&&a.value!=i&&(a.value=i);else{f[h]=i;try{if("config"===h||"key"===h)continue;if(d(i)&&"on"===h.slice(0,2))a[h]=S(i,a);else if("style"===h&&null!=i&&e(i)){for(var k in i)(null==j||j[k]!==i[k])&&(a.style[k]=i[k]);for(var k in j)k in i||(a.style[k]="")}else null!=g?"href"===h?a.setAttributeNS("http://www.w3.org/1999/xlink","href",i):a.setAttribute("className"===h?"class":h,i):h in a&&"list"!==h&&"style"!==h&&"form"!==h&&"type"!==h&&"width"!==h&&"height"!==h?("input"!==b||a[h]!==i)&&(a[h]=i):a.setAttribute(h,i)}catch(l){if(l.message.indexOf("Invalid argument")<0)throw l}}}return f}function P(a,b){for(var c=a.length-1;c>-1;c--)if(a[c]&&a[c].parentNode){try{a[c].parentNode.removeChild(a[c])}catch(d){}b=[].concat(b),b[c]&&Q(b[c])}a.length&&(a.length=0)}function Q(a){a.configContext&&d(a.configContext.onunload)&&(a.configContext.onunload(),a.configContext.onunload=null),a.controllers&&i(a.controllers,function(a){d(a.onunload)&&a.onunload({preventDefault:ub})}),a.children&&(pb(a.children)?i(a.children,Q):a.children.tag&&Q(a.children))}function R(a,c,d){var e=a.childNodes[c];if(e){var f=1!==e.nodeType,g=kb.createElement("span");f?(a.insertBefore(g,e||null),g.insertAdjacentHTML("beforebegin",d),a.removeChild(g)):e.insertAdjacentHTML("beforebegin",d)}else b.Range&&b.Range.prototype.createContextualFragment?a.appendChild(kb.createRange().createContextualFragment(d)):a.insertAdjacentHTML("beforeend",d);for(var h=[];a.childNodes[c]!==e;)h.push(a.childNodes[c]),c++;return h}function S(a,b){return function(c){c=c||event,h.redraw.strategy("diff"),h.startComputation();try{return a.call(b,c)}finally{Y()}}}function T(a){var b=Ab.indexOf(a);return 0>b?Ab.push(a)-1:b}function U(a){var b=function(){return arguments.length&&(a=arguments[0]),a};return b.toJSON=function(){return a},b}function V(a,b){var c=function(){return(a.controller||ub).apply(this,b)||this};a.controller&&(c.prototype=a.controller.prototype);var d=function(c){var d=arguments.length>1?b.concat([].slice.call(arguments,1)):b;return a.view.apply(a,d?[c].concat(d):[c])};d.$original=a.view;var e={controller:c,view:d};return b[0]&&null!=b[0].key&&(e.attrs={key:b[0].key}),e}function W(a,b){Db.splice(b,1),Fb.splice(b,1),Eb.splice(b,1),db(a),Ab.splice(T(a),1)}function X(){Ib&&(Ib(),Ib=null),i(Db,function(a,b){var c=Eb[b];if(Fb[b]){var d=[Fb[b]];h.render(a,c.view?c.view(Fb[b],d):"")}}),Jb&&(Jb(),Jb=null),Gb=null,Hb=new Date,h.redraw.strategy("diff")}function Y(){"none"===h.redraw.strategy()?(Ob--,h.redraw.strategy("diff")):h.endComputation()}function Z(a){return a.slice(Rb[h.route.mode].length)}function $(a,b,c){Pb={};var d=c.indexOf("?");-1!==d&&(Pb=cb(c.substr(d+1,c.length)),c=c.substr(0,d));var e=Object.keys(b),f=e.indexOf(c);if(-1!==f)return h.mount(a,b[e[f]]),!0;for(var g in b){if(g===c)return h.mount(a,b[g]),!0;var j=new RegExp("^"+g.replace(/:[^\/]+?\.{3}/g,"(.*?)").replace(/:[^\/]+/g,"([^\\/]+)")+"/?$");if(j.test(c))return c.replace(j,function(){var c=g.match(/:[^\/]+/g)||[],d=[].slice.call(arguments,1,-2);i(c,function(a,b){Pb[a.replace(/:|\./g,"")]=decodeURIComponent(d[b])}),h.mount(a,b[g])}),!0}}function _(a){if(a=a||event,!a.ctrlKey&&!a.metaKey&&2!==a.which){a.preventDefault?a.preventDefault():a.returnValue=!1;for(var b=a.currentTarget||a.srcElement,c="pathname"===h.route.mode&&b.search?cb(b.search.slice(1)):{};b&&"A"!==b.nodeName.toUpperCase();)b=b.parentNode;Ob=0,h.route(b[h.route.mode].slice(Rb[h.route.mode].length),c)}}function ab(){"hash"!==h.route.mode&&lb.hash?lb.hash=lb.hash:b.scrollTo(0,0)}function bb(a,b){var d={},f=[];for(var g in a){var h=b?b+"["+g+"]":g,j=a[g];if(null===j)f.push(encodeURIComponent(h));else if(e(j))f.push(bb(j,h));else if(pb(j)){var k=[];d[h]=d[h]||{},i(j,function(a){d[h][a]||(d[h][a]=!0,k.push(encodeURIComponent(h)+"="+encodeURIComponent(a)))}),f.push(k.join("&"))}else j!==c&&f.push(encodeURIComponent(h)+"="+encodeURIComponent(j))}return f.join("&")}function cb(a){if(""===a||null==a)return{};"?"===a.charAt(0)&&(a=a.slice(1));var b=a.split("&"),c={};return i(b,function(a){var b=a.split("="),d=decodeURIComponent(b[0]),e=2===b.length?decodeURIComponent(b[1]):null;null!=c[d]?(pb(c[d])||(c[d]=[c[d]]),c[d].push(e)):c[d]=e}),c}function db(a){var b=T(a);P(a.childNodes,Bb[b]),Bb[b]=c}function eb(a,b){var c=h.prop(b);return a.then(c),c.then=function(c,d){return eb(a.then(c,d),b)},c["catch"]=c.then.bind(null,null),c}function fb(a,b){function c(a){n=a||l,p.map(function(a){n===k?a.resolve(o):a.reject(o)})}function f(a,b,c,f){if((null!=o&&e(o)||d(o))&&d(a))try{var g=0;a.call(o,function(a){g++||(o=a,b())},function(a){g++||(o=a,c())})}catch(i){h.deferred.onerror(i),o=i,c()}else f()}function g(){var e;try{e=o&&o.then}catch(l){return h.deferred.onerror(l),o=l,n=j,g()}n===j&&h.deferred.onerror(o),f(e,function(){n=i,g()},function(){n=j,g()},function(){try{n===i&&d(a)?o=a(o):n===j&&d(b)&&(o=b(o),n=i)}catch(g){return h.deferred.onerror(g),o=g,c()}o===m?(o=TypeError(),c()):f(e,function(){c(k)},c,function(){c(n===i&&k)})})}var i=1,j=2,k=3,l=4,m=this,n=0,o=0,p=[];m.promise={},m.resolve=function(a){return n||(o=a,n=i,g()),this},m.reject=function(a){return n||(o=a,n=j,g()),this},m.promise.then=function(a,b){var c=new fb(a,b);return n===k?c.resolve(o):n===l?c.reject(o):p.push(c),c.promise}}function gb(a){return a}function hb(a){if(!a.dataType||"jsonp"!==a.dataType.toLowerCase()){var e=new b.XMLHttpRequest;if(e.open(a.method,a.url,!0,a.user,a.password),e.onreadystatechange=function(){4===e.readyState&&(e.status>=200&&e.status<300?a.onload({type:"load",target:e}):a.onerror({type:"error",target:e}))},a.serialize===JSON.stringify&&a.data&&"GET"!==a.method&&e.setRequestHeader("Content-Type","application/json; charset=utf-8"),a.deserialize===JSON.parse&&e.setRequestHeader("Accept","application/json, text/*"),d(a.config)){var g=a.config(e,a);null!=g&&(e=g)}var h="GET"!==a.method&&a.data?a.data:"";if(h&&!f(h)&&h.constructor!==b.FormData)throw new Error("Request data should be either be a string or FormData. Check the `serialize` option in `m.request`");return e.send(h),e}var i="mithril_callback_"+(new Date).getTime()+"_"+Math.round(1e16*Math.random()).toString(36),j=kb.createElement("script");b[i]=function(d){j.parentNode.removeChild(j),a.onload({type:"load",target:{responseText:d}}),b[i]=c},j.onerror=function(){return j.parentNode.removeChild(j),a.onerror({type:"error",target:{status:500,responseText:JSON.stringify({error:"Error making jsonp request"})}}),b[i]=c,!1},j.onload=function(){return!1},j.src=a.url+(a.url.indexOf("?")>0?"&":"?")+(a.callbackKey?a.callbackKey:"callback")+"="+i+"&"+bb(a.data||{}),kb.body.appendChild(j)}function ib(a,b,c){if("GET"===a.method&&"jsonp"!==a.dataType){var d=a.url.indexOf("?")<0?"?":"&",e=bb(b);a.url=a.url+(e?d+e:"")}else a.data=c(b);return a}function jb(a,b){var c=a.match(/:[a-z]\w+/gi);return c&&b&&i(c,function(c){var d=c.slice(1);a=a.replace(c,b[d]),delete b[d]}),a}var kb,lb,mb,nb,ob="v0.2.2-rc.1",pb=Array.isArray||function(a){return"[object Array]"===qb.call(a)},qb={}.toString,rb=/(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g,sb=/\[(.+?)(?:=("|'|)(.*?)\2)?\]/,tb=/^(AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TRACK|WBR)$/,ub=function(){};g(b),h.version=function(){return ob};var vb,wb=1,xb=2,yb=3,zb={appendChild:function(a){vb===c&&(vb=kb.createElement("html")),kb.documentElement&&kb.documentElement!==a?kb.replaceChild(a,kb.documentElement):kb.appendChild(a),this.childNodes=kb.childNodes},insertBefore:function(a){this.appendChild(a)},childNodes:[]},Ab=[],Bb={};h.render=function(a,b,d){var e=[];if(!a)throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.");var f=T(a),g=a===kb,h=g||a===kb.documentElement?zb:a;g&&"html"!==b.tag&&(b={tag:"html",attrs:{},children:b}),Bb[f]===c&&P(h.childNodes),d===!0&&db(a),Bb[f]=M(h,null,c,c,b,Bb[f],!1,0,null,c,e),i(e,function(a){a()})},h.trust=function(a){return a=new String(a),a.$trusted=!0,a},h.prop=function(a){return(null!=a&&e(a)||d(a))&&d(a.then)?eb(a):U(a)};var Cb,Db=[],Eb=[],Fb=[],Gb=null,Hb=0,Ib=null,Jb=null,Kb=[],Lb=16;h.component=function(a){for(var b=[],c=1;c<arguments.length;c++)b.push(arguments[c]);return V(a,b)},h.mount=h.module=function(a,b){if(!a)throw new Error("Please ensure the DOM element exists before rendering a template into it.");var c=Db.indexOf(a);0>c&&(c=Db.length);var e=!1,f={preventDefault:function(){e=!0,Ib=Jb=null}};i(Kb,function(a){a.handler.call(a.controller,f),a.controller.onunload=null}),e?i(Kb,function(a){a.controller.onunload=a.handler}):Kb=[],Fb[c]&&d(Fb[c].onunload)&&Fb[c].onunload(f);var g=null===b;if(!e){h.redraw.strategy("all"),h.startComputation(),Db[c]=a;var j=Cb=b?b:b={controller:ub},k=new(b.controller||ub);return j===Cb&&(Fb[c]=k,Eb[c]=b),Y(),g&&W(a,c),Fb[c]}g&&W(a,c)};var Mb=!1,Nb=!1;h.redraw=function(a){if(!Mb){Mb=!0,a&&(Nb=!0);try{Gb&&!a?(mb===b.requestAnimationFrame||new Date-Hb>Lb)&&(Gb>0&&nb(Gb),Gb=mb(X,Lb)):(X(),Gb=mb(function(){Gb=null},Lb))}finally{Mb=Nb=!1}}},h.redraw.strategy=h.prop();var Ob=0;h.startComputation=function(){Ob++},h.endComputation=function(){Ob>1?Ob--:(Ob=0,h.redraw())},h.withAttr=function(a,b,c){return function(d){d=d||event;var e=d.currentTarget||this,f=c||this;b.call(f,a in e?e[a]:e.getAttribute(a))}};var Pb,Qb,Rb={pathname:"",hash:"#",search:"?"},Sb=ub,Tb=!1;return h.route=function(a,c,d,e){if(0===arguments.length)return Qb;if(3===arguments.length&&f(c)){Sb=function(b){var e=Qb=Z(b);if(!$(a,d,e)){if(Tb)throw new Error("Ensure the default route matches one of the routes defined in m.route");Tb=!0,h.route(c,!0),Tb=!1}};var g="hash"===h.route.mode?"onhashchange":"onpopstate";b[g]=function(){var a=lb[h.route.mode];"pathname"===h.route.mode&&(a+=lb.search),Qb!==Z(a)&&Sb(a)},Ib=ab,b[g]()}else if(a.addEventListener||a.attachEvent)a.href=("pathname"!==h.route.mode?lb.pathname:"")+Rb[h.route.mode]+e.attrs.href,a.addEventListener?(a.removeEventListener("click",_),a.addEventListener("click",_)):(a.detachEvent("onclick",_),a.attachEvent("onclick",_));else if(f(a)){var i=Qb;Qb=a;var j=c||{},k=Qb.indexOf("?"),l=k>-1?cb(Qb.slice(k+1)):{};for(var m in j)l[m]=j[m];var n=bb(l),o=k>-1?Qb.slice(0,k):Qb;n&&(Qb=o+(-1===o.indexOf("?")?"?":"&")+n);var p=(3===arguments.length?d:c)===!0||i===a;b.history.pushState?(Ib=ab,Jb=function(){b.history[p?"replaceState":"pushState"](null,kb.title,Rb[h.route.mode]+Qb)},Sb(Rb[h.route.mode]+Qb)):(lb[h.route.mode]=Qb,Sb(Rb[h.route.mode]+Qb))}},h.route.param=function(a){if(!Pb)throw new Error("You must call m.route(element, defaultRoute, routes) before calling m.route.param()");return a?Pb[a]:Pb},h.route.mode="search",h.route.buildQueryString=bb,h.route.parseQueryString=cb,h.deferred=function(){var a=new fb;return a.promise=eb(a.promise),a},h.deferred.onerror=function(a){if("[object Error]"===qb.call(a)&&!a.constructor.toString().match(/ Error/))throw Ob=0,a},h.sync=function(a){function b(a,b){return function(g){return f[a]=g,b||(c="reject"),0===--e&&(d.promise(f),d[c](f)),g}}var c="resolve",d=h.deferred(),e=a.length,f=new Array(e);return a.length>0?i(a,function(a,c){a.then(b(c,!0),b(c,!1))}):d.resolve([]),d.promise},h.request=function(a){a.background!==!0&&h.startComputation();var b=new fb,c=a.dataType&&"jsonp"===a.dataType.toLowerCase(),d=a.serialize=c?gb:a.serialize||JSON.stringify,e=a.deserialize=c?gb:a.deserialize||JSON.parse,f=c?function(a){return a.responseText}:a.extract||function(a){return 0===a.responseText.length&&e===JSON.parse?null:a.responseText};return a.method=(a.method||"GET").toUpperCase(),a.url=jb(a.url,a.data),a=ib(a,a.data,d),a.onload=a.onerror=function(c){try{c=c||event;var d=("load"===c.type?a.unwrapSuccess:a.unwrapError)||gb,g=d(e(f(c.target,a)),c.target);"load"===c.type?(pb(g)&&a.type?i(g,function(b,c){g[c]=new a.type(b)}):a.type&&(g=new a.type(g)),b.resolve(g)):b.reject(g),b["load"===c.type?"resolve":"reject"](g)}catch(c){b.reject(c)}finally{a.background!==!0&&h.endComputation()}},hb(a),b.promise=eb(b.promise,a.initialValue),b.promise},h.deps=function(a){return g(b=a||b),b},h.deps.factory=a,h}("undefined"!=typeof window?window:{});"object"==typeof module&&null!=module&&module.exports?module.exports=m:"function"==typeof define&&define.amd&&define(function(){return m});
(function(abot) {
window.addEventListener("load", function() {
	m.route.mode = "pathname"
	m.route(document.body, "/", {
		"/": abot.Index,
		"/help": abot.AskForHelp,
		"/guides": abot.Guides,
		"/guides/getting_started": abot.GuidesGettingStarted,
		"/guides/advanced_packages": abot.GuidesAdvancedPackages,
		"/guides/contributing": abot.GuidesContributing,
	})
})
})(!window.abot ? window.abot={} : window.abot);
(function(abot) {
abot.AskForHelp = {}
abot.AskForHelp.view = function() {
	return m(".main", [
		m.component(abot.Header),
		m(".content", [
			m("h1", "Ask for help"),
			m("ul", [
				m("li", [
					m("a[href=https://groups.google.com/forum/#!forum/abot-discussion]", "Join our discussion mailing group:"),
					" You'll speak directly to core contributors who can help you with any problems you have."
				]),
				m("li", [
					m("a[href=https://bugzilla.itsabot.org/]", "Report a bug:"),
					" We'll get back to you quickly with a timeline and let you know when a fix will be available."
				]),
				m("li", [
					m("a[href=mailto:admin@itsabot.org]", "Report a security vulnerability:"),
					" If you discover a security vulnerability, please do not email the discussion group or post on Bugzilla. Instead, please email the founder directly through ",
					m("a[href=mailto:admin@itsabot.org]", "admin@itsabot.org"),
					".",
				]),
			]),
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
(function(abot) {
abot.GuidesAdvancedPackages = {}
abot.GuidesAdvancedPackages.view = function() {
	return m(".main", [
		m.component(abot.Header),
		m(".content", [
			m("h1", "Advanced Packages"),
			m("p", "This guide teaches advanced package development features."),
			m("p", "You'll learn:"),
			m("ul", [
				m("li", "How to set up and use a state machine."),
				m("li", "How to respond to keywords alongside a state machine."),
				m("li", "How to integrate an external service."),
				m("li", "How to handle branching conversations."),
			]),

			m("h2", "Setting up a state machine"),
			m("p", [
				"A state machine is the core of any package, so first let's ",
			]),
			m("p", "Generally, a state machine is a great tool to manage a user's progression in a converstation from some start to some end, such as "),
			m("ul", [
				m("li", [
					m("a[href=https://tour.golang.org/basics/1]", "A Tour of Go"),
				]),
				m("li", [
					m("a[href=http://openmymind.net/assets/go/go.pdf]", "The Little Go Book"),
				]),
			]),
			m("p", [
				"If you at any time get stuck or need help with Abot, feel free to message ",
				m("a[href=mailto:abot-discussion@googlegroups.com]", "abot-discussion@googlegroups.com"),
				" and someone will help you right away.",
			]),

			m("h2", "What is Abot?"),
			m("p", "Abot is a digital assistant framework written in the Go programming language. It's designed to make it possible for anyone to build and customize digital assistants for themselves and for their businesses, whether that's a computer that answers phones and intelligently routes calls, schedules your business travel, or is just a better take on Siri that orders Ubers and does your laundry."),
			m("p", "Abot exposes a simple HTTP API, so you can easily connect it to send, process, and respond to texts, emails, and more."),

			m("h2", "Downloading, installing and running an Abot server"),
			m("p", "Ensure you've installed Go and PostgreSQL is running, then open your terminal and type:"),
			m("code", [
				m(".line", "$ git clone git@www.itsabot.org:abot.git"),
				m(".line", "$ cd abot"),
				m(".line", "$ createdb abot"),
				m(".line", "$ chmod +x cmd/*.sh"),
				m(".line", "$ cmd/migrateup.sh"),
			]),
			m("p", "This will download Abot and set up your database. Then run:"),
			m("code", [
				m(".line", "$ go install ./..."),
				m(".line", "$ abot -s"),
			]),
			m("p", [
				"to start your server. The ",
				m("span.code-inline", "-s"),
				" flag stands for \"server\", and it will run by default on port 4200, though that can be set through the PORT environment variable.",
			]),
			m("p", [
				"To communicate with Abot locally, talk to her using ",
				m("span.code-inline", "abotc"),
				", the Abot console. In another terminal (ensure ",
				m("span.code-inline", "abot -s"),
				" is still running), type:"
			]),
			m("code", [
				m(".line", "$ abotc localhost:4200 +13105555555"),
				m(".line", "> Hi"),
				m(".line", "Hi there!"),
			]),
			m("p", "You should see Abot's response! Go ahead and play around with some commands to get a feel for Abot's default behaviors:"),
			m("ol", [
				m("li", "Find me a nice, French wine"),
				m("li", "What's a good restaurant nearby?"),
				m("li", "My car broke down!"),
			]),
			m("p", "In the next 40 minutes, you'll learn how to customize these commands, integrate with SMS, and create your own."),

			m("h2", "Understanding how Abot works"),
			m("p", "For every message Abot receives, Abot processes, routes, and responds to the message. Actually deciding what to say is the role of packages. Let's take a look at an example:"),
			m("p", [
				m("strong", "1. User sends a message via the console, SMS, email, etc.: "), 
				m("div", "Show me Indian restaurants nearby."),
			]),
			m("p", [
				m("strong", "2. Abot pre-processes the message:"),
				m("div", [
					"Commands: ", m("span.code-inline", "[Show]"),
				]),
				m("div", [
					"Objects: ", m("span.code-inline", "[me, Indian restaurants nearby]"),
				]),
			]),
			m("p", [
				m("strong", "3. Abot routes the message to the correct package:"),
				m("div", [
					"Route: ", m("span.code-inline", "find_indian"),
				]),
				m("div", [
					"Package: ", m("span.code-inline", "ava_restaurant"),
				]),
			]),
			m("p", [
				m("strong", "4. The package generates a response:"),
				m("div", " Sure, how does Newab of India sound? It's nearby."),
			]),
			m("p", [
				m("strong", "5. Abot sends the response to the user."),
				m("div", "Abot sends the response through the same channel the user chose, so if the user sends Abot a text, Abot will respond in text automatically."),
			]),
			m("p", "Thus, every message goes from User -> Abot -> Package -> Abot -> User."),

			m(".card-right", [
				m("p.card", [
					m("strong", "What are packages? "),
					"Packages are tiny executable servers written in Go. When Abot boots, it starts every package listed in your ",
					m("span.code-inline", "packages.json"),
					" file. Abot provides all the tools you need to quickly and easily write these packages through its shared library, which we'll learn about in a bit.",
				]),
			]),

			m("h2", "Your first package"),
			m("p", "Let's build a \"Hello World\" package, which will introduce you to the package API. First, let's create our package directory:"),
			m("code", [
				m(".line", "$ mkdir packages/abot_hello"),
			]),
			m("p", [
				"Now let's take a look at the contents of a simple package. You should download and copy this working version and save it to packages/abot_hello/",
				// TODO
				m("a[href=http://pastebin.com/raw/zPY2sTuT]", "abot_hello.go"),
				". Be sure to read through the comments in the file, as the comments will explain the API as its introduced and used.",
			]),
			m("h3", "Package Setup"),
			m("p", [
				"At this point, you've downloaded the complete Hello World package from above (",
				m("a[href=http://pastebin.com/raw/zPY2sTuT]", "abot_hello.go"),
				") and saved it to packages/abot_hello/abot_hello.go. Let's ensure that Abot knows about the new package by adding it to the packages.json file.",
			]),
			m("pre", [
				m("code", [
					'{\n',
					'	"name": "abot",\n',
					'	"version": "0.0.1",\n',
					'	"dependencies": {\n',
					'		"abot_hello": "*"\n',
					'	}\n',
					'}',
				]),
			]),
			m("p", "Now we'll recompile and install Abot and run it. From your terminal, type:"),
			m("code", [
				"$ go install ./... && abot -s",
			]),
			m("p", "You should see Abot boot with a line or two mentioning our new package, abot_hello. Let's test it out. Open another terminal while abot -s is still running, and type:"),
			m("code", [
				m(".line", "$ abotc localhost:4200 +13105555555"),
				m(".line", "> Say something"),
				m(".line", "Hello World!"),
			]),
			m("p", "Abot just routed your message to the package based on the trigger defined in our abot_hello.go. The state machine told it to respond with \"Hello World!\" when it entered its first state, and since there were no other states, that state is replayed every time a new message matching abot_hello.go's trigger is sent to Abot. Now let's try to connect Abot to SMS, so it responds to our text messages."),
			
			m("h2", "Configuring SMS"),
			m("p", "Abot makes it easy to add support for multiple communication tools, including SMS, phone, email, Slack, etc. In this guide, we'll learn how to set up SMS, so we can communicate with this new digital assistant via text messages."),
			m("p", "First we'll need an SMS provider. We'll use Twilio, but you can use any provider with some modifications to Abot's code."),
			m("p", [
				"Sign up for Twilio here: ",
				m("a[href=https://www.twilio.com/]", "https://www.twilio.com/"),
				". Take note of your assigned account SID, auth token, and Twilio phone number. You'll want to set the following environment variables in your ~/.bash_profile or ~/.bashrc:",
			]),
			m("code", [
				m(".line", "export TWILIO_ACCOUNT_SID=\"REPLACE\""),
				m(".line", "export TWILIO_AUTH_TOKEN=\"REPLACE\""),
				m(".line", "export TWILIO_PHONE=\"REPLACE\""),
			]),
			m("p", "Be sure your TWILIO_PHONE is in the form of +13105551234. The leading plus symbol is required."),
			m("p", "In order to communicate with Abot over SMS, Twilio has to be able to reach Abot, but until this point, we've been testing Abot locally on your machine--and Twilio has no way to reach that. Thus, we'll deploy Abot to make it accessible to the world."),

			m("h2", "Deploying your Abot"),
			m("p", [
				"For this guide we'll deploy to Heroku to keep things simple, but Go and Abot make it easy to deploy on any web server. To learn about deploying a Go project on Heroku, first familiarize yourself with this tutorial from Heroku: ",
				m("a[href=https://devcenter.heroku.com/articles/getting-started-with-go]", "Getting Started with Go on Heroku"),
				". Once you have a grasp of what we're doing, open a terminal and run:",
			]),
			m("code", [
				m(".line", "heroku create"),
				m(".line", "heroku config:set TWILIO_ACCOUNT_SID=REPLACE \\"),
				m(".line", "TWILIO_AUTH_TOKEN=REPLACE \\"),
				m(".line", "TWILIO_PHONE=REPLACE"),
				m(".line", "heroku addons:create heroku-postgresql:hobby-dev --version 9.5"),
				m(".line", "heroku pg:psql < db/migrations/up/*.sql"),
				m(".line", "git push heroku master"),
				m(".line", "heroku open"),
			]),
			m("p", [
				"Be sure to replace REPLACE above with your values from before. If everything booted correctly, you'll see the \"Congratulations, you're running Abot!\" screen. If not, you can track down any issues with ",
				m("span.code-inline", "heroku logs --tail"),
				".",
			]),

			m("h2", "Testing out Abot"),
			m("p", [
				"To try Abot, let's first create an Abot account. Go to the site (",
				m("span.code-inline", "heroku open"),
				") and click on Sign Up in the header at the top right. When entering your phone number, be sure to enter it in the format of +13105551234, or Twilio will reject it.",
			]),
			m("p", "Once you've signed up, send Abot a text at your TWILIO_PHONE number from before:"),
			m("code", "Say hi"),
			m("p", "Sometimes responses via Twilio take a few seconds, but you should get a reply back soon,"),
			m("code", "Hello World!"),

			m("h2", "Next steps"),
			m("p", "As next steps, try:"),
			m("ul", [
				m("li", m("a[href=#/]", "Building advanced packages")),
				m("li", [
					"Learning ",
					m("a[href=#/]", "How to Contribute")
				]),
				m("li", [
					"See what's on our ",
					m("a[href=#/]", "Roadmap")
				]),
			])
		])
	])
}
})(!window.abot ? window.abot={} : window.abot);
(function(abot) {
abot.GuidesContributing = {}
abot.GuidesContributing.view = function() {
	return m(".main", [
		m.component(abot.Header),
		m(".content", [
			m("h1", "How to contribute"),
			m("h2", "Contributor's workflow"),
			m("p", "Unlike many open-source projects, we've "),

			m("h2", "Abot core and packages"),
			m("p", "If you build a great package that could help others, send a . This constitutes anything in the Abot repo."),
		]),
	])
}
})(!window.abot ? window.abot={} : window.abot);
(function(abot) {
abot.GuidesGettingStarted = {}
abot.GuidesGettingStarted.view = function() {
	return m(".main", [
		m.component(abot.Header),
		m(".content", [
			m("h1", "Getting Started"),
			m("p", "This guide covers setting up and running Abot."),
			m("p", "You'll learn:"),
			m("ul", [
				m("li", "How to install Abot and connect your assistant to a database."),
				m("li", "How Abot thinks and processes messages."),
				m("li", "How to build a simple package for Abot."),
			]),
			m("p", [
				"But before we begin, it's pronounced ",
				m("em", "Eh-Bot"),
				", like the Canadians, not ",
				m("em", "uh-bot."),
			]),

			m("h2", "Guide assumptions"),
			m("p", [
				"This guide is designed for developers that want to build a digital assistant from scratch. It does not assume any prior experience with Abot or A.I. or machine learning. Abot is a digital assistant framework built using the ",
				m("a[href=https://golang.org/]", "Go programming language"),
				". To learn Go, please read through some of the available resources:",
			]),
			m("ul", [
				m("li", [
					m("a[href=https://tour.golang.org/basics/1]", "A Tour of Go"),
				]),
				m("li", [
					m("a[href=http://openmymind.net/assets/go/go.pdf]", "The Little Go Book"),
				]),
			]),
			m("p", [
				"If you at any time get stuck or need help with Abot, feel free to message ",
				m("a[href=mailto:abot-discussion@googlegroups.com]", "abot-discussion@googlegroups.com"),
				" and someone will help you right away.",
			]),

			m("h2", "What is Abot?"),
			m("p", "Abot is a digital assistant framework written in the Go programming language. It's designed to make it possible for anyone to build and customize digital assistants for themselves and for their businesses, whether that's a computer that answers phones and intelligently routes calls, schedules your business travel, or is just a better take on Siri that orders Ubers and does your laundry."),
			m("p", "Abot exposes a simple HTTP API, so you can easily connect it to send, process, and respond to texts, emails, and more."),

			m("h2", "Downloading, installing and running an Abot server"),
			m("p", "Ensure you've installed Go and PostgreSQL is running, then open your terminal and type:"),
			m("code", [
				m(".line", "$ git clone git@www.itsabot.org:abot.git"),
				m(".line", "$ cd abot"),
				m(".line", "$ createdb abot"),
				m(".line", "$ chmod +x cmd/*.sh"),
				m(".line", "$ cmd/migrateup.sh"),
			]),
			m("p", "This will download Abot and set up your database. Then run:"),
			m("code", [
				m(".line", "$ go install ./..."),
				m(".line", "$ abot -s"),
			]),
			m("p", [
				"to start your server. The ",
				m("span.code-inline", "-s"),
				" flag stands for \"server\", and it will run by default on port 4200, though that can be set through the PORT environment variable.",
			]),
			m("p", [
				"To communicate with Abot locally, talk to her using ",
				m("span.code-inline", "abotc"),
				", the Abot console. In another terminal (ensure ",
				m("span.code-inline", "abot -s"),
				" is still running), type:"
			]),
			m("code", [
				m(".line", "$ abotc localhost:4200 +13105555555"),
				m(".line", "> Hi"),
				m(".line", "Hi there!"),
			]),
			m("p", "You should see Abot's response! Go ahead and play around with some commands to get a feel for Abot's default behaviors:"),
			m("ol", [
				m("li", "Find me a nice, French wine"),
				m("li", "What's a good restaurant nearby?"),
				m("li", "My car broke down!"),
			]),
			m("p", "In the next 40 minutes, you'll learn how to customize these commands, integrate with SMS, and create your own."),

			m("h2", "Understanding how Abot works"),
			m("p", "For every message Abot receives, Abot processes, routes, and responds to the message. Actually deciding what to say is the role of packages. Let's take a look at an example:"),
			m("p", [
				m("strong", "1. User sends a message via the console, SMS, email, etc.: "), 
				m("div", "Show me Indian restaurants nearby."),
			]),
			m("p", [
				m("strong", "2. Abot pre-processes the message:"),
				m("div", [
					"Commands: ", m("span.code-inline", "[Show]"),
				]),
				m("div", [
					"Objects: ", m("span.code-inline", "[me, Indian restaurants nearby]"),
				]),
			]),
			m("p", [
				m("strong", "3. Abot routes the message to the correct package:"),
				m("div", [
					"Route: ", m("span.code-inline", "find_indian"),
				]),
				m("div", [
					"Package: ", m("span.code-inline", "ava_restaurant"),
				]),
			]),
			m("p", [
				m("strong", "4. The package generates a response:"),
				m("div", " Sure, how does Newab of India sound? It's nearby."),
			]),
			m("p", [
				m("strong", "5. Abot sends the response to the user."),
				m("div", "Abot sends the response through the same channel the user chose, so if the user sends Abot a text, Abot will respond in text automatically."),
			]),
			m("p", "Thus, every message goes from User -> Abot -> Package -> Abot -> User."),

			m(".card-right", [
				m("p.card", [
					m("strong", "What are packages? "),
					"Packages are tiny executable servers written in Go. When Abot boots, it starts every package listed in your ",
					m("span.code-inline", "packages.json"),
					" file. Abot provides all the tools you need to quickly and easily write these packages through its shared library, which we'll learn about in a bit.",
				]),
			]),

			m("h2", "Your first package"),
			m("p", "Let's build a \"Hello World\" package, which will introduce you to the package API. First, let's create our package directory:"),
			m("code", [
				m(".line", "$ mkdir packages/abot_hello"),
			]),
			m("p", [
				"Now let's take a look at the contents of a simple package. You should download and copy this working version and save it to packages/abot_hello/",
				// TODO
				m("a[href=http://pastebin.com/raw/zPY2sTuT]", "abot_hello.go"),
				". Be sure to read through the comments in the file, as the comments will explain the API as its introduced and used.",
			]),
			m("h3", "Package Setup"),
			m("p", [
				"At this point, you've downloaded the complete Hello World package from above (",
				m("a[href=http://pastebin.com/raw/zPY2sTuT]", "abot_hello.go"),
				") and saved it to packages/abot_hello/abot_hello.go. Let's ensure that Abot knows about the new package by adding it to the packages.json file.",
			]),
			m("pre", [
				m("code", [
					'{\n',
					'	"name": "abot",\n',
					'	"version": "0.0.1",\n',
					'	"dependencies": {\n',
					'		"abot_hello": "*"\n',
					'	}\n',
					'}',
				]),
			]),
			m("p", "Now we'll recompile and install Abot and run it. From your terminal, type:"),
			m("code", [
				"$ go install ./... && abot -s",
			]),
			m("p", "You should see Abot boot with a line or two mentioning our new package, abot_hello. Let's test it out. Open another terminal while abot -s is still running, and type:"),
			m("code", [
				m(".line", "$ abotc localhost:4200 +13105555555"),
				m(".line", "> Say something"),
				m(".line", "Hello World!"),
			]),
			m("p", "Abot just routed your message to the package based on the trigger defined in our abot_hello.go. The state machine told it to respond with \"Hello World!\" when it entered its first state, and since there were no other states, that state is replayed every time a new message matching abot_hello.go's trigger is sent to Abot. Now let's try to connect Abot to SMS, so it responds to our text messages."),
			
			m("h2", "Configuring SMS"),
			m("p", "Abot makes it easy to add support for multiple communication tools, including SMS, phone, email, Slack, etc. In this guide, we'll learn how to set up SMS, so we can communicate with this new digital assistant via text messages."),
			m("p", "First we'll need an SMS provider. We'll use Twilio, but you can use any provider with some modifications to Abot's code."),
			m("p", [
				"Sign up for Twilio here: ",
				m("a[href=https://www.twilio.com/]", "https://www.twilio.com/"),
				". Take note of your assigned account SID, auth token, and Twilio phone number. You'll want to set the following environment variables in your ~/.bash_profile or ~/.bashrc:",
			]),
			m("code", [
				m(".line", "export TWILIO_ACCOUNT_SID=\"REPLACE\""),
				m(".line", "export TWILIO_AUTH_TOKEN=\"REPLACE\""),
				m(".line", "export TWILIO_PHONE=\"REPLACE\""),
			]),
			m("p", "Be sure your TWILIO_PHONE is in the form of +13105551234. The leading plus symbol is required."),
			m("p", "In order to communicate with Abot over SMS, Twilio has to be able to reach Abot, but until this point, we've been testing Abot locally on your machine--and Twilio has no way to reach that. Thus, we'll deploy Abot to make it accessible to the world."),

			m("h2", "Deploying your Abot"),
			m("p", [
				"For this guide we'll deploy to Heroku to keep things simple, but Go and Abot make it easy to deploy on any web server. To learn about deploying a Go project on Heroku, first familiarize yourself with this tutorial from Heroku: ",
				m("a[href=https://devcenter.heroku.com/articles/getting-started-with-go]", "Getting Started with Go on Heroku"),
				". Once you have a grasp of what we're doing, open a terminal and run:",
			]),
			m("code", [
				m(".line", "heroku create"),
				m(".line", "heroku config:set TWILIO_ACCOUNT_SID=REPLACE \\"),
				m(".line", "TWILIO_AUTH_TOKEN=REPLACE \\"),
				m(".line", "TWILIO_PHONE=REPLACE"),
				m(".line", "heroku addons:create heroku-postgresql:hobby-dev --version 9.5"),
				m(".line", "heroku pg:psql < db/migrations/up/*.sql"),
				m(".line", "git push heroku master"),
				m(".line", "heroku open"),
			]),
			m("p", [
				"Be sure to replace REPLACE above with your values from before. If everything booted correctly, you'll see the \"Congratulations, you're running Abot!\" screen. If not, you can track down any issues with ",
				m("span.code-inline", "heroku logs --tail"),
				".",
			]),

			m("h2", "Testing out Abot"),
			m("p", [
				"To try Abot, let's first create an Abot account. Go to the site (",
				m("span.code-inline", "heroku open"),
				") and click on Sign Up in the header at the top right. When entering your phone number, be sure to enter it in the format of +13105551234, or Twilio will reject it.",
			]),
			m("p", "Once you've signed up, send Abot a text at your TWILIO_PHONE number from before:"),
			m("code", "Say hi"),
			m("p", "Sometimes responses via Twilio take a few seconds, but you should get a reply back soon,"),
			m("code", "Hello World!"),

			m("h2", "Next steps"),
			m("p", "As next steps, try:"),
			m("ul", [
				m("li", [
					"Building ",
					m("a[href=/guides/advanced_packages]", "Advanced Packages"),
				]),
				m("li", [
					"Learning ",
					m("a[href=#/]", "How to Contribute")
				]),
				m("li", [
					"See what's on our ",
					m("a[href=#/]", "Roadmap")
				]),
			])
		])
	])
}
})(!window.abot ? window.abot={} : window.abot);
(function(abot) {
abot.Guides = {}
abot.Guides.view = function() {
	return m(".main", [
		m.component(abot.Header),
		m(".content", [
			m("h1", "Guides"),
			m("p", [
				"Here we'll add guides as they're written. We're also looking for someone to join the core contributor team focused on improving devops and documentation. That contributor will focus on making Abot development as delightfue as possible by ensuring we have excellent documentation, easy installation tools, thorough guides, and more."
			]),
			m("p", [
				"Interested in contributing a guide? Visit the ",
				m("a[href=/guides/contribute]", "How to Contribute"),
				" guide to learn more.",
			]),
			m("ol", [
				m("li", [
					m("a[href=guides/getting_started]", {
						config: m.route,
					}, "Getting Started"),
				]),
				m("li", [
					m("a[href=guides/contributing]", {
						config: m.route,
					}, "Contributing"),
				]),
			])
		])
	])
}
})(!window.abot ? window.abot={} : window.abot);
(function(abot) {
abot.Header = {}
abot.Header.view = function() {
	return m("header", [
		m("div", [
			m(".links", [
				m("a", {
					href: "/guides",
					config: m.route
				}, "Guides"),
				m("a", {
					href: "/",
					config: m.route
				}, "API"),
				// TODO
				/*
				m("a", {
					href: "/",
					config: m.route
				}, "Packages"),
				*/
				m("a", {
					href: "/",
					config: m.route
				}, "Ask for help"),
				m("a", {
					href: "/",
					config: m.route
				}, "Contribute"),
			]),
			m(".logo", [
				m("a", {
					href: "/",
					config: m.route
				}, "Abot")
			])
		]),
		m("div", { id: "content" })
	])
}
})(!window.abot ? window.abot={} : window.abot);
(function(abot) {
abot.Index = {}
abot.Index.view = function() {
	return m(".main", [
		m.component(abot.Header),
		m(".content", [
			m(".centered", [
				m("img[src=public/img/logo-no-text.svg]"),
				m("h1", "Build your own digital assistant"),
				m("p", "Digital assistants are huge, complex pieces of software. Abot makes it easy and fun to build your own digital assistant, and we include everything you need to get started."),
				m(".btn-container", [
					m("a[href=getting_started].btn", "Download the latest version"),
				])
			]),
			m("p", [
				m("strong", "Abot is open source software. "),
				"That means it's free to use, and you can re-program it.",
			]),
			m("p", [
				m("strong", "We make it easy to build the assistant. "),
				"Abot comes pre-installed with tools to manage and understand human language and guides to help you.",
			]),
			m("p", [
				m("strong", "Make it available everywhere. "),
				"Ava exposes an HTTP API, so you can easily integrate into email, SMS, Twitter, Slack, or however else you want to communicate.",
			]),
		])
	])
}
})(!window.abot ? window.abot={} : window.abot);

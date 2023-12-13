(function(d,h){typeof exports=="object"&&typeof module<"u"?h(exports):typeof define=="function"&&define.amd?define(["exports"],h):(d=typeof globalThis<"u"?globalThis:d||self,h(d.dResource={}))})(this,function(d){"use strict";var w=Object.defineProperty;var A=(d,h,f)=>h in d?w(d,h,{enumerable:!0,configurable:!0,writable:!0,value:f}):d[h]=f;var o=(d,h,f)=>(A(d,typeof h!="symbol"?h+"":h,f),f);var h=(r=>(r.Array="array",r.Tree="tree",r))(h||{}),f=(r=>(r.stop="stop",r.filter="filter",r))(f||{});const g=(r,{endFuc:e,excFuc:i})=>{const u=r.createReader(),s=()=>{u.readEntries(t=>{const n=a=>{if(!t[a]&&a===0)return e();if(!t[a])return s();i(t[a],{next:()=>{n(a+1)}})};n(0)})};s()},D=(r=!1,e={})=>{const s=Object.assign({},e,r?{webkitdirectory:!0}:{},{type:"file",visibility:"hidden"}),t=document.createElement("input");return Object.keys(s).forEach(n=>{const a=s[n];t.setAttribute(n,a)}),t.click(),new Promise((n,a)=>{t.addEventListener("change",()=>{var l;if(!t.files||((l=t.files)==null?void 0:l.length)==0)a();else{const c=Array.from(t.files);n(c)}})})},p=(r,e)=>[].slice.call(r).map(s=>e?e(s):{file:s,fullPath:s.name,name:s.name,size:s.size,type:s.type}),b=(r,e)=>{if(e===h.Array)return p(r,s=>({file:s,fullPath:s.webkitRelativePath,name:s.name,size:s.size,type:s.type}));const i=[];return[].slice.call(r).forEach(s=>{const t=s.webkitRelativePath.split("/");t.reduce((n,a,l)=>{const c=n.find(R=>R.name===a);if(c)return c.child||(c.child=[]);const F={name:a,child:[],type:"text/directory",size:0,fullPath:"",file:new File([],"",{type:"text/directory"})};return l===t.length-1&&(F.type=s.type,F.file=s,delete F.child),n.push(F),F.child},i)}),v(i[0],{path:""}),i},v=(r,{getSize:e,path:i=""})=>{if(!r.child)return r.fullPath=i+r.name,r.size=r.file.size,e?e(r):r.size||0;let u=0;return r.fullPath=i+r.name,r.file=new File([],r.fullPath,{type:"text/directory"}),r.child.forEach(s=>{u+=v(s,{getSize:e,path:r.fullPath+"/"})}),r.size=u,u},E=r=>typeof r!="number"?"":r<m(1)?r+" B":r<m(2)?(r/m(1)).toFixed(2)+" KB":r<m(3)?(r/m(2)).toFixed(2)+" MB":r<m(4)?(r/m(3)).toFixed(2)+" GB":(r/m(4)).toFixed(2)+" TB",m=r=>Math.pow(1024,r),y=()=>{};class P{constructor(e){o(this,"targetDom");o(this,"dragoverFuc");o(this,"dragleaveFuc");o(this,"beforeReadFuc");o(this,"readDataFuc");o(this,"validFuc");o(this,"filterFuc");o(this,"mode");o(this,"onlyFile");o(this,"bindFuc");o(this,"targetOverFlag");this.targetDom=e.targetDom,this.dragoverFuc=e.dragoverFuc||y,this.dragleaveFuc=e.dragleaveFuc||y,this.beforeReadFuc=e.beforeReadFuc,this.readDataFuc=e.readDataFuc||y,this.validFuc=e.validFuc,this.filterFuc=e.filterFuc,this.mode=e.mode||h.Array,this.onlyFile=e.onlyFile||!1,this.bindFuc={DragFuc:this.DragFuc.bind(this),getDrapFile:this.getDrapFile.bind(this),pasteFuc:this.pasteFuc.bind(this),mouseFuc:this.mouseFuc.bind(this)},this.targetOverFlag=!1,this.init()}init(){this.targetDom&&(this.targetDom.addEventListener("mouseenter",this.bindFuc.mouseFuc,!1),this.targetDom.addEventListener("mouseleave",this.bindFuc.mouseFuc,!1),document.addEventListener("paste",this.bindFuc.pasteFuc,!1),this.targetDom.addEventListener("dragover",this.bindFuc.DragFuc,!1),this.targetDom.addEventListener("dragleave",this.bindFuc.DragFuc,!1),this.targetDom.addEventListener("drop",this.bindFuc.getDrapFile,!1))}destroy(){this.bindFuc&&(this.targetDom.removeEventListener("dragover",this.bindFuc.DragFuc,!1),this.targetDom.removeEventListener("dragleave",this.bindFuc.DragFuc,!1),this.targetDom.removeEventListener("drop",this.bindFuc.getDrapFile,!1),this.bindFuc={})}mouseFuc(e){e.type==="mouseenter"?this.targetOverFlag=!0:this.targetOverFlag=!1}DragFuc(e){e.stopPropagation(),e.preventDefault(),this[e.type==="dragover"?"dragoverFuc":"dragleaveFuc"].call(e.target)}getDrapFile(e){this.DragFuc(e),this.addDataTransfer(e.dataTransfer)}pasteFuc(e){if(!this.targetOverFlag)return;const i=document.activeElement;i&&/textarea|input/i.test(i.nodeName)||this.addDataTransfer(e.clipboardData)}errHanlder(e,i){(e==null?void 0:e.message)!==f.stop&&i&&i()}addDataTransfer(e){var u;let i=!0;if(typeof this.beforeReadFuc=="function"&&(i=this.beforeReadFuc()),i&&((u=e==null?void 0:e.items)!=null&&u.length)){const s=[];for(let t=0;t<e.items.length;t++){const n=e.items[t];let a;a=n.webkitGetAsEntry(),s.push(a)}return this.getContent(s).then(t=>{typeof this.readDataFuc=="function"&&this.readDataFuc(t)},t=>{this.errHanlder(t)})}}getContent(e){return new Promise((i,u)=>{const s=[],t=n=>{const a=e[n];if(!a)return i(s);const l=this.mode==="tree"?"getFileSystemEntryTree":"getFileSystemEntryArray";this[l](a,"").then(function(c){s.push(...c),t(n+1)},c=>{this.errHanlder(c)})};t(0)})}ifPushValid(e){return typeof this.filterFuc=="function"?this.filterFuc(e):!0}pushItem(e,i){return this.ifPushValid(i)?(e.push(i),i):null}entryFileHandler(e,{resolve:i,reject:u},s){const t=[];e.file(n=>{const a=s(n);if(typeof this.validFuc=="function"){if(!this.validFuc(a))return u(new Error(f.stop));this.pushItem(t,a),i(t)}else this.pushItem(t,a),i(t)})}getFileSystemEntryTree(e,i=""){return new Promise((u,s)=>{if(!e){u([]);return}if(e.isFile){this.entryFileHandler(e,{resolve:u,reject:s},t=>({size:t.size,fullPath:i+t.name,name:t.name,type:t.type,file:t}));return}if(e.isDirectory){let t=e;const n={fullPath:i+t.name,name:t.name,size:0,type:"text/directory",file:new File([],i+t.name,{type:"text/directory"}),child:[]};if(!this.ifPushValid(n))return s(new Error(f.filter));g(t,{endFuc:()=>(Array.isArray(n.child)&&(n.size=n.child.reduce((a,l)=>a+((l==null?void 0:l.size)||(l==null?void 0:l.size)),0)),u([n])),excFuc:(a,{next:l})=>{this.getFileSystemEntryTree(a,i+t.name+"/").then(c=>{Array.isArray(n.child)&&n.child.push(...c),l()},c=>{this.errHanlder(c,()=>{l()})})}});return}u([])})}getFileSystemEntryArray(e,i=""){return new Promise((u,s)=>{if(!e){u([]);return}if(e.isFile){this.entryFileHandler(e,{resolve:u,reject:s},t=>({size:t.size,fullPath:i+t.name,name:t.name,type:t.type,file:t}));return}if(e.isDirectory){let t=e;const n=[],a={fullPath:i+t.name,name:t.name,size:0,type:"text/directory",file:new File([],i+t.name,{type:"text/directory"})};if(!this.onlyFile&&!this.pushItem(n,a))return s(new Error(f.filter));g(t,{endFuc:()=>(this.onlyFile||(n[0].size=n.reduce((l,c)=>l+((c==null?void 0:c.size)||0),0)),u(n)),excFuc:(l,{next:c})=>{this.getFileSystemEntryArray(l,i+t.name+"/").then(F=>{console.log("results===",F),n.push(...F),c()},F=>{this.errHanlder(F,()=>{c()})})}});return}u([])})}}d.ResHandle=P,d.dirReadEntry=g,d.filterSize=E,d.selectFileChange=p,d.selectFolderChange=b,d.selectResource=D,Object.defineProperty(d,Symbol.toStringTag,{value:"Module"})});
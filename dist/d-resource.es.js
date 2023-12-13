var v = Object.defineProperty;
var D = (r, e, i) => e in r ? v(r, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : r[e] = i;
var h = (r, e, i) => (D(r, typeof e != "symbol" ? e + "" : e, i), i);
var m = /* @__PURE__ */ ((r) => (r.Array = "array", r.Tree = "tree", r))(m || {}), F = /* @__PURE__ */ ((r) => (r.stop = "stop", r.filter = "filter", r))(F || {});
const g = (r, { endFuc: e, excFuc: i }) => {
  const u = r.createReader(), s = () => {
    u.readEntries((t) => {
      const a = (n) => {
        if (!t[n] && n === 0)
          return e();
        if (!t[n])
          return s();
        i(t[n], {
          next: () => {
            a(n + 1);
          }
        });
      };
      a(0);
    });
  };
  s();
}, P = (r = !1, e = {}) => {
  const s = Object.assign({}, e, r ? { webkitdirectory: !0 } : {}, { type: "file", visibility: "hidden" }), t = document.createElement("input");
  return Object.keys(s).forEach((a) => {
    const n = s[a];
    t.setAttribute(a, n);
  }), t.click(), new Promise((a, n) => {
    t.addEventListener("change", () => {
      var l;
      if (!t.files || ((l = t.files) == null ? void 0 : l.length) == 0)
        n();
      else {
        const c = Array.from(t.files);
        a(c);
      }
    });
  });
}, b = (r, e) => [].slice.call(r).map((s) => e ? e(s) : {
  file: s,
  fullPath: s.name,
  name: s.name,
  size: s.size,
  type: s.type
}), w = (r, e) => {
  if (e === m.Array)
    return b(r, (s) => ({
      file: s,
      fullPath: s.webkitRelativePath,
      name: s.name,
      size: s.size,
      type: s.type
    }));
  const i = [];
  return [].slice.call(r).forEach((s) => {
    const t = s.webkitRelativePath.split("/");
    t.reduce((a, n, l) => {
      const c = a.find((p) => p.name === n);
      if (c)
        return c.child || (c.child = []);
      const d = {
        name: n,
        child: [],
        type: "text/directory",
        size: 0,
        fullPath: "",
        file: new File([], "", {
          type: "text/directory"
        })
      };
      return l === t.length - 1 && (d.type = s.type, d.file = s, delete d.child), a.push(d), d.child;
    }, i);
  }), y(i[0], { path: "" }), i;
}, y = (r, { getSize: e, path: i = "" }) => {
  if (!r.child)
    return r.fullPath = i + r.name, r.size = r.file.size, e ? e(r) : r.size || 0;
  let u = 0;
  return r.fullPath = i + r.name, r.file = new File([], r.fullPath, {
    type: "text/directory"
  }), r.child.forEach((s) => {
    u += y(s, {
      getSize: e,
      path: r.fullPath + "/"
    });
  }), r.size = u, u;
}, A = (r) => typeof r != "number" ? "" : r < o(1) ? r + " B" : r < o(2) ? (r / o(1)).toFixed(2) + " KB" : r < o(3) ? (r / o(2)).toFixed(2) + " MB" : r < o(4) ? (r / o(3)).toFixed(2) + " GB" : (r / o(4)).toFixed(2) + " TB", o = (r) => Math.pow(1024, r), f = () => {
};
class x {
  constructor(e) {
    h(this, "targetDom");
    h(this, "dragoverFuc");
    h(this, "dragleaveFuc");
    h(this, "beforeReadFuc");
    h(this, "readDataFuc");
    h(this, "validFuc");
    h(this, "filterFuc");
    h(this, "mode");
    h(this, "onlyFile");
    h(this, "bindFuc");
    h(this, "targetOverFlag");
    this.targetDom = e.targetDom, this.dragoverFuc = e.dragoverFuc || f, this.dragleaveFuc = e.dragleaveFuc || f, this.beforeReadFuc = e.beforeReadFuc, this.readDataFuc = e.readDataFuc || f, this.validFuc = e.validFuc, this.filterFuc = e.filterFuc, this.mode = e.mode || m.Array, this.onlyFile = e.onlyFile || !1, this.bindFuc = {
      DragFuc: this.DragFuc.bind(this),
      getDrapFile: this.getDrapFile.bind(this),
      pasteFuc: this.pasteFuc.bind(this),
      mouseFuc: this.mouseFuc.bind(this)
    }, this.targetOverFlag = !1, this.init();
  }
  init() {
    this.targetDom && (this.targetDom.addEventListener(
      "mouseenter",
      this.bindFuc.mouseFuc,
      !1
    ), this.targetDom.addEventListener(
      "mouseleave",
      this.bindFuc.mouseFuc,
      !1
    ), document.addEventListener(
      "paste",
      this.bindFuc.pasteFuc,
      !1
    ), this.targetDom.addEventListener(
      "dragover",
      this.bindFuc.DragFuc,
      !1
    ), this.targetDom.addEventListener(
      "dragleave",
      this.bindFuc.DragFuc,
      !1
    ), this.targetDom.addEventListener(
      "drop",
      this.bindFuc.getDrapFile,
      !1
    ));
  }
  destroy() {
    this.bindFuc && (this.targetDom.removeEventListener(
      "dragover",
      this.bindFuc.DragFuc,
      !1
    ), this.targetDom.removeEventListener(
      "dragleave",
      this.bindFuc.DragFuc,
      !1
    ), this.targetDom.removeEventListener(
      "drop",
      this.bindFuc.getDrapFile,
      !1
    ), this.bindFuc = {});
  }
  mouseFuc(e) {
    e.type === "mouseenter" ? this.targetOverFlag = !0 : this.targetOverFlag = !1;
  }
  DragFuc(e) {
    e.stopPropagation(), e.preventDefault(), this[e.type === "dragover" ? "dragoverFuc" : "dragleaveFuc"].call(e.target);
  }
  getDrapFile(e) {
    this.DragFuc(e), this.addDataTransfer(e.dataTransfer);
  }
  pasteFuc(e) {
    if (!this.targetOverFlag)
      return;
    const i = document.activeElement;
    i && /textarea|input/i.test(i.nodeName) || this.addDataTransfer(e.clipboardData);
  }
  errHanlder(e, i) {
    (e == null ? void 0 : e.message) !== F.stop && i && i();
  }
  addDataTransfer(e) {
    var u;
    let i = !0;
    if (typeof this.beforeReadFuc == "function" && (i = this.beforeReadFuc()), i && ((u = e == null ? void 0 : e.items) != null && u.length)) {
      const s = [];
      for (let t = 0; t < e.items.length; t++) {
        const a = e.items[t];
        let n;
        n = a.webkitGetAsEntry(), s.push(n);
      }
      return this.getContent(s).then(
        (t) => {
          typeof this.readDataFuc == "function" && this.readDataFuc(t);
        },
        (t) => {
          this.errHanlder(t);
        }
      );
    }
  }
  getContent(e) {
    return new Promise((i, u) => {
      const s = [], t = (a) => {
        const n = e[a];
        if (!n)
          return i(s);
        const l = this.mode === "tree" ? "getFileSystemEntryTree" : "getFileSystemEntryArray";
        this[l](n, "").then(
          function(c) {
            s.push(...c), t(a + 1);
          },
          (c) => {
            this.errHanlder(c);
          }
        );
      };
      t(0);
    });
  }
  ifPushValid(e) {
    return typeof this.filterFuc == "function" ? this.filterFuc(e) : !0;
  }
  pushItem(e, i) {
    return this.ifPushValid(i) ? (e.push(i), i) : null;
  }
  // 文件处理
  entryFileHandler(e, {
    resolve: i,
    reject: u
  }, s) {
    const t = [];
    e.file((a) => {
      const n = s(a);
      if (typeof this.validFuc == "function") {
        if (!this.validFuc(n))
          return u(new Error(F.stop));
        this.pushItem(t, n), i(t);
      } else
        this.pushItem(t, n), i(t);
    });
  }
  getFileSystemEntryTree(e, i = "") {
    return new Promise((u, s) => {
      if (!e) {
        u([]);
        return;
      }
      if (e.isFile) {
        this.entryFileHandler(
          e,
          { resolve: u, reject: s },
          (t) => ({
            size: t.size,
            fullPath: i + t.name,
            name: t.name,
            type: t.type,
            file: t
          })
        );
        return;
      }
      if (e.isDirectory) {
        let t = e;
        const a = {
          fullPath: i + t.name,
          name: t.name,
          size: 0,
          type: "text/directory",
          file: new File([], i + t.name, {
            type: "text/directory"
          }),
          child: []
        };
        if (!this.ifPushValid(a))
          return s(new Error(F.filter));
        g(t, {
          endFuc: () => (Array.isArray(a.child) && (a.size = a.child.reduce((n, l) => n + ((l == null ? void 0 : l.size) || (l == null ? void 0 : l.size)), 0)), u([a])),
          excFuc: (n, { next: l }) => {
            this.getFileSystemEntryTree(
              n,
              i + t.name + "/"
            ).then(
              (c) => {
                Array.isArray(a.child) && a.child.push(...c), l();
              },
              (c) => {
                this.errHanlder(c, () => {
                  l();
                });
              }
            );
          }
        });
        return;
      }
      u([]);
    });
  }
  getFileSystemEntryArray(e, i = "") {
    return new Promise((u, s) => {
      if (!e) {
        u([]);
        return;
      }
      if (e.isFile) {
        this.entryFileHandler(
          e,
          { resolve: u, reject: s },
          (t) => ({
            size: t.size,
            fullPath: i + t.name,
            name: t.name,
            type: t.type,
            file: t
          })
        );
        return;
      }
      if (e.isDirectory) {
        let t = e;
        const a = [], n = {
          fullPath: i + t.name,
          name: t.name,
          size: 0,
          type: "text/directory",
          file: new File([], i + t.name, {
            type: "text/directory"
          })
        };
        if (!this.onlyFile && !this.pushItem(a, n))
          return s(new Error(F.filter));
        g(t, {
          endFuc: () => (this.onlyFile || (a[0].size = a.reduce((l, c) => l + ((c == null ? void 0 : c.size) || 0), 0)), u(a)),
          excFuc: (l, { next: c }) => {
            this.getFileSystemEntryArray(
              l,
              i + t.name + "/"
            ).then(
              (d) => {
                console.log("results===", d), a.push(...d), c();
              },
              (d) => {
                this.errHanlder(d, () => {
                  c();
                });
              }
            );
          }
        });
        return;
      }
      u([]);
    });
  }
}
export {
  x as ResHandle,
  g as dirReadEntry,
  A as filterSize,
  b as selectFileChange,
  w as selectFolderChange,
  P as selectResource
};

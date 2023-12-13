const noop = () => {};
export * from "./utils";

import type {
  Fuc,
  DragFuc,
  ClipboardFuc,
  MouseFuc,
  DragTargetFuc,
  JudgeFuc,
  ReadFuc,
  ValidFuc,
  FilterFuc,
  FileSystemEntry,
  ResHandleOption,
  BlockContent,
  ResItem,
  TreeList,
} from "./types";
import { ModeType, ErrEnum } from "./types";
import { dirReadEntry } from "./utils";

interface BindFuc {
  // 需要和定义得函数保持一致，重复定义
  DragFuc?: DragFuc;
  getDrapFile?: DragFuc;
  pasteFuc?: ClipboardFuc;
  mouseFuc?: MouseFuc;
}
export class ResHandle {
  public targetDom: HTMLElement;
  public dragoverFuc: DragTargetFuc;
  public dragleaveFuc: DragTargetFuc;
  public beforeReadFuc: JudgeFuc;
  public readDataFuc: ReadFuc;
  public validFuc: ValidFuc;
  public filterFuc: FilterFuc;
  public mode: ModeType;
  public onlyFile: boolean;
  private bindFuc: BindFuc;
  private targetOverFlag: boolean;
  constructor(options: ResHandleOption) {
    this.targetDom = options.targetDom;
    this.dragoverFuc = options.dragoverFuc || noop;
    this.dragleaveFuc = options.dragleaveFuc || noop;
    this.beforeReadFuc = options.beforeReadFuc;
    this.readDataFuc = options.readDataFuc || noop;
    this.validFuc = options.validFuc;
    // filter resouce
    this.filterFuc = options.filterFuc;
    // data Format --- array tree
    this.mode = options.mode || ModeType.Array;
    // 只读文件（树形 tree 下设置无效）
    this.onlyFile = options.onlyFile || false;

    this.bindFuc = {
      DragFuc: this.DragFuc.bind(this),
      getDrapFile: this.getDrapFile.bind(this),
      pasteFuc: this.pasteFuc.bind(this),
      mouseFuc: this.mouseFuc.bind(this),
    };
    this.targetOverFlag = false;
    this.init();
  }
  public init() {
    if (this.targetDom) {
      // this.bindFuc = ;
      this.targetDom.addEventListener(
        "mouseenter",
        this.bindFuc.mouseFuc as MouseFuc,
        false
      );
      this.targetDom.addEventListener(
        "mouseleave",
        this.bindFuc.mouseFuc as MouseFuc,
        false
      );
      // this.targetDom.addEventListener('paste', this.bindFuc.pasteFuc, false)
      document.addEventListener(
        "paste",
        this.bindFuc.pasteFuc as ClipboardFuc,
        false
      );
      this.targetDom.addEventListener(
        "dragover",
        this.bindFuc.DragFuc as DragFuc,
        false
      );
      this.targetDom.addEventListener(
        "dragleave",
        this.bindFuc.DragFuc as DragFuc,
        false
      );
      this.targetDom.addEventListener(
        "drop",
        this.bindFuc.getDrapFile as DragFuc,
        false
      );
    }
  }
  public destroy() {
    if (!this.bindFuc) return;
    this.targetDom.removeEventListener(
      "dragover",
      this.bindFuc.DragFuc as DragFuc,
      false
    );
    this.targetDom.removeEventListener(
      "dragleave",
      this.bindFuc.DragFuc as DragFuc,
      false
    );
    this.targetDom.removeEventListener(
      "drop",
      this.bindFuc.getDrapFile as DragFuc,
      false
    );
    this.bindFuc = {};
  }
  private mouseFuc(e: MouseEvent) {
    if (e.type === "mouseenter") {
      this.targetOverFlag = true;
    } else {
      // mouseleave
      this.targetOverFlag = false;
    }
  }
  private DragFuc(e: DragEvent) {
    e.stopPropagation();
    e.preventDefault();
    // if (!e.currentTarget.contains(e.relatedTarget)) {
    //   this.dragOver = false
    // }
    this[e.type === "dragover" ? "dragoverFuc" : "dragleaveFuc"].call(e.target);
  }
  private getDrapFile(e: DragEvent) {
    // 取消 hover 效果
    this.DragFuc(e);
    // 获取文件列表对象
    this.addDataTransfer(e.dataTransfer as DataTransfer);
  }
  private pasteFuc(e: ClipboardEvent) {
    // 不在拖拽区域，不处理
    if (!this.targetOverFlag) return;
    const activeEl = document.activeElement;
    // 在拖拽区域内的输入框黏贴，不处理
    if (activeEl && /textarea|input/i.test(activeEl.nodeName)) return;
    this.addDataTransfer(e.clipboardData as DataTransfer);
  }
  private errHanlder(err: Error, cb?: Fuc) {
    // console.log('errHanlder=====', err)
    if (err?.message !== ErrEnum.stop) {
      cb && cb();
    }
  }
  private addDataTransfer(dataTransfer: DataTransfer) {
    let ifRead = true;
    if (typeof this.beforeReadFuc === "function") {
      ifRead = this.beforeReadFuc();
    }
    if (ifRead && dataTransfer?.items?.length) {
      const entrys: FileSystemEntry[] = [];
      for (let i = 0; i < dataTransfer.items.length; i++) {
        const dataTransferTtem = dataTransfer.items[i];
        let entry;
        // if (dataTransferTtem.getAsEntry) {
        //   entry =
        //     dataTransferTtem.getAsEntry() || dataTransferTtem.getAsFile();
        // } else if (dataTransferTtem.webkitGetAsEntry) {
        //   entry =
        //     dataTransferTtem.webkitGetAsEntry() ||
        //     dataTransferTtem.getAsFile();
        // } else {
        //   entry = dataTransferTtem.getAsFile();
        // }
        entry = dataTransferTtem.webkitGetAsEntry() as FileSystemEntry;
        entrys.push(entry);
      }
      return this.getContent(entrys).then(
        (blockContent) => {
          if (typeof this.readDataFuc === "function") {
            this.readDataFuc(blockContent);
          }
        },
        (err) => {
          this.errHanlder(err);
        }
      );
    }
  }
  private getContent(entrys: Array<FileSystemEntry>): Promise<Array<ResItem>> {
    return new Promise((resolve, reject) => {
      const blockContent: Array<ResItem> = [];
      const forEach = (i: number) => {
        const v = entrys[i];
        if (!v) {
          return resolve(blockContent);
        }
        const fucHanlder =
          this.mode === "tree"
            ? "getFileSystemEntryTree"
            : "getFileSystemEntryArray";
        this[fucHanlder](v, "").then(
          function (results: TreeList[]) {
            blockContent.push(...results);
            forEach(i + 1);
          },
          (err) => {
            this.errHanlder(err);
          }
        );

        // if (this.mode === "tree") {
        //   this.getFileSystemEntryTree(v, "").then(
        //     function (results: TreeList[]) {
        //       blockContent.push(...results);
        //       forEach(i + 1);
        //     },
        //     (err) => {
        //       this.errHanlder(err);
        //     }
        //   );
        // } else {
        //   this.getFileSystemEntryArray(v, "").then(
        //     function (results: TreeList[]) {
        //       blockContent.push(...results);
        //       forEach(i + 1);
        //     },
        //     (err) => {
        //       this.errHanlder(err);
        //     }
        //   );
        // }
      };
      forEach(0);
    });
  }
  private ifPushValid(targetItem: ResItem): boolean {
    if (typeof this.filterFuc === "function") {
      return this.filterFuc(targetItem);
    } else {
      return true;
    }
  }
  private pushItem(list: Array<ResItem>, item: ResItem): ResItem | null {
    if (this.ifPushValid(item)) {
      list.push(item);
      return item;
    }
    return null;
  }
  // 文件处理
  private entryFileHandler(
    fileEntry: FileSystemFileEntry,
    {
      resolve,
      reject,
    }: {
      resolve: (res: Array<ResItem>) => void;
      reject: (res: Error) => void;
    },
    formatter: (file: File) => ResItem
  ) {
    const res: Array<ResItem> = [];
    fileEntry.file((file: File) => {
      const fileItem = formatter(file);
      if (typeof this.validFuc === "function") {
        const isPass = this.validFuc(fileItem);
        if (!isPass) {
          return reject(new Error(ErrEnum.stop));
        }
        this.pushItem(res, fileItem);
        resolve(res);
      } else {
        this.pushItem(res, fileItem);
        resolve(res);
      }
    });
  }
  private getFileSystemEntryTree(
    entry: FileSystemEntry,
    path: string = ""
  ): Promise<TreeList[]> {
    return new Promise((resolve, reject) => {
      if (!entry) {
        resolve([]);
        return;
      }

      if (entry.isFile) {
        this.entryFileHandler(
          entry as FileSystemFileEntry,
          { resolve, reject },
          (file) => {
            return {
              size: file.size,
              fullPath: path + file.name,
              name: file.name,
              type: file.type,
              file,
            };
          }
        );
        return;
      }

      if (entry.isDirectory) {
        let directoryEntry = entry as FileSystemDirectoryEntry;
        const curDir: TreeList = {
          fullPath: path + directoryEntry.name,
          name: directoryEntry.name,
          size: 0,
          type: "text/directory",
          file: new File([], path + directoryEntry.name, {
            type: "text/directory",
          }),
          child: [],
        };
        if (!this.ifPushValid(curDir)) {
          return reject(new Error(ErrEnum.filter));
        }
        dirReadEntry(directoryEntry, {
          endFuc: () => {
            if (Array.isArray(curDir.child)) {
              curDir.size = curDir.child.reduce((acc, cur) => {
                return acc + (cur?.size || cur?.size);
              }, 0);
            }
            return resolve([curDir]);
          },
          excFuc: (entryItem: FileSystemFileEntry, { next }) => {
            this.getFileSystemEntryTree(
              entryItem,
              path + directoryEntry.name + "/"
            ).then(
              (results) => {
                // 父子建立关系(results有可能是空数组)
                if (Array.isArray(curDir.child)) {
                  curDir.child.push(...results);
                }
                next();
              },
              (err) => {
                this.errHanlder(err, () => {
                  next();
                });
              }
            );
          },
        });
        return;
      }

      resolve([]);
    });
  }
  private getFileSystemEntryArray(
    entry: FileSystemEntry,
    path: string = ""
  ): Promise<TreeList[]> {
    return new Promise((resolve, reject) => {
      if (!entry) {
        resolve([]);
        return;
      }

      if (entry.isFile) {
        this.entryFileHandler(
          entry as FileSystemFileEntry,
          { resolve, reject },
          (file) => {
            return {
              size: file.size,
              fullPath: path + file.name,
              name: file.name,
              type: file.type,
              file,
            };
          }
        );
        return;
      }

      if (entry.isDirectory) {
        let directoryEntry = entry as FileSystemDirectoryEntry;
        const uploadFiles: Array<TreeList> = [];
        const curDir = {
          fullPath: path + directoryEntry.name,
          name: directoryEntry.name,
          size: 0,
          type: "text/directory",
          file: new File([], path + directoryEntry.name, {
            type: "text/directory",
          }),
        };
        if (!this.onlyFile) {
          // 文件夹
          const pushRes = this.pushItem(uploadFiles, curDir);
          if (!pushRes) {
            // 文件夹被过滤
            return reject(new Error(ErrEnum.filter));
          }
        }
        dirReadEntry(directoryEntry, {
          endFuc: () => {
            if (!this.onlyFile) {
              // 默认第一个是文件夹，后面是其下的文件
              uploadFiles[0].size = uploadFiles.reduce((acc, cur) => {
                return acc + (cur?.size || 0);
              }, 0);
            }
            return resolve(uploadFiles);
          },
          excFuc: (entryItem, { next }) => {
            /**
             * 11/22/33/q.txt   回调函数内顺序为
             * uploadFiles 中有 33，results 为 q.txt
             * uploadFiles 中有 22，results 为 33, q.txt
             * uploadFiles 中有 11，results 为 22, 33, q.txt
             */
            this.getFileSystemEntryArray(
              entryItem,
              path + directoryEntry.name + "/"
            ).then(
              (results) => {
                // 父子建立关系(results有可能是空数组)
                console.log("results===", results);
                uploadFiles.push(...results);
                next();
              },
              (err) => {
                this.errHanlder(err, () => {
                  next();
                });
              }
            );
          },
        });
        return;
      }

      resolve([]);
    });
  }
}

import type {
  Fuc,
  ComObj,
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
import { ModeType } from "./types";
// export const getTargetNode = (ele: Element, target: Element) => {
//   //ele是内部元素，target是你想找到的包裹元素
//   if (!ele || ele === document) return false;
//   return ele === target ? true : getTargetNode(ele.parentNode, target);
// };
interface dirReadEntryOption {
  endFuc: Fuc;
  excFuc: (entryItem: FileSystemFileEntry, { next }: { next: Fuc }) => void;
}
// 文件读取
export const dirReadEntry = (
  dirEntry: FileSystemDirectoryEntry,
  { endFuc, excFuc }: dirReadEntryOption
): void => {
  const dirReader = dirEntry.createReader();
  const readEntries = () => {
    dirReader.readEntries((entries) => {
      const forEach = (i: number) => {
        if (!entries[i] && i === 0) {
          return endFuc();
        }
        if (!entries[i]) {
          // 一次 readEntries 数量有上限
          return readEntries();
        }
        excFuc(entries[i] as FileSystemFileEntry, {
          next: () => {
            forEach(i + 1);
          },
        });
      };
      forEach(0);
    });
  };
  readEntries();
};
/**
 * 获取文件后缀
 *
 * @param file 文件或文件名
 * @returns
 */
// export const getFileExtension = (file: File): string => {
//   let fileName: string = file.name;
//   if (file instanceof File) {
//     fileName = file.name;
//   } else {
//     fileName = file;
//   }
//   return fileName.match(/\.([0-9a-z]+)(?:[\\?#]|$)/i)[1] ?? "";
// };
export const selectResource = (
  isDir: boolean = false,
  attrs: ComObj = {}
): Promise<Array<File>> => {
  const baseAttrs = { type: "file", visibility: "hidden" };
  const changeAttrs = isDir ? { webkitdirectory: true } : {};
  const mergeAttrs = Object.assign({}, attrs, changeAttrs, baseAttrs);
  const inputElem = document.createElement("input");
  Object.keys(mergeAttrs).forEach((key) => {
    const val = mergeAttrs[key];
    inputElem.setAttribute(key, val);
  });
  inputElem.click();
  return new Promise((resolve, reject) => {
    // 在实例上添加监听
    inputElem.addEventListener("change", () => {
      if (!inputElem.files || inputElem.files?.length == 0) {
        reject();
      } else {
        const files = Array.from(inputElem.files);
        // 防止选择非指定的文件格式 --- 原生支持配置大类型以及小类型配置，需要兼容，目前由外部过滤
        // if (attrs.accept && illegalFiles(files, attrs.accept.split(','))) {
        //   reject()
        // }
        resolve(files);
      }
    });
  });
  // function illegalFiles(files, accepts) {
  //   accepts = accepts.map((item) => item.replace(/^\s*|\s*$/g, ''))
  //   return !accepts.includes('*') && files.some((file) => !accepts.includes(`.${getFileExtension(file)}`))
  // }
};
// ??? formatter
export const selectFileChange = (
  files: Array<File>,
  formatter: (file: File) => ComObj
): Array<ComObj> => {
  const fileList: Array<File> = [].slice.call(files);
  const res = fileList.map((file) => {
    if (formatter) {
      return formatter(file);
    }
    return {
      file: file,
      fullPath: file.name,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  });
  return res;
};

export const selectFolderChange = (
  files: Array<File>,
  mode: ModeType
): ResItem[] => {
  if (mode === ModeType.Array) {
    return selectFileChange(files, (file) => ({
      file: file,
      fullPath: file.webkitRelativePath,
      name: file.name,
      size: file.size,
      type: file.type,
    })) as ResItem[];
  }
  const tree: Array<TreeList> = [];
  const fileList = [].slice.call(files);
  fileList.forEach((file: File) => {
    const segments = file.webkitRelativePath.split("/");
    // 所有 path 都是一个起点，过程中把所有创建的 node 存入数组，方便快速定位在哪个 node 下放子 node
    segments.reduce((nodeList, segment, index) => {
      const existingNode = nodeList.find((node) => node.name === segment);
      if (existingNode) {
        return existingNode.child || (existingNode.child = []);
      }

      const newNode: TreeList = {
        name: segment,
        child: [],
        type: "text/directory",
        size: 0,
        fullPath: "",
        file: new File([], "", {
          type: "text/directory",
        }),
      };
      if (index === segments.length - 1) {
        newNode.type = file.type;
        newNode.file = file;
        delete newNode.child;
      }
      nodeList.push(newNode);

      return newNode.child as Array<TreeList>;
    }, tree);
  });
  depthFirstTraversal(tree[0] as TreeList, { path: "" });
  return tree;
};

// 计算每层文件夹大小
const depthFirstTraversal = (
  node: TreeList,
  { getSize, path = "" }: { getSize?: (node: TreeList) => number; path: string }
): number => {
  if (!node.child) {
    node.fullPath = path + node.name;
    node.size = node.file.size;
    if (getSize) {
      return getSize(node);
    }
    return node.size || 0;
  }

  let folderSize = 0;
  node.fullPath = path + node.name;
  node.file = new File([], node.fullPath, {
    type: "text/directory",
  });

  node.child.forEach((child) => {
    folderSize += depthFirstTraversal(child, {
      getSize,
      path: node.fullPath + "/",
    });
  });

  node.size = folderSize; // 将文件夹的总大小赋值给文件夹节点

  return folderSize;
};
export const filterSize = (size: number): string => {
  if (typeof size !== "number") return "";
  if (size < pow1024(1)) return size + " B";
  if (size < pow1024(2)) return (size / pow1024(1)).toFixed(2) + " KB";
  if (size < pow1024(3)) return (size / pow1024(2)).toFixed(2) + " MB";
  if (size < pow1024(4)) return (size / pow1024(3)).toFixed(2) + " GB";
  return (size / pow1024(4)).toFixed(2) + " TB";
};
// 求次幂
const pow1024 = (num: number): number => {
  return Math.pow(1024, num);
};

import type { Fuc, ComObj, ResItem } from "./types";
import { ModeType } from "./types";
interface dirReadEntryOption {
    endFuc: Fuc;
    excFuc: (entryItem: FileSystemFileEntry, { next }: {
        next: Fuc;
    }) => void;
}
export declare const dirReadEntry: (dirEntry: FileSystemDirectoryEntry, { endFuc, excFuc }: dirReadEntryOption) => void;
/**
 * 获取文件后缀
 *
 * @param file 文件或文件名
 * @returns
 */
export declare const selectResource: (isDir?: boolean, attrs?: ComObj) => Promise<Array<File>>;
export declare const selectFileChange: (files: Array<File>, formatter: (file: File) => ComObj) => Array<ComObj>;
export declare const selectFolderChange: (files: Array<File>, mode: ModeType) => ResItem[];
export declare const filterSize: (size: number) => string;
export {};

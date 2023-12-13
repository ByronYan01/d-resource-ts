export declare enum ModeType {
    Array = "array",
    Tree = "tree"
}
export declare enum ErrEnum {
    stop = "stop",
    filter = "filter"
}
export type Fuc = () => void;
export type DragFuc = (e: DragEvent) => void;
export type ClipboardFuc = (e: ClipboardEvent) => void;
export type MouseFuc = (e: MouseEvent) => void;
export type DragTargetFuc = Fuc;
export type JudgeFuc = () => boolean;
export type ReadFuc = (res: TreeList[]) => void;
export type ValidFuc = (res: ResItem) => boolean;
export type FilterFuc = (res: ResItem) => boolean;
export type FileSystemEntry = FileSystemFileEntry | FileSystemDirectoryEntry;
export interface ResHandleOption {
    targetDom: HTMLElement;
    dragoverFuc: DragTargetFuc;
    dragleaveFuc: DragTargetFuc;
    beforeReadFuc: JudgeFuc;
    readDataFuc: ReadFuc;
    validFuc: ValidFuc;
    filterFuc: FilterFuc;
    mode: ModeType;
    onlyFile: boolean;
}
export interface ResItem {
    size: number;
    fullPath: string;
    name: string;
    type: string;
    file: File;
}
export interface TreeList extends ResItem {
    child?: TreeList[];
}
export interface ComObj {
    [key: string]: any;
}

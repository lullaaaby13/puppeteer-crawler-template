export enum FileExtension {
    TXT = 'txt',
    JPG = 'jpg',
    JPEG = 'jpeg',
    PNG = 'png',
    UNKNOWN = 'unknown',
}

export interface FileType {
    extension: FileExtension;
    encoding: BufferEncoding;
}

const fileTypeMap: { [k: string]: FileType} = {
    'txt': { extension: FileExtension.TXT, encoding: 'utf-8' },
    'jpg': { extension: FileExtension.JPG, encoding: 'base64' },
    'jpeg': { extension: FileExtension.JPEG, encoding: 'base64' },
    'png': { extension: FileExtension.PNG, encoding: 'base64' },

    'unknown': { extension: FileExtension.UNKNOWN, encoding: 'utf-8' },
};

export function findFileType(fileName: string): FileType {
    const fileExtension: FileExtension = Object.values(FileExtension).find(extension => fileName.endsWith(extension)) || FileExtension.UNKNOWN;
    return fileTypeMap[fileExtension];
}

export interface CustomFile {
    readonly data: any;
    readonly type: FileType;
    readonly path?: string;
    name: string;
}

export class TxtFile implements CustomFile {
    readonly data: string;
    readonly path?: string;
    readonly name: string;
    readonly type: FileType;

    constructor(fileName: string, data: string) {
        this.name = fileName;
        this.data = data;
        this.type = findFileType(fileName);
    }

}

export class JpgFile implements CustomFile {
    readonly data: Buffer | string;
    readonly path?: string;
    name: string;
    readonly type: FileType;

    constructor(fileName: string, data: Buffer | string) {
        this.name = fileName;
        this.data = data;
        this.type = findFileType(fileName);
    }

    changeFileName(fileName: string) {
        this.name = fileName;
    }

}

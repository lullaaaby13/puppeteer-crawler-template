import * as Path from 'path';
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, rm, rmSync, writeFileSync } from 'fs';
import { CustomFile, FileExtension, FileType, findFileType, JpgFile } from './file.util.model';
import { Axios } from 'axios';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const appRootPath = require('app-root-path');
const axios = new Axios();

export class Directory {

    paths: string[];

    constructor(...paths: string[]) {
        this.paths = paths;
        for (let index = 0; index < paths.length; index++) {
            const checkPath = Path.resolve(appRootPath.path, ...paths.slice(0, index + 1));
            if (!existsSync(checkPath)) {
                mkdirSync(checkPath);
                console.log(`directory is created. [${checkPath}]`);
            }

        }
    }

    pwd() {
        return Path.resolve(appRootPath.path, ...this.paths);
    }

    // 프로젝트 경로 밖으로 벗어날 수 없다.
    parent() {
        if (this.paths.length === 0) {
            return new Directory(...[]);
        }
        return new Directory(...this.paths.slice(0, this.paths.length - 1));
    }

    mkdir(name: string) {
        return new Directory(Path.resolve(this.pwd(), name));
    }

    clear() {
        readdirSync(this.pwd())
            .map(fileName => Path.resolve(this.pwd(), fileName))
            .forEach(filePath => {
                const stats = lstatSync(filePath);
                if (stats.isDirectory()) {
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    rm(filePath, { recursive: true }, () => {});
                } else if (stats.isFile()) {
                    rmSync(filePath);
                }
            });


    }

    addJSON(fileName: string, data: any, pretty = true) {
        const toBeSaved: string = pretty ? JSON.stringify(data, null, 4) : JSON.stringify(data);
        writeFileSync(`${this.pwd()}/${fileName}`, toBeSaved, { encoding: 'utf-8' });
    }

    add(file: CustomFile) {
        writeFileSync(this.refineFileName(file), file.data, { encoding: file.type.encoding });
        console.log(`[${this.pwd()}] => [${file.name}] is created.`);
    }

    private refineFileName(file: CustomFile) {
        return `${this.pwd()}/${file.name.endsWith(file.type.extension) ? file.name : file.name + '.' + file.type}`;
    }

    readFiles(filter?: FileExtension): CustomFile[] {

        const files: CustomFile[] = [];
        const targets = filter ? readdirSync(this.pwd()).filter(fileName => fileName.endsWith(filter)) : readdirSync(this.pwd());

        for (const fileName of targets) {
            const filePath = Path.resolve(this.pwd(), fileName);
            const fileType: FileType = findFileType(fileName);
            files.push({
                data: readFileSync(filePath, { encoding: fileType.encoding }),
                path: filePath,
                type: findFileType(fileName),
                name: fileName,
            });
        }

        return files;
    }

}

export async function imageDownload(url: string, directory: Directory, fileName: string) {
    const { data } = await axios.get(url);
    directory.add(new JpgFile(fileName, data));
}
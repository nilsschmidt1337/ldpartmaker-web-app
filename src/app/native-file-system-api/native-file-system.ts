import {FileSystemFileHandle} from './file-system-file-handle';
import {FileSystemEntriesOptions} from './file-system-entries-options';

export class NativeFileSystem {
  public static async chooseFileSystemEntries(options?: FileSystemEntriesOptions): Promise<FileSystemFileHandle> {
    // tslint:disable-next-line
    return window['chooseFileSystemEntries'](options);
  }
}

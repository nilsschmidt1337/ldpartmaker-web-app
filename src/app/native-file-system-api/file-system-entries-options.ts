export class FileSystemEntriesOptions {

  type: ChooseFileSystemEntriesType = ChooseFileSystemEntriesType.openFile;

}

export enum ChooseFileSystemEntriesType {
  'openFile' = 'open-file',
  'openDirectory' = 'open-directory'
}

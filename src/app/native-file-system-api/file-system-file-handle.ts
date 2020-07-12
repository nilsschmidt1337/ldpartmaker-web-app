export interface FileSystemFileHandle {

  getFile(): Promise<File>;

  createWritable(fileSystemCreateWritableOptions?: Map<any, any>): Promise<any>;
}

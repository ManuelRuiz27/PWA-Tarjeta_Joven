export interface IncomingFile {
  fieldName: string;
  originalName: string;
  mimetype: string;
  buffer: Buffer;
}

export interface StorageProvider {
  saveUserDocument(
    userId: string,
    documentType: string,
    file: IncomingFile,
  ): Promise<string>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');

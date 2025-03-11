import { FileInfo } from '@paulislava/shared/file/file.types';
import { File } from '../entities/file.entity';

export class FileSerializer {
  info(file: File): FileInfo {
    return {
      id: file.id,
      name: file.originalName,
      url: file.fileUrl(),
    };
  }
}

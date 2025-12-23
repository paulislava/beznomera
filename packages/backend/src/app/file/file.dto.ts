import { FileInfo } from '@shared/file/file.types';
import { IsUUID } from 'class-validator';

export class FileDto implements FileInfo {
  @IsUUID()
  id: string;

  name: string;
  url: string;
}

import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user/user.entity';
import { FileFolder, FileInfo } from '@paulislava/shared/file/file.types';

@Entity()
export class File extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column({ nullable: true })
  extension: string | null;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  folder: FileFolder;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: number;

  filename(): string {
    return `${this.id}${this.extension ? `.${this.extension}` : ''}`;
  }

  fileKey(): string {
    return `${this.folder}/${this.filename()}`;
  }

  fileUrl(): string {
    return `${process.env.CDN_URL}/${this.fileKey()}`;
  }

  info(): FileInfo {
    return {
      id: this.id,
      name: this.originalName,
      url: this.fileUrl(),
    };
  }
}

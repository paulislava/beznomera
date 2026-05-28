import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RecordLossDto {
  @IsInt()
  @IsPositive()
  itemId: number;
}

export class CreateLostItemDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}

export class GetOrCreateShortcutDto {
  @IsInt()
  @IsPositive()
  itemId: number;
}

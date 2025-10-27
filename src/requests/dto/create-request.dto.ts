import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { HelpCategory, Importance } from 'src/common/enums';

export class CreateRequestDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(HelpCategory)
  category: HelpCategory;

  @IsOptional()
  @IsEnum(Importance)
  importance?: Importance;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

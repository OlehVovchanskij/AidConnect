import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { HelpCategory, Importance } from 'src/common/enums';

export class UpdateRequestDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(HelpCategory)
  category?: HelpCategory;

  @IsOptional()
  @IsEnum(Importance)
  importance?: Importance;
}

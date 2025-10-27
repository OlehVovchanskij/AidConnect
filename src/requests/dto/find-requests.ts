import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { HelpCategory, Importance } from 'src/common/enums';

export class FindRequestsQueryDto {
  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsNumber()
  radius?: number; // meters

  @IsOptional()
  @IsEnum(HelpCategory)
  category?: HelpCategory;

  @IsOptional()
  @IsEnum(Importance)
  importance?: Importance;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  skip?: number;
}

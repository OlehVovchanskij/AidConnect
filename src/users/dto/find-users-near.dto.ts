import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsPositive, Max, Min } from 'class-validator';

export class FindUsersNearDto {
  @ApiProperty({
    description: 'Широта',
    example: 50.4501,
    minimum: -90,
    maximum: 90,
  })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Довгота',
    example: 30.5234,
    minimum: -180,
    maximum: 180,
  })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    description: 'Радіус пошуку в метрах',
    example: 1000,
    minimum: 1,
  })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsPositive()
  radius: number;
}

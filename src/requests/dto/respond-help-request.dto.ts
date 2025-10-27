import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RespondHelpRequestDto {
  @ApiProperty({ example: 'Я можу привезти генератор сьогодні ввечері' })
  @IsString()
  message: string;
}

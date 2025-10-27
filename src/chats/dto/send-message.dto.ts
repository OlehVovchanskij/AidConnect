import { IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  payload: string; // base64 encrypted payload

  @IsOptional()
  meta?: any;
}

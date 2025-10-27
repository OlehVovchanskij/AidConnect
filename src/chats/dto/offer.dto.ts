import { IsString } from 'class-validator';

export class OfferDto {
  @IsString()
  requestId: string;

  @IsString()
  chatId: string;

  @IsString()
  meta: string; // optional encrypted meta or description
}

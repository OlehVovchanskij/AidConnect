import { IsString } from 'class-validator';

export class ConfirmOfferDto {
  @IsString()
  offerId: string;
}

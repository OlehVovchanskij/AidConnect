import { IsString } from 'class-validator';

export class SetPublicKeyDto {
  @IsString()
  publicKey: string;
}

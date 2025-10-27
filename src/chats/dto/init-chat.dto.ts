import { IsArray, IsOptional, IsString } from 'class-validator';
export class InitChatDto {
  @IsArray()
  participants: string[]; // user ids

  // encryptedKeys: [{ userId, encryptedKey }]
  @IsArray()
  encryptedKeys: { userId: string; encryptedKey: string }[];

  @IsOptional()
  @IsString()
  requestId?: string;
}

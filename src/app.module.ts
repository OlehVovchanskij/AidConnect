import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import { RequestsModule } from './requests/requests.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Дозволяє доступ до конфігурації у всьому додатку
    }),
    MongooseModule.forRoot(
      `mongodb+srv://ovovcanskij:${process.env.DB_PASS}@cluster0.mr4zeac.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
    ),
    AuthModule,
    UsersModule,
    ChatsModule,
    RequestsModule,
  ],
})
export class AppModule {}

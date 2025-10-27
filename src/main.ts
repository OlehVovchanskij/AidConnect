import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Help Request API')
    .setDescription('API для системи взаємодопомоги')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    console.log('Swagger UI is available at http://localhost:3000/api');
  });
}
bootstrap();

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // disponible en toda la app sin importar cada vez
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

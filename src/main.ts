import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppContext } from './app.context';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const context = app.get<AppContext>(AppContext);
    context.start();
}
bootstrap();

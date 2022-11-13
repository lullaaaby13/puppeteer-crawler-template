import { CacheModule, Module } from '@nestjs/common';
import { AppContext } from './app.context';

@Module({
    imports: [
        CacheModule.register(),
    ],
    providers: [AppContext],
})
export class AppModule {}

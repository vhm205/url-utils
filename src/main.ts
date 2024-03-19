import { NestFactory } from '@nestjs/core';
import {
  Logger,
  RequestMethod,
  VersioningType,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import helmet from 'helmet';
import { MainModule } from './main.module';
import env from '@environments';

async function bootstrap() {
  const app = await NestFactory.create(MainModule);

  if (env.NODE_ENV === 'production') {
    app.use(
      helmet({
        frameguard: {
          action: 'deny',
        },
        hidePoweredBy: true,
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'none'"],
            scriptSrc: ["'none'"],
            requireTrustedTypesFor: ["'script'"],
          },
        },
      }),
    );
    app.enableCors({
      origin: env.CORS_ORIGINS?.split('|'),
    });
  }

  app.setGlobalPrefix('api', {
    exclude: [
      {
        path: 'health/(.*)',
        method: RequestMethod.GET,
      },
    ],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: VERSION_NEUTRAL,
  });

  await app.listen(env.PORT);

  Logger.log(`🚀  Server is listening on port ${env.PORT}`, 'Bootstrap');
}
bootstrap();

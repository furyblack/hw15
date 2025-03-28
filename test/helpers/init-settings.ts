import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { deleteAllData } from './delete-all-data';
import { AuthTestManager } from './auth-test-manager';
import { EmailService } from '../../src/moduls/notifications/email.service';

export const initSettings = async (
  configureModule?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const testingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  // Мокаем EmailService
  testingModuleBuilder.overrideProvider(EmailService).useValue({
    sendConfirmationEmail: jest.fn().mockResolvedValue(true),
  });

  if (configureModule) {
    configureModule(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();
  const app = testingAppModule.createNestApplication();
  appSetup(app);

  await app.init();
  const databaseConnection = app.get<Connection>(getConnectionToken());
  const emailService = app.get<EmailService>(EmailService);

  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    authTestManager: new AuthTestManager(app, emailService),
  };
};

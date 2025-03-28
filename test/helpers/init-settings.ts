import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { deleteAllData } from './delete-all-data';
import { UsersTestManager } from './users-test-manager';

export const initSettings = async (
  configureModule?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  if (configureModule) {
    configureModule(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();
  const app = testingAppModule.createNestApplication();
  appSetup(app);

  await app.init();
  const databaseConnection = app.get<Connection>(getConnectionToken());
  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    userTestManger: new UsersTestManager(app), // Добавляем создание менеджера
  };
};

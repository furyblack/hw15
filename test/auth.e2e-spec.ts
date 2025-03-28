import { HttpStatus, INestApplication } from '@nestjs/common';
import { AuthTestManager } from './helpers/auth-test-manager';
import { initSettings } from './helpers/init-settings';
import { JwtService } from '@nestjs/jwt';
import { deleteAllData } from './helpers/delete-all-data';

describe('auth', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) => {
      moduleBuilder.overrideProvider(JwtService).useValue(
        new JwtService({
          secret: 'access-token-secret',
          signOptions: { expiresIn: '2s' },
        }),
      );
    });
    app = result.app;
    authTestManager = result.authTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  it('should register and login user', async () => {
    const registerData = {
      login: 'mihf',
      email: 'test@example.com',
      password: 'Test1234!',
    };

    // Регистрация
    await authTestManager.registerUser(registerData, HttpStatus.NO_CONTENT);

    // Логин (используем loginOrEmail вместо login)
    const { accessToken, refreshToken } = await authTestManager.login({
      loginOrEmail: registerData.login, // Можно использовать и email
      password: registerData.password,
    });

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    // Проверка /me
    const meResponse = await authTestManager.getMe(accessToken);
    expect(meResponse.body.login).toBe(registerData.login);
    expect(meResponse.body.email).toBe(registerData.email);
  });
});

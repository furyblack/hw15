import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CreateUserDto } from '../../src/moduls/user-accounts/dto/create-user.dto';
import { EmailService } from '../../src/moduls/notifications/email.service';

export class AuthTestManager {
  constructor(
    private app: INestApplication,
    private emailService: EmailService,
  ) {}

  async registerUser(
    registerModel: CreateUserDto,
    expectedStatus: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    jest.spyOn(this.emailService, 'sendConfirmationEmail').mockResolvedValue();

    await request(this.app.getHttpServer())
      .post('/api/auth/registration')
      .send(registerModel)
      .expect(expectedStatus);
  }

  async login(
    credentials: { loginOrEmail: string; password: string }, // Изменено с login на loginOrEmail
    expectedStatus: number = HttpStatus.OK,
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    const response = await request(this.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        loginOrEmail: credentials.loginOrEmail, // Соответствует LocalStrategy
        password: credentials.password,
      })
      .expect(expectedStatus);

    let refreshToken;
    if (response.headers['set-cookie']) {
      refreshToken = response.headers['set-cookie'][0]
        .split(';')[0]
        .split('=')[1];
    }

    return {
      accessToken: response.body?.accessToken,
      refreshToken,
    };
  }

  async getMe(accessToken: string, expectedStatus: number = HttpStatus.OK) {
    return request(this.app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(expectedStatus);
  }
}

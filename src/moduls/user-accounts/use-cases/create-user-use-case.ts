import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from '../application/crypto.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { BadRequestDomainException } from '../../../core/exceptions/domain-exceptions';

export class CreateUserUseCase {
  constructor(
    //инжектированное модели в сервис через DI
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute(dto: CreateUserDto) {
    const userWithTheSameLogin = await this.usersRepository.findByLogin(
      dto.login,
    );
    if (userWithTheSameLogin) {
      throw BadRequestDomainException.create(
        'User with the same login already exists',
        'login',
      );
    }

    const userWithTheSameEmail = await this.usersRepository.findByEmail(
      dto.email,
    );
    if (userWithTheSameEmail) {
      throw BadRequestDomainException.create(
        'User with the same email already exists',
        'email',
      );
    }

    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash,
    });

    try {
      await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === 11000) {
        throw BadRequestDomainException.create(
          'Duplicate login or email',
          'id',
        );
      }
      throw error; // если ошибка не связана с уникальностью, выбрасываем дальше
    }

    return user._id;
  }
}

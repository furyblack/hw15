import { Types } from 'mongoose';
import { UsersRepository } from '../infrastructure/users.repository';

export class DeleteUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(id: string) {
    const user = await this.usersRepository.findOrNotFoundFail(
      new Types.ObjectId(id),
    );

    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}

import { Trim } from '../../../../core/decorators/transform/trim';
import { IsString, Length } from 'class-validator';

export class CommentInputDto {
  @Trim()
  @IsString()
  @Length(30, 300)
  content: string;
}

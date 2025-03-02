import { IsString, Length } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class CreatePostForBlogInputDto {
  @IsString()
  @Length(3, 30)
  @Trim()
  title: string;

  @IsString()
  @Length(3, 100)
  @Trim()
  shortDescription: string;

  @IsString()
  @Length(3, 1000)
  @Trim()
  content: string;
}

export class CreatePostInputDto extends CreatePostForBlogInputDto {
  @IsString()
  @Trim()
  blogId: string;
}

export class CreatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
export class UpdatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
}

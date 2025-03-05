import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DeletionStatus } from '../../../user-accounts/domain/user.entity';
import {
  CreatePostForBlogInputDto,
  CreatePostInputDto,
} from '../dto/create-post.dto';
import { HydratedDocument, Model } from 'mongoose';
import { LikeStatusType } from '../likes/like-model';

type newestLikes = {
  addedAt: string;
  userId: string;
  login: string;
};
@Schema({ timestamps: true })
export class Post {
  @Prop()
  title: string;
  @Prop()
  content: string;
  @Prop()
  blogId: string;
  @Prop()
  blogName: string;
  @Prop()
  shortDescription: string;
  createdAt: Date;
  @Prop()
  likesCount: number;
  @Prop()
  dislikesCount: number;
  @Prop({ type: Array, default: [] })
  newestLikes: newestLikes[];
  @Prop({ enum: DeletionStatus, default: DeletionStatus.NotDeleted })
  deletionStatus: DeletionStatus;

  static createInstance(
    dto: CreatePostInputDto & { blogName: string },
  ): PostDocument {
    const post = new this();
    post.title = dto.title;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;
    post.shortDescription = dto.shortDescription;
    post.createdAt = new Date();
    post.likesCount = 0;
    post.dislikesCount = 0;
    post.newestLikes = [];
    post.deletionStatus = DeletionStatus.NotDeleted;
    return post as PostDocument;
  }

  makeDeleted() {
    if (this.deletionStatus !== DeletionStatus.NotDeleted) {
      throw new Error('Entity already deleted');
    }
    this.deletionStatus = DeletionStatus.PermanentDeleted;
  }
  update(dto: CreatePostForBlogInputDto) {
    this.title = dto.title;
    this.content = dto.content;
    this.shortDescription = dto.shortDescription;
  }

  updateLikeStatus(
    userId: string,
    likeStatus: LikeStatusType,
    userLogin: string,
  ) {
    const existingLikeIndex = this.newestLikes.findIndex(
      (like) => like.userId === userId,
    );

    // Удаляем текущий статус пользователя
    if (existingLikeIndex !== -1) {
      const existingLike = this.newestLikes[existingLikeIndex];
      if (existingLike) {
        if (this.likesCount > 0) {
          this.likesCount -= 1;
        }
      }
      this.newestLikes.splice(existingLikeIndex, 1);
    }

    // Добавляем новый статус
    if (likeStatus === 'Like') {
      this.newestLikes.push({
        userId,
        login: userLogin,
        addedAt: new Date().toISOString(),
      });
      this.likesCount += 1;
    } else if (likeStatus === 'Dislike') {
      this.dislikesCount += 1;
    }

    // Если статус "None", просто удаляем лайк/дизлайк
    if (likeStatus === 'None' && existingLikeIndex !== -1) {
      if (this.dislikesCount > 0) {
        this.dislikesCount -= 1;
      }
    }
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<PostDocument> & typeof Post;

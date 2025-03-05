import { CommentDocument } from '../domain/comment.entity';

export class CommentsViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
  };
  createdAt: Date;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };

  static mapToView(comment: CommentDocument): CommentsViewDto {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
      likesInfo: comment.likesInfo,
    };
  }
}

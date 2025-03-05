import { LikeStatus } from './decorators/like-status-decorator';

export class LikeToPostCreateModel {
  @LikeStatus()
  likeStatus: LikeStatusType;
}

export type LikeStatusType = 'None' | 'Like' | 'Dislike';

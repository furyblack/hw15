import { Controller, Get, Param } from '@nestjs/common';
import { CommentsViewDto } from '../dto/comment-output-type';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';

@Controller('comments')
export class CommentsController {
  constructor(private commentQueryRepository: CommentsQueryRepository) {}
  @Get(':id')
  async getComment(@Param('id') id: string): Promise<CommentsViewDto> {
    return this.commentQueryRepository.getCommentById(id);
  }
}

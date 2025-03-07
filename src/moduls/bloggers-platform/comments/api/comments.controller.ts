import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentsViewDto } from '../dto/comment-output-type';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { UpdateCommentDto } from '../dto/comment-input-dto';
import { CommentsService } from '../application/comments.service';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentQueryRepository: CommentsQueryRepository,
    private readonly commentsService: CommentsService,
  ) {}
  @Get(':id')
  async getComment(@Param('id') id: string): Promise<CommentsViewDto> {
    return this.commentQueryRepository.getCommentById(id);
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('id') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req, // Получаем пользователя из запроса
  ) {
    const userId = req.user.userId; // Предполагаем, что userId хранится в токене
    await this.commentsService.updateComment(
      commentId,
      updateCommentDto.content,
      userId,
    );
    return { message: 'Comment updated successfully' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('id') commentId: string,
    @Request() req, // Получаем пользователя из запроса
  ) {
    const userId = req.user.userId; // Предполагаем, что userId хранится в токене
    await this.commentsService.deleteComment(commentId, userId);
    return { message: 'Comment deleted successfully' };
  }
}

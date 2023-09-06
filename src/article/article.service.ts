import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from '@app/user/user.entity';
import { CreateArticleDto } from '@app/article/dto/createArticle.dto';
import { ArticleEntity } from '@app/article/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ArticleResponseInterface } from '@app/article/types/articleResponse.interface';
import slugify from 'slugify';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}
  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = this.getSug(createArticleDto.title);

    article.author = currentUser;

    return await this.articleRepository.save(article);
  }

  async getArticle(slug: string): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException('Article is not found', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  async updateArticle(
    currentUserId: number,
    slug: string,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({ where: { slug } });
    if (!article) {
      throw new HttpException(
        'Article is does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    if (currentUserId !== article.author.id) {
      throw new HttpException('You are is not author', HttpStatus.FORBIDDEN);
    }

    Object.assign(article, createArticleDto);

    return await this.articleRepository.save(article);
  }

  async deleteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);
    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }

  async findBySlug(slug: string) {
    return await this.articleRepository.findOne({ where: { slug } });
  }
  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  private getSug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}

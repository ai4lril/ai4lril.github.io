import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LanguagesService } from './languages.service';

@ApiTags('languages')
@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) { }

  @Get()
  @ApiOperation({ summary: 'Get supported languages (cached)' })
  async getLanguages() {
    return this.languagesService.getLanguages();
  }
}

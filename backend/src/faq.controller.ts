import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { FAQService } from './faq.service';

@Controller('community/faq')
export class FAQController {
  constructor(private readonly faqService: FAQService) {}

  @Get()
  async getFAQs(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.faqService.getFAQs(category, search);
  }

  @Get(':id')
  async getFAQ(@Param('id') id: string) {
    return this.faqService.getFAQ(id);
  }

  @Post(':id/helpful')
  async markHelpful(
    @Param('id') id: string,
    @Body() body: { helpful: boolean },
  ) {
    await this.faqService.markHelpful(id, body.helpful);
    return { success: true };
  }
}

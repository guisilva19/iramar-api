import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  @Get()
  getHealthCheck() {
    return {
      status: 'ok',
      message: 'Iramar API is running',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    console.log('=== WEBHOOK RECEBIDO ===');
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(body, null, 2));
    console.log('Query params:', req.query);
    console.log('========================');

    // Responde com sucesso
    res.status(200).json({
      message: 'Webhook recebido com sucesso',
      timestamp: new Date().toISOString(),
      bodyReceived: body
    });
  }
} 
import { Request, Response, NextFunction } from 'express';
import { SchedulingService } from './scheduling.service';

import PDFDocument from 'pdfkit';

export class SchedulingController {
  constructor(private schedulingService: SchedulingService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const senderId = req.user!.id;

      const scheduling = await this.schedulingService.create(
        req.body,
        senderId,
      );
      return res.status(201).json(scheduling);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const scheduling = await this.schedulingService.findById(String(id));
      return res.status(200).json(scheduling);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, startDate } = req.query;

      let parsedDate: Date | undefined;

      if (startDate) {
        if (typeof startDate !== 'string') {
          return res.status(400).json('O parâmetro deve ser uma string');
        }

        parsedDate = new Date(startDate);

        if (isNaN(parsedDate.getTime())) {
          return res
            .status(400)
            .json('Formato de data inválido. Utilize YYYY-MM-DD');
        }
      }

      const scheduling = await this.schedulingService.findAll({
        status: status as any,
        startDate: parsedDate,
      });
      return res.status(200).json(scheduling);
    } catch (error) {
      next(error);
    }
  };

  addService = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { schedulingId } = req.params;
      const { serviceId } = req.body;
      const scheduling = await this.schedulingService.addService(
        String(schedulingId),
        serviceId,
      );

      return res.status(200).json(scheduling);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const scheduling = await this.schedulingService.updateStatus(
        String(id),
        status,
      );
      return res.status(200).json(scheduling);
    } catch (error) {
      next(error);
    }
  };

  generateReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const receipt = await this.schedulingService.generateReceipt(String(id));

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=comprovante.pdf',
      );

      const doc = new PDFDocument();
      doc.pipe(res);

      doc.fontSize(20).text('Comprovante de Agendamento');
      doc.text(`Cliente: ${receipt.client}`);
      doc.text(`Placa: ${receipt.plate}`);
      doc.text(`Veículo: ${receipt.car}`);
      doc.text(`Previsto para: ${receipt.endDate}`);
      doc.text(
        `Serviços a serem prestados: ${Array.isArray(receipt.service) ? receipt.service.join(', ') : receipt.service}`,
      );

      doc.end();
    } catch (error) {
      next(error);
    }
  };
}

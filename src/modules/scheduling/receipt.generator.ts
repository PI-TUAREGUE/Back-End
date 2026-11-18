import PDFDocument from 'pdfkit';
import { ReceiptDTO } from './scheduling.service';

export class ReceiptGenerator {
  static generate(receipt: ReceiptDTO): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      margin: 40,
      size: 'A4',
    });

    doc.rect(0, 0, 595.28, 105).fill('#141416');
    doc.rect(0, 105, 595.28, 4).fill('#FF7A00');

    doc
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .fontSize(22)
      .text('TUAREGUE', 40, 28);

    doc
      .fillColor('#FF7A00')
      .font('Helvetica')
      .fontSize(10)
      .text('MECÂNICA E CENTRO AUTOMOTIVO', 40, 56);

    doc
      .fillColor('#9E9EA7')
      .font('Helvetica')
      .fontSize(9)
      .text('Comprovante de Agendamento', 40, 74);

    const formattedDate = receipt.endDate
      ? new Date(receipt.endDate).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Data a confirmar';

    doc
      .fillColor('#A0A0A5')
      .font('Helvetica')
      .fontSize(9)
      .text('PREVISÃO DE ENTREGA', 380, 42, { width: 175, align: 'right' });

    doc
      .fillColor('#FF7A00')
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(formattedDate, 380, 58, { width: 175, align: 'right' });

    doc
      .fillColor('#141416')
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('DADOS DO CLIENTE E VEÍCULO', 40, 135);

    doc
      .strokeColor('#E2E2E8')
      .lineWidth(1)
      .moveTo(40, 152)
      .lineTo(555, 152)
      .stroke();

    doc.roundedRect(40, 162, 515, 85, 6).fillAndStroke('#F8F8FA', '#E5E5EB');

    doc
      .fillColor('#71717A')
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .text('CLIENTE', 55, 174);
    doc
      .fillColor('#18181B')
      .font('Helvetica')
      .fontSize(10.5)
      .text(receipt.client || 'Não informado', 55, 187);

    doc
      .fillColor('#71717A')
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .text('TELEFONE', 55, 207);
    doc
      .fillColor('#18181B')
      .font('Helvetica')
      .fontSize(10.5)
      .text(receipt.clientTel || 'Não informado', 55, 220);

    doc
      .fillColor('#71717A')
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .text('VEÍCULO', 310, 174);
    doc
      .fillColor('#18181B')
      .font('Helvetica')
      .fontSize(10.5)
      .text(receipt.car || 'Não informado', 310, 187);

    doc
      .fillColor('#71717A')
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .text('PLACA', 310, 207);
    doc
      .fillColor('#FF7A00')
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(receipt.plate || 'Não informado', 310, 220);

    const servicesSectionY = 270;
    doc
      .fillColor('#141416')
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('SERVIÇOS CONTRATADOS', 40, servicesSectionY);

    doc
      .strokeColor('#E2E2E8')
      .lineWidth(1)
      .moveTo(40, servicesSectionY + 17)
      .lineTo(555, servicesSectionY + 17)
      .stroke();

    const tableHeaderY = servicesSectionY + 27;
    doc.roundedRect(40, tableHeaderY, 515, 22, 4).fill('#141416');
    doc
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .text('#', 55, tableHeaderY + 6);
    doc
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .text('DESCRIÇÃO DO SERVIÇO', 85, tableHeaderY + 6);
    doc
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .text('STATUS', 440, tableHeaderY + 6, {
        width: 100,
        align: 'right',
      });

    const servicesList = Array.isArray(receipt.service)
      ? receipt.service
      : typeof receipt.service === 'string'
        ? (receipt.service as string).split(',').map((s) => s.trim())
        : [];

    let currentY = tableHeaderY + 23;

    if (servicesList.length === 0) {
      doc
        .fillColor('#71717A')
        .font('Helvetica')
        .fontSize(9.5)
        .text('Nenhum serviço vinculado ao agendamento.', 55, currentY + 10);
      currentY += 30;
    } else {
      servicesList.forEach((serviceItem, index: number) => {
        const serviceName = String(serviceItem);
        const rowBg = index % 2 === 0 ? '#FFFFFF' : '#FAFAFC';
        doc.rect(40, currentY, 515, 24).fillAndStroke(rowBg, '#EDEDF2');

        doc
          .fillColor('#FF7A00')
          .font('Helvetica-Bold')
          .fontSize(9)
          .text(String(index + 1).padStart(2, '0'), 55, currentY + 7);

        doc
          .fillColor('#27272A')
          .font('Helvetica')
          .fontSize(9.5)
          .text(serviceName, 85, currentY + 7);

        doc
          .fillColor('#16A34A')
          .font('Helvetica-Bold')
          .fontSize(8.5)
          .text('AGENDADO', 440, currentY + 7, {
            width: 100,
            align: 'right',
          });

        currentY += 24;
      });
    }

    currentY += 25;
    doc
      .roundedRect(40, currentY, 515, 60, 6)
      .fillAndStroke('#FFF7ED', '#FED7AA');

    doc
      .fillColor('#EA580C')
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .text('TERMOS E OBSERVAÇÕES', 55, currentY + 10);

    doc
      .fillColor('#7C2D12')
      .font('Helvetica')
      .fontSize(8)
      .text(
        'Este comprovante formaliza a entrada ou agendamento do veículo na oficina Tuaregue. O prazo estimado de conclusão poderá sofrer alterações mediante aprovação prévia caso sejam identificadas avarias adicionais durante a desmontagem e diagnóstico.',
        55,
        currentY + 22,
        { width: 485, lineGap: 2 },
      );

    const signY = currentY + 105;
    doc
      .strokeColor('#A1A1AA')
      .lineWidth(0.8)
      .moveTo(60, signY)
      .lineTo(250, signY)
      .stroke();
    doc
      .strokeColor('#A1A1AA')
      .lineWidth(0.8)
      .moveTo(345, signY)
      .lineTo(535, signY)
      .stroke();

    doc
      .fillColor('#52525B')
      .font('Helvetica')
      .fontSize(8.5)
      .text('Assinatura do Cliente', 60, signY + 6, {
        width: 190,
        align: 'center',
      });

    doc
      .fillColor('#52525B')
      .font('Helvetica')
      .fontSize(8.5)
      .text('Tuaregue Mecânica Automotiva', 345, signY + 6, {
        width: 190,
        align: 'center',
      });

    doc
      .fillColor('#A1A1AA')
      .font('Helvetica')
      .fontSize(7.5)
      .text(
        'Tuaregue Centro Automotivo • Documento emitido eletronicamente',
        40,
        795,
        { align: 'center', width: 515 },
      );

    return doc;
  }
}

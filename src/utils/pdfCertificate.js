import { jsPDF } from 'jspdf';

export const generateCertificatePDF = (employeeName, courseTitle, score, xpEarned, dateString) => {
  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth(); // 297
  const height = doc.internal.pageSize.getHeight(); // 210

  // 1. Draw Paper background (warm white: #FFFDF9 -> RGB: 255, 253, 249)
  doc.setFillColor(255, 253, 249);
  doc.rect(0, 0, width, height, 'F');

  // 2. Draw thick black border (3mm)
  doc.setDrawColor(17, 17, 17); // ink-black
  doc.setLineWidth(2.5);
  doc.rect(8, 8, width - 16, height - 16, 'S');

  // 3. Draw thin secondary border offset (1.5mm inside)
  doc.setLineWidth(0.8);
  doc.rect(12, 12, width - 24, height - 24, 'S');

  // Decorative brutalist corner '+' marks
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(17, 17, 17);
  doc.text('+', 15, 20);
  doc.text('+', width - 20, 20);
  doc.text('+', 15, height - 15);
  doc.text('+', width - 20, height - 15);

  // 4. Header: GLOBIVA logo mock & Branding
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(139, 29, 29); // brand-red
  doc.text('G', 20, 25);
  doc.setDrawColor(139, 29, 29);
  doc.setLineWidth(1.5);
  // draw G circle
  doc.circle(21, 23, 4, 'S');
  doc.setTextColor(17, 17, 17);
  doc.setFontSize(16);
  doc.text('GLOBIVA', 28, 25);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text('LEARN PLATFORM', 28, 30);

  // 5. Title: CERTIFICATE OF ACHIEVEMENT
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(17, 17, 17);
  doc.text('CERTIFICATE OF COMPLETION', width / 2, 60, { align: 'center' });

  // Draw a thick brutalist line below title
  doc.setDrawColor(17, 17, 17);
  doc.setFillColor(17, 17, 17);
  doc.rect((width - 180) / 2, 66, 180, 2, 'FD');

  // 6. Recipient Subtitle
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(80, 80, 80);
  doc.text('THIS IS PROUDLY PRESENTED TO', width / 2, 85, { align: 'center' });

  // 7. Employee Name (Big, bold, brand-red-dark)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(94, 19, 19); // brand-red-dark
  doc.text(employeeName.toUpperCase(), width / 2, 102, { align: 'center' });

  // 8. Body
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(80, 80, 80);
  doc.text('for successfully playing, learning, and passing the evaluation for the training course', width / 2, 118, { align: 'center' });

  // 9. Course Title (Bold brand-red)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(139, 29, 29); // brand-red
  doc.text(`"${courseTitle}"`, width / 2, 132, { align: 'center' });

  // 10. Stats Box (Chunky brutalist cards)
  const statsX = (width - 140) / 2;
  const statsY = 145;

  // Box background
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(17, 17, 17);
  doc.setLineWidth(1.2);
  doc.rect(statsX, statsY, 140, 22, 'FD');
  // Offset shadow for stats box
  doc.setFillColor(17, 17, 17);
  doc.rect(statsX + 2, statsY + 22, 140, 2, 'F');
  doc.rect(statsX + 140, statsY + 2, 2, 22, 'F');

  // Stat texts
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(17, 17, 17);
  doc.text(`FINAL SCORE: ${score}%`, statsX + 15, statsY + 14);
  doc.text(`ENGAGEMENT XP: ${xpEarned} XP`, statsX + 75, statsY + 14);

  // 11. Date and Signatures
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  
  // Date Left
  doc.text(`Issued On: ${dateString}`, 25, 185);
  doc.line(25, 180, 80, 180);

  // Signature Right
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(17, 17, 17);
  doc.text('AUTHORIZED TRAINING LEAD', width - 85, 185);
  doc.setFont('Courier', 'bolditalic');
  doc.setFontSize(14);
  doc.setTextColor(139, 29, 29);
  doc.text('Globiva QA Team', width - 80, 175);
  doc.setDrawColor(17, 17, 17);
  doc.setLineWidth(0.5);
  doc.line(width - 85, 180, width - 25, 180);

  // Save the certificate
  const filename = `${employeeName.replace(/\s+/g, '_')}_${courseTitle.replace(/\s+/g, '_')}_Certificate.pdf`;
  doc.save(filename);
};

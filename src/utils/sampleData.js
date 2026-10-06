export const SAMPLE_TENDER_DATA = {
  tender: {
    tender_id: "IFT-2026-8842",
    title: "Construction of Multi-Purpose Academic Building",
    procuring_entity: "Public Works Department (PWD)",
    bidder: "Apex Engineering & Construction Ltd.",
    submission_deadline: "2026-12-31"
  },
  requirements: [
    {
      id: "req_1",
      order: 1,
      title_en: "Trade License (Valid)",
      title_bn: "ট্রেড লাইসেন্স (হালনাগাদ)",
      mandatory: true,
      has_expiry: true
    },
    {
      id: "req_2",
      order: 2,
      title_en: "TIN & Tax Clearance Certificate",
      title_bn: "টিআইএন এবং ট্যাক্স ক্লিয়ারেন্স সার্টিফিকেট",
      mandatory: true,
      has_expiry: false
    },
    {
      id: "req_3",
      order: 3,
      title_en: "VAT Registration Certificate",
      title_bn: "ভ্যাট রেজিস্ট্রেশন সার্টিফিকেট",
      mandatory: true,
      has_expiry: false
    },
    {
      id: "req_4",
      order: 4,
      title_en: "Bank Solvency Certificate",
      title_bn: "ব্যাংক সলভেন্সি সার্টিফিকেট",
      mandatory: true,
      has_expiry: true
    },
    {
      id: "req_5",
      order: 5,
      title_en: "Similar Work Experience Certificate",
      title_bn: "সমজাতীয় কাজের অভিজ্ঞতার সনদ",
      mandatory: false,
      has_expiry: false
    }
  ]
};

export async function generateSamplePdf(title, pages = 1) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 1; i <= pages; i++) {
    const page = pdfDoc.addPage([595.28, 841.89]);
    page.drawText(title, {
      x: 50,
      y: 780,
      size: 18,
      font: font,
      color: rgb(0.1, 0.3, 0.6),
    });
    page.drawText(`Sample Attachment Document - Page ${i} of ${pages}`, {
      x: 50,
      y: 750,
      size: 12,
      font: regular,
      color: rgb(0.3, 0.3, 0.3),
    });
    page.drawRectangle({
      x: 50,
      y: 100,
      width: 495,
      height: 620,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes.buffer;
}

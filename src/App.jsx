import React, { useState } from "react";
import { getRequirementStatus, computeFileHash, validatePdfFile } from "./utils/tenderLogic";
import { SAMPLE_TENDER_DATA, generateSamplePdf } from "./utils/sampleData";
import Step1Requirements from "./components/Step1Requirements";
import Step2Upload from "./components/Step2Upload";
import Step3Match from "./components/Step3Match";
import SummaryBar from "./components/SummaryBar";

export default function App() {
  const [lang, setLang] = useState("en"); // 'en' | 'bn'
  const [tenderData, setTenderData] = useState(SAMPLE_TENDER_DATA);
  const [files, setFiles] = useState([]); // { id, name, size, pageCount, arrayBuffer, hash }
  const [matches, setMatches] = useState({}); // reqId -> fileId
  const [expiries, setExpiries] = useState({}); // reqId -> date string
  const [undoStack, setUndoStack] = useState([]);
  const [generating, setGenerating] = useState(false);

  const handleJsonUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setTenderData(json);
        setMatches({});
        setExpiries({});
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSampleData = () => {
    setTenderData(SAMPLE_TENDER_DATA);
  };

  const handleGenerateSamplePdfs = async () => {
    if (!tenderData) return;
    const sampleFiles = [];
    const initialMatches = {};
    const initialExpiries = {};

    for (let req of tenderData.requirements) {
      const buffer = await generateSamplePdf(`${req.order}. ${req.title_en}`, req.order === 1 ? 2 : 1);
      const hash = await computeFileHash(buffer);
      const fileId = `sample_${req.id}`;
      
      sampleFiles.push({
        id: fileId,
        name: `${req.title_en.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
        size: buffer.byteLength,
        pageCount: req.order === 1 ? 2 : 1,
        arrayBuffer: buffer,
        hash,
      });

      initialMatches[req.id] = fileId;

      if (req.has_expiry) {
        // Set expiry date to 2027-06-30 (valid)
        initialExpiries[req.id] = "2027-06-30";
      }
    }

    setFiles(sampleFiles);
    setMatches(initialMatches);
    setExpiries(initialExpiries);
  };

  const handlePdfUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const newFiles = [...files];
    const { PDFDocument } = await import("pdf-lib");

    for (let f of uploadedFiles) {
      const validation = await validatePdfFile(f);
      if (!validation.valid) {
        alert(`File ${f.name}: ${validation.error}`);
        continue;
      }
      const buffer = await f.arrayBuffer();
      const hash = await computeFileHash(buffer);
      
      try {
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        newFiles.push({
          id: Math.random().toString(36).substring(2, 9),
          name: f.name,
          size: f.size,
          pageCount: pdfDoc.getPageCount(),
          arrayBuffer: buffer,
          hash,
        });
      } catch (err) {
        alert(`Could not parse PDF ${f.name}: Password protected or corrupted.`);
      }
    }
    setFiles(newFiles);
  };

  const handleRemoveFile = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId));
    const newMatches = { ...matches };
    for (const [rId, fId] of Object.entries(newMatches)) {
      if (fId === fileId) delete newMatches[rId];
    }
    setMatches(newMatches);
  };

  const hashCounts = files.reduce((acc, f) => {
    acc[f.hash] = (acc[f.hash] || 0) + 1;
    return acc;
  }, {});

  const handleMatchChange = (reqId, fileId) => {
    setUndoStack([...undoStack, { matches: { ...matches }, expiries: { ...expiries } }]);
    setMatches({ ...matches, [reqId]: fileId });
  };

  const handleExpiryChange = (reqId, dateStr) => {
    setUndoStack([...undoStack, { matches: { ...matches }, expiries: { ...expiries } }]);
    setExpiries({ ...expiries, [reqId]: dateStr });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setMatches(prev.matches);
    setExpiries(prev.expiries);
    setUndoStack(undoStack.slice(0, -1));
  };

  const requirementStatuses = tenderData?.requirements.map(req => {
    const fileId = matches[req.id];
    const file = files.find(f => f.id === fileId);
    const expiry = expiries[req.id] || "";
    const status = getRequirementStatus(req, file, expiry, tenderData.tender.submission_deadline);
    return { req, file, status };
  }) || [];

  const blockingStatuses = ["Missing", "Expiry date needed", "Expired"];
  const blockCount = requirementStatuses.filter(item => blockingStatuses.includes(item.status)).length;
  const hasBlockers = blockCount > 0;

  const generatePackagePdf = async () => {
    setGenerating(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");

      const mergedPdf = await PDFDocument.create();

      const timesRomanFont = await mergedPdf.embedFont(StandardFonts.TimesRoman);
      const timesBold = await mergedPdf.embedFont(StandardFonts.TimesBold);

      const tender = tenderData.tender;
      const todayStr = new Date().toISOString().split("T")[0];

      // 1. Cover Page
      const coverPage = mergedPdf.addPage([595.28, 841.89]); // A4
      coverPage.drawText(`TENDER SUBMISSION PACKAGE`, { x: 50, y: 750, size: 22, font: timesBold, color: rgb(0, 0.2, 0.4) });
      coverPage.drawText(`Tender ID: ${tender.tender_id}`, { x: 50, y: 700, size: 14, font: timesBold });
      coverPage.drawText(`Title: ${tender.title}`, { x: 50, y: 675, size: 12, font: timesRomanFont });
      coverPage.drawText(`Procuring Entity: ${tender.procuring_entity}`, { x: 50, y: 650, size: 12, font: timesRomanFont });
      coverPage.drawText(`Bidder: ${tender.bidder}`, { x: 50, y: 625, size: 12, font: timesRomanFont });
      coverPage.drawText(`Submission Deadline: ${tender.submission_deadline}`, { x: 50, y: 600, size: 12, font: timesRomanFont });
      coverPage.drawText(`Generated On: ${todayStr}`, { x: 50, y: 575, size: 12, font: timesRomanFont });

      coverPage.drawText(`Included Documents:`, { x: 50, y: 530, size: 14, font: timesBold });
      let currentY = 505;
      tenderData.requirements.forEach(req => {
        const fileId = matches[req.id];
        if (fileId) {
          const file = files.find(f => f.id === fileId);
          if (file) {
            coverPage.drawText(`${req.order}. ${req.title_en} (${file.name})`, { x: 70, y: currentY, size: 10, font: timesRomanFont });
            currentY -= 20;
          }
        }
      });

      // 2. Append matched document PDFs
      for (let req of tenderData.requirements) {
        const fileId = matches[req.id];
        if (!fileId) continue;
        const file = files.find(f => f.id === fileId);
        if (!file) continue;

        const srcPdf = await PDFDocument.load(file.arrayBuffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
        
        for (let page of copiedPages) {
          mergedPdf.addPage(page);
        }
      }

      // 3. Add Footers (<tender_id> | Page X of Y) to all pages
      const totalPages = mergedPdf.getPageCount();
      const pages = mergedPdf.getPages();

      for (let i = 0; i < totalPages; i++) {
        const page = pages[i];
        const { width } = page.getSize();
        
        page.drawRectangle({
          x: 0,
          y: 0,
          width: width,
          height: 28,
          color: rgb(0.95, 0.95, 0.95),
        });

        page.drawText(`${tender.tender_id} | Page ${i + 1} of ${totalPages}`, {
          x: width / 2 - 60,
          y: 9,
          size: 9,
          font: timesRomanFont,
          color: rgb(0.3, 0.3, 0.3),
        });
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${tender.tender_id}_Package.pdf`;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Error generating PDF package: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-slate-200/80">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-block px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-md mb-2">
              CLIENT-SIDE PDF PACKAGE BUILDER
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {lang === "en" ? "Tender Document Package Builder" : "টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Assemble, validate requirement compliance, and generate single PDF packages.
            </p>
          </div>
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors shadow-xs shrink-0 self-start sm:self-center"
          >
            🌐 {lang === "en" ? "বাংলা" : "English"}
          </button>
        </div>

        {/* Step 1: Requirements */}
        <Step1Requirements 
          tenderData={tenderData} 
          onJsonUpload={handleJsonUpload} 
          onLoadSample={handleLoadSampleData}
          lang={lang} 
        />

        {/* Step 2: Upload Files */}
        {tenderData && (
          <Step2Upload 
            files={files} 
            onPdfUpload={handlePdfUpload} 
            onRemoveFile={handleRemoveFile} 
            onGenerateSamplePdfs={handleGenerateSamplePdfs}
            hashCounts={hashCounts} 
            lang={lang} 
          />
        )}

        {/* Step 3: Match & Validate Requirements */}
        {tenderData && (
          <Step3Match 
            requirements={tenderData.requirements}
            files={files}
            matches={matches}
            expiries={expiries}
            onMatchChange={handleMatchChange}
            onExpiryChange={handleExpiryChange}
            onUndo={handleUndo}
            undoCount={undoStack.length}
            requirementStatuses={requirementStatuses}
            blockingStatuses={blockingStatuses}
            hashCounts={hashCounts}
            lang={lang}
          />
        )}

        {/* Step 4: Summary & Package Download */}
        {tenderData && (
          <SummaryBar 
            hasBlockers={hasBlockers}
            blockCount={blockCount}
            generating={generating}
            onGenerate={generatePackagePdf}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}

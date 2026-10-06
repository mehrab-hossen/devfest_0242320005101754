import React from 'react';

export default function Step1Requirements({ tenderData, onJsonUpload, onLoadSample, lang }) {
  const t = {
    en: { 
      title: "1. Load Tender Requirements", 
      placeholder: "Select requirements.json", 
      loadSample: "⚡ Load Sample Requirements",
      or: "or upload custom JSON:"
    },
    bn: { 
      title: "১. টেন্ডারের প্রয়োজনীয়তা সমূহ লোড করুন", 
      placeholder: "requirements.json নির্বাচন করুন", 
      loadSample: "⚡ নমুনা প্রয়োজনীয়তা লোড করুন",
      or: "অথবা কাস্টম JSON আপলোড করুন:"
    }
  };

  return (
    <div className="mb-6 p-5 border border-slate-200 rounded-xl bg-slate-50/80 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
        <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">1</span>
          {t[lang].title}
        </h2>
        <button
          onClick={onLoadSample}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          {t[lang].loadSample}
        </button>
      </div>

      <div className="mt-2 text-xs text-slate-500 mb-2 font-medium">
        {t[lang].or}
      </div>

      <input 
        type="file" 
        accept=".json" 
        onChange={onJsonUpload} 
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer border border-slate-200 bg-white rounded-lg p-1" 
      />

      {tenderData && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 font-medium flex items-center gap-2">
          <span className="text-base">✅</span>
          <div>
            <span className="font-bold">{tenderData.tender.tender_id}</span> - {tenderData.tender.title}
            <span className="block text-xs text-emerald-700 font-normal">Bidder: {tenderData.tender.bidder} | Deadline: {tenderData.tender.submission_deadline}</span>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';

export default function Step2Upload({ files, onPdfUpload, onRemoveFile, onGenerateSamplePdfs, hashCounts, lang }) {
  const t = {
    en: { 
      title: "2. Upload PDF Documents", 
      remove: "Remove", 
      duplicate: "Duplicate File",
      autoSample: "⚡ Add Sample PDFs",
      hint: "Upload requirement PDF documents or generate sample PDFs to test."
    },
    bn: { 
      title: "২. পিডিএফ নথি সমূহ আপলোড করুন", 
      remove: "সরান", 
      duplicate: "ডুপ্লিকেট ফাইল",
      autoSample: "⚡ নমুনা পিডিএফ যোগ করুন",
      hint: "প্রয়োজনীয় পিডিএফ নথি আপলোড করুন অথবা পরীক্ষা করার জন্য নমুনা পিডিএফ তৈরি করুন।"
    }
  };

  return (
    <div className="mb-6 p-5 border border-slate-200 rounded-xl bg-slate-50/80 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-2">
        <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">2</span>
          {t[lang].title}
        </h2>
        {onGenerateSamplePdfs && (
          <button
            onClick={onGenerateSamplePdfs}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-1 active:scale-95"
          >
            {t[lang].autoSample}
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-3">{t[lang].hint}</p>

      <input 
        type="file" 
        multiple 
        accept=".pdf" 
        onChange={onPdfUpload} 
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer border border-slate-200 bg-white rounded-lg p-1" 
      />

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {files.map(f => {
            const isDup = hashCounts[f.hash] > 1;
            return (
              <div key={f.id} className="flex justify-between items-center bg-white p-3 border border-slate-200 rounded-lg text-sm shadow-xs hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-800 truncate text-xs">{f.name}</div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-2">
                      <span>{f.pageCount} page{f.pageCount > 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>{(f.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  {isDup && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded font-bold uppercase shrink-0">
                      {t[lang].duplicate}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => onRemoveFile(f.id)} 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-semibold px-2.5 py-1 rounded transition-colors shrink-0"
                >
                  {t[lang].remove}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

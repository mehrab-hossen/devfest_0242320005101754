import React from 'react';

export default function Step3Match({ 
  requirements, 
  files, 
  matches, 
  expiries, 
  onMatchChange, 
  onExpiryChange, 
  onUndo, 
  undoCount, 
  requirementStatuses, 
  blockingStatuses, 
  hashCounts, 
  lang 
}) {
  const t = {
    en: { title: "3. Match & Check", undo: "Undo Last Match Change", selectFile: "-- Select File --", alreadyMatched: "(Already matched)", status: "Status" },
    bn: { title: "৩. মিল করুন ও যাচাই করুন", undo: "পূর্বের পরিবর্তন বাতিল করুন", selectFile: "-- ফাইল নির্বাচন করুন --", alreadyMatched: "(ইতিমধ্যে সংযুক্ত)", status: "অবস্থা" }
  };

  return (
    <div className="mb-6 p-4 border rounded bg-gray-50 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg">{t[lang].title}</h2>
        {undoCount > 0 && (
          <button 
            onClick={onUndo} 
            className="px-3 py-1 bg-amber-100 text-amber-800 rounded text-xs font-semibold hover:bg-amber-200 transition-colors"
          >
            {t[lang].undo} ({undoCount})
          </button>
        )}
      </div>

      <div className="space-y-3">
        {requirementStatuses.map(({ req, file, status }) => {
          const isMandatory = req.mandatory;
          const statusColor = status === "OK" 
            ? "text-green-700 bg-green-50 border-green-200" 
            : blockingStatuses.includes(status) 
              ? "text-red-700 bg-red-50 border-red-200" 
              : "text-gray-700 bg-gray-100 border-gray-200";

          return (
            <div key={req.id} className="bg-white p-3.5 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-xs">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {req.order}. {lang === "bn" ? req.title_bn : req.title_en} 
                  {isMandatory && <span className="text-red-500 ml-1">*</span>}
                </div>
                <div className={`inline-block mt-1 px-2.5 py-0.5 rounded border text-xs font-semibold ${statusColor}`}>
                  {t[lang].status}: {status}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={matches[req.id] || ""}
                  onChange={(e) => onMatchChange(req.id, e.target.value)}
                  className="border rounded p-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t[lang].selectFile}</option>
                  {files.map(f => {
                    const isAlreadyMatchedElsewhere = Object.entries(matches).some(([rId, fId]) => rId !== req.id && fId === f.id);
                    const isDuplicateGroupMatched = hashCounts[f.hash] > 1 && Object.entries(matches).some(([rId, fId]) => {
                      if (rId === req.id) return false;
                      const matchedFile = files.find(mf => mf.id === fId);
                      return matchedFile && matchedFile.hash === f.hash;
                    });

                    return (
                      <option key={f.id} value={f.id} disabled={isAlreadyMatchedElsewhere || isDuplicateGroupMatched}>
                        {f.name} {isAlreadyMatchedElsewhere ? t[lang].alreadyMatched : ""}
                      </option>
                    );
                  })}
                </select>

                {req.has_expiry && matches[req.id] && (
                  <input
                    type="date"
                    value={expiries[req.id] || ""}
                    onChange={(e) => onExpiryChange(req.id, e.target.value)}
                    className="border rounded p-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                    title="Expiry Date"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

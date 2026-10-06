import React from 'react';

export default function SummaryBar({ hasBlockers, blockCount, generating, onGenerate, lang }) {
  const t = {
    en: {
      blockerMsg: `⚠️ Cannot generate package: ${blockCount} requirement(s) need attention (missing or expired).`,
      readyMsg: "✨ All requirements satisfied. Ready to generate package!",
      generateBtn: "Generate Package PDF",
      generatingBtn: "Generating..."
    },
    bn: {
      blockerMsg: `⚠️ প্যাকেজ তৈরি করা যাচ্ছে না: ${blockCount}টি প্রয়োজনীয়তা পূরণ করা হয়নি বা মেয়াদোত্তীর্ণ।`,
      readyMsg: "✨ সমস্ত প্রয়োজনীয়তা পূরণ হয়েছে। প্যাকেজ তৈরির জন্য প্রস্তুত!",
      generateBtn: "প্যাকেজ পিডিএফ তৈরি করুন",
      generatingBtn: "তৈরি হচ্ছে..."
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center bg-gray-100 p-4 rounded-lg border shadow-xs">
      <div>
        {hasBlockers ? (
          <div className="text-red-700 font-medium text-sm">
            {t[lang].blockerMsg}
          </div>
        ) : (
          <div className="text-green-700 font-medium text-sm">
            {t[lang].readyMsg}
          </div>
        )}
      </div>
      <button
        disabled={hasBlockers || generating}
        onClick={onGenerate}
        className={`mt-3 md:mt-0 px-6 py-2.5 rounded-lg text-white font-semibold transition-all shadow-sm ${
          hasBlockers || generating 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-blue-600 hover:bg-blue-700 active:scale-95"
        }`}
      >
        {generating ? t[lang].generatingBtn : t[lang].generateBtn}
      </button>
    </div>
  );
}

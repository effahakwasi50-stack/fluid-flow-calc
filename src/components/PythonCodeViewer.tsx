import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, FileCode } from 'lucide-react';
import { STREAMLIT_APP_PY_CODE } from '../utils/pythonScript';

interface PythonCodeViewerProps {
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
}

export const PythonCodeViewer: React.FC<PythonCodeViewerProps> = ({ onCopy, onDownload, copied }) => {
  const [copiedCli, setCopiedCli] = useState(false);

  const lines = STREAMLIT_APP_PY_CODE.trim().split('\n');

  const handleCopyCli = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <div id="python-code-viewer-container" className="space-y-6">
      
      {/* Execution Instructions Banner (Bento Grid) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">How to Run this Streamlit Engineering App</h3>
              <p className="text-xs text-slate-500 font-medium">Run locally in your Python environment or virtualenv in 2 simple steps.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-viewer-copy"
              onClick={onCopy}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied app.py</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Complete Script</span>
                </>
              )}
            </button>

            <button
              id="btn-viewer-download"
              onClick={onDownload}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download app.py</span>
            </button>
          </div>
        </div>

        {/* CLI steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-inner">
            <div className="font-mono text-slate-800 overflow-x-auto pr-2">
              <span className="text-slate-400 select-none mr-2 font-bold">1.</span>
              <span className="text-blue-600 font-bold">pip install</span> streamlit pandas numpy plotly
            </div>
            <button
              id="btn-copy-install-cmd"
              onClick={() => handleCopyCli('pip install streamlit pandas numpy plotly')}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
              title="Copy install command"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between shadow-inner">
            <div className="font-mono text-slate-800 overflow-x-auto pr-2">
              <span className="text-slate-400 select-none mr-2 font-bold">2.</span>
              <span className="text-emerald-600 font-bold">streamlit run</span> app.py
            </div>
            <button
              id="btn-copy-run-cmd"
              onClick={() => handleCopyCli('streamlit run app.py')}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
              title="Copy run command"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Code Editor & Viewer (Bento Grid Card) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        
        {/* Editor Tab Bar */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-bold text-xs text-slate-200">app.py</span>
            <span className="text-[11px] text-slate-400 font-mono">({lines.length} lines)</span>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-medium text-slate-300">Python 3.9+ Compatible</span>
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="hidden sm:inline font-mono text-[11px] text-slate-400">UTF-8</span>
          </div>
        </div>

        {/* Code Content with Line Numbers */}
        <div className="overflow-x-auto max-h-[620px] custom-scrollbar p-4 text-xs font-mono bg-slate-900 text-slate-200">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => {
                const lineNum = idx + 1;
                const isComment = line.trim().startsWith('#') || line.trim().startsWith('"""') || line.trim().startsWith('*');
                const isKeyword = /^(import|from|def|return|if|elif|else|for|in|while|try|except|with|as)\b/.test(line.trim());
                
                return (
                  <tr key={idx} className="hover:bg-slate-800/60 leading-5">
                    <td className="w-12 pr-4 text-right select-none text-slate-600 border-r border-slate-800 font-mono text-[11px]">
                      {lineNum}
                    </td>
                    <td className="pl-4 whitespace-pre">
                      <span className={
                        isComment 
                          ? 'text-slate-400 italic' 
                          : isKeyword 
                          ? 'text-purple-400 font-semibold' 
                          : line.includes('st.')
                          ? 'text-sky-300'
                          : line.includes('go.') || line.includes('pd.')
                          ? 'text-emerald-300'
                          : 'text-slate-200'
                      }>
                        {line}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

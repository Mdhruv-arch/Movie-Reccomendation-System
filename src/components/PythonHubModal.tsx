import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Terminal, ExternalLink, GitBranch } from 'lucide-react';
import JSZip from 'jszip';
import { PYTHON_PROJECT_FILES, CodeFile } from '../data/pythonCodebase';

interface PythonHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonHubModal: React.FC<PythonHubModalProps> = ({ isOpen, onClose }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  const currentFile = PYTHON_PROJECT_FILES[selectedFileIndex];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.content);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      PYTHON_PROJECT_FILES.forEach(file => {
        zip.file(file.filename, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cinematch_ai_movie_recommender.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating zip:', error);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-5xl h-[85vh] bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between gap-4 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Python & Streamlit Code Hub</span>
                <span className="text-[11px] font-mono font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  GitHub-Ready
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Tested Scikit-Learn training pipeline & Streamlit frontend for local deployment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isZipping ? 'Bundling...' : 'Download ZIP'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Subheader with Quick Execution Instructions */}
        <div className="px-6 py-2.5 bg-neutral-950/40 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Setup: pip install -r requirements.txt &rarr; python model_training.py &rarr; streamlit run app.py</span>
          </div>
          <div className="text-[11px] text-neutral-500">
            Full instructions in README.md
          </div>
        </div>

        {/* File Tabs & Main Viewer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Selector Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-950/50 p-3 space-y-1 overflow-y-auto">
            <div className="text-[11px] font-mono uppercase text-neutral-500 px-3 py-1.5 font-semibold">
              Project Structure
            </div>
            {PYTHON_PROJECT_FILES.map((file, idx) => {
              const active = selectedFileIndex === idx;
              return (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between gap-2 ${
                    active
                      ? 'bg-neutral-800 text-amber-300 font-semibold border border-neutral-700/60'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                  }`}
                >
                  <span className="truncate">{file.filename}</span>
                  <span className="text-[10px] text-neutral-500 uppercase">{file.language}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-neutral-950/80 overflow-hidden">
            {/* Action Bar */}
            <div className="px-4 py-2 border-b border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between gap-3">
              <span className="text-xs text-neutral-400 truncate">
                {currentFile.description}
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Content */}
            <pre className="flex-1 p-5 overflow-auto text-xs font-mono text-neutral-300 leading-relaxed selection:bg-amber-500/30 selection:text-amber-200">
              <code>{currentFile.content}</code>
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/70 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 text-neutral-500" />
            <span>Ready to push to your GitHub repository for job applications & portfolios</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs rounded-lg transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

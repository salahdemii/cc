
import React, { useState, useCallback } from 'react';
import { type ParseResult } from 'papaparse';
import { type Phrase } from './types';
import CsvUploader from './components/CsvUploader';
import PhraseTable from './components/PhraseTable';
import UploadIcon from './components/icons/UploadIcon';

// Since we load papaparse from CDN, we need to declare it globally for TypeScript
declare const Papa: any;

const App: React.FC = () => {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileParse = useCallback((file: File) => {
    setIsLoading(true);
    setError(null);
    setPhrases([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<Record<string, string>>) => {
        if (results.errors.length > 0) {
          setError(`Error parsing CSV: ${results.errors.map(e => e.message).join(', ')}`);
          setIsLoading(false);
          return;
        }

        const data = results.data;
        if (data.length === 0 || !data[0].hasOwnProperty('German') || !data[0].hasOwnProperty('Arabic')) {
          setError('Invalid CSV format. Please ensure it has "German" and "Arabic" columns.');
          setIsLoading(false);
          return;
        }

        const parsedPhrases: Phrase[] = data.map((row, index) => ({
          id: `${index}-${row.German}`,
          German: row.German?.trim() || '',
          Arabic: row.Arabic?.trim() || '',
        })).filter(p => p.German && p.Arabic); // Filter out rows with missing phrases

        setPhrases(parsedPhrases);
        setIsLoading(false);
      },
      error: (err: Error) => {
        setError(`An unexpected error occurred: ${err.message}`);
        setIsLoading(false);
      },
    });
  }, []);

  return (
    <div className="min-h-screen container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <header className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">German-Arabic Phrase Tool</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Upload a CSV, view phrases, and listen to the German audio.</p>
      </header>

      <main className="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <CsvUploader onFileParse={handleFileParse} isLoading={isLoading} />
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {isLoading && (
           <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
           </div>
        )}
        
        {!isLoading && phrases.length === 0 && !error && (
            <div className="text-center py-10 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                <div className="flex justify-center items-center mb-4">
                    <UploadIcon className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Awaiting your phrases</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Upload a CSV file to get started.</p>
            </div>
        )}

        {!isLoading && phrases.length > 0 && <PhraseTable phrases={phrases} />}
      </main>
    </div>
  );
};

export default App;

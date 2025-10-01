
import React, { useState, useEffect, useCallback } from 'react';
import { type Phrase } from '../types';
import PlayIcon from './icons/PlayIcon';
import StopIcon from './icons/StopIcon';

interface PhraseTableProps {
  phrases: Phrase[];
}

const PhraseTable: React.FC<PhraseTableProps> = ({ phrases }) => {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isApiSupported, setIsApiSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsApiSupported(false);
    }
    // Cleanup function to cancel speech when component unmounts
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlayToggle = useCallback((phrase: Phrase) => {
    if (!isApiSupported) return;

    const synth = window.speechSynthesis;
    
    // If the clicked phrase is already playing, stop it.
    if (synth.speaking && speakingId === phrase.id) {
      synth.cancel();
      setSpeakingId(null);
      return;
    }

    // Stop any other phrase that might be playing.
    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(phrase.German);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;

    utterance.onstart = () => {
      setSpeakingId(phrase.id);
    };

    utterance.onend = () => {
      setSpeakingId(null);
    };
    
    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      setSpeakingId(null);
    };

    synth.speak(utterance);
  }, [isApiSupported, speakingId]);


  if (!isApiSupported) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-lg" role="alert">
        <p><strong className="font-bold">Unsupported Browser:</strong> Your browser does not support the Web Speech API for audio playback.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-700/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              German
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Arabic
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {phrases.map((phrase) => (
            <tr key={phrase.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{phrase.German}</td>
              <td dir="rtl" className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-arabic text-right">{phrase.Arabic}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                <button
                  onClick={() => handlePlayToggle(phrase)}
                  className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 hover:text-sky-600 dark:hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800 transition-all"
                  aria-label={speakingId === phrase.id ? 'Stop audio' : 'Play audio'}
                >
                  {speakingId === phrase.id ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PhraseTable;

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

const TextToSpeech = () => {
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [voice, setVoice] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState(null);
  const audioRef = useRef(null);

  // Fetch voices when component mounts
  useState(() => {
    fetch('http://localhost:8000/api/voices')
      .then(res => res.json())
      .then(data => setVoices(data));
  }, []);

  const handleConvert = async () => {
    if (!text || !voice) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
        }),
      });

      if (!response.ok) throw new Error('Conversion failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Text to Speech Converter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                className="w-full p-2 border rounded"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setLanguage('');
                  setVoice('');
                }}
              >
                <option value="">Select Category</option>
                {voices && Object.keys(voices).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Language Selection */}
            {category && (
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  className="w-full p-2 border rounded"
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    setVoice('');
                  }}
                >
                  <option value="">Select Language</option>
                  {voices && Object.keys(voices[category]).map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Voice Selection */}
            {language && (
              <div>
                <label className="block text-sm font-medium mb-2">Voice</label>
                <select
                  className="w-full p-2 border rounded"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                >
                  <option value="">Select Voice</option>
                  {voices && Object.entries(voices[category][language]).map(([name, value]) => (
                    <option key={value} value={value}>{name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Text</label>
              <textarea
                className="w-full p-2 border rounded h-32"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to convert to speech..."
              />
            </div>

            {/* Convert Button */}
            <button
              className={`w-full p-2 rounded text-white ${
                loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={handleConvert}
              disabled={loading || !text || !voice}
            >
              {loading ? 'Converting...' : 'Convert to Speech'}
            </button>

            {/* Audio Player */}
            <audio ref={audioRef} controls className="w-full mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TextToSpeech;

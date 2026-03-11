import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function SendDocumentPanel({ citizenId, onSent }: { citizenId: string; onSent: () => void }) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSend = async () => {
    setError('');
    if (!title || !file) {
      setError('Title and file are required');
      return;
    }
    setSending(true);
    try {
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`${citizenId}/${file.name}`, file);
      if (uploadError) throw uploadError;
      const fileUrl = uploadData.path;
      // Generate hash (placeholder)
      const hash = 'hash-placeholder';
      // Store document in DB
      const { error: docError } = await supabase.from('documents').insert({
        title,
        file_url: fileUrl,
        owner_id: citizenId,
        issued_by: 'government',
        document_hash: hash,
        category,
      });
      if (docError) throw docError;
      // TODO: Link document to citizen profile, notify citizen, log activity
      onSent();
    } catch (err: any) {
      setError(err.message || 'Failed to send document');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-2">Send Document to Citizen</h3>
      <div className="mb-2">
        <label>Document Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
      </div>
      <div className="mb-2">
        <label>Upload File</label>
        <input type="file" onChange={handleFileChange} />
      </div>
      <div className="mb-2">
        <label>Document Category (optional)</label>
        <input
          type="text"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <button
        onClick={handleSend}
        className="bg-green-600 text-white px-4 py-2 rounded"
        disabled={sending}
      >
        Send to Citizen Vault
      </button>
    </div>
  );
}

export default SendDocumentPanel;

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Document {
  id: string;
  title: string;
  category: string;
  // Add other fields as needed
}

export function InstitutionVault({ institutionId }: { institutionId: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [permission, setPermission] = useState('view');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch institution documents
    async function fetchDocs() {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('owner_id', institutionId);
      if (!error && data) setDocuments(data as Document[]);
    }
    fetchDocs();
  }, [institutionId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    setError('');
    if (!title || !file) {
      setError('Title and file are required');
      return;
    }
    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(`${institutionId}/${file.name}`, file);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    const fileUrl = uploadData.path;
    // Generate hash (placeholder)
    const hash = 'hash-placeholder';
    // Store document in DB
    const { error: docError } = await supabase.from('documents').insert({
      title,
      file_url: fileUrl,
      owner_id: institutionId,
      issued_by: 'government',
      document_hash: hash,
      category,
    });
    if (docError) {
      setError(docError.message);
      return;
    }
    // TODO: Log activity: Government uploaded document
    setTitle('');
    setFile(null);
    setCategory('');
    setPermission('view');
    // Refresh documents
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('owner_id', institutionId);
    if (data) setDocuments(data as Document[]);
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-2">Institution Vault</h3>
      <div className="mb-2">
        <label>Upload Document</label>
        <input type="file" onChange={handleFileChange} />
      </div>
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
        <label>Document Category (optional)</label>
        <input
          type="text"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
      </div>
      <div className="mb-2">
        <label>Permission</label>
        <select
          value={permission}
          onChange={e => setPermission(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="view">View Only</option>
          <option value="download">Download</option>
          <option value="edit">Edit</option>
        </select>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload Document
      </button>
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Stored Documents</h4>
        <ul>
          {documents.map(doc => (
            <li key={doc.id} className="mb-2 border-b pb-2">
              <div>Title: {doc.title}</div>
              <div>Category: {doc.category}</div>
              <div>Permission: {permission}</div>
              {/* TODO: Add share with institution, set permissions */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default InstitutionVault;

// Utility for encrypted offline storage using IndexedDB and Web Crypto API

const DB_NAME = 'DocumentVaultCache';
const STORE_NAME = 'documents';
const KEY_STORAGE_NAME = 'vault_encryption_key';

// --- Encryption/Decryption Helpers ---

async function getEncryptionKey(): Promise<CryptoKey> {
    // Try to get existing key from localStorage (encoded as JWK)
    const storedKey = localStorage.getItem(KEY_STORAGE_NAME);

    if (storedKey) {
        return window.crypto.subtle.importKey(
            'jwk',
            JSON.parse(storedKey),
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    }

    // Generate new key
    const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    // Export and save to localStorage
    const exportedKey = await window.crypto.subtle.exportKey('jwk', key);
    localStorage.setItem(KEY_STORAGE_NAME, JSON.stringify(exportedKey));

    return key;
}

async function encryptData(data: Blob): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
    const key = await getEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const buffer = await data.arrayBuffer();

    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        buffer
    );

    return { encrypted, iv };
}

async function decryptData(encrypted: ArrayBuffer, iv: Uint8Array): Promise<Blob> {
    const key = await getEncryptionKey();

    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as BufferSource },
        key,
        encrypted
    );

    return new Blob([decrypted], { type: 'application/pdf' });
}

// --- IndexedDB Helpers ---

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// --- Public API ---

export async function saveDocumentToCache(id: string, blob: Blob): Promise<void> {
    try {
        const { encrypted, iv } = await encryptData(blob);
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // Store encrypted data and IV
            const request = store.put({ encrypted, iv, timestamp: Date.now() }, id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error('Failed to cache document:', err);
        throw err;
    }
}

export async function getDocumentFromCache(id: string): Promise<Blob | null> {
    try {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = async () => {
                const result = request.result;
                if (!result) {
                    resolve(null);
                    return;
                }

                try {
                    const blob = await decryptData(result.encrypted, result.iv);
                    resolve(blob);
                } catch (err) {
                    console.error('Failed to decrypt cached document:', err);
                    resolve(null);
                }
            };

            request.onerror = () => reject(request.error);
        });
    } catch (err) {
        console.error('Failed to get document from cache:', err);
        return null;
    }
}

export async function removeDocumentFromCache(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function clearCache(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

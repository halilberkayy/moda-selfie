import React from 'react';

function KVKKConsent({ onAccept }) {
  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-lg font-bold mb-2">KVKK Onayı</h2>
      <p className="mb-4">
        Kişisel verileriniz 24 saat süreyle saklanacak ve ardından silinecektir.
        Onaylıyor musunuz?
      </p>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={onAccept}
      >
        Onaylıyorum
      </button>
    </div>
  );
}

export default KVKKConsent;

import React, { useEffect } from 'react';
import axios from 'axios';

function QRCodeDisplay({ productId, onQRGenerated }) {
  useEffect(() => {
    const generateQR = async () => {
      if (!productId) return;
      try {
        const response = await axios.get(`http://localhost:8000/qrcode?product_id=${productId}`);
        onQRGenerated(response.data.qr_token);
      } catch (error) {
        console.error("QR kod oluşturulamadı:", error);
      }
    };
    generateQR();
  }, [productId, onQRGenerated]);

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-bold mb-2">QR Kod</h2>
      {productId ? <p>Ürün ID: {productId}</p> : <p>Ürün seçilmedi.</p>}
    </div>
  );
}

export default QRCodeDisplay;

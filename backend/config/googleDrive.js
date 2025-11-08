const axios = require('axios');
const FormData = require('form-data');

// TODO: Tạo tài khoản Pinata và lấy API keys
// 1. Vào https://app.pinata.cloud/
// 2. Đăng ký tài khoản miễn phí (Free plan: 1GB storage)
// 3. Vào API Keys: https://app.pinata.cloud/developers/api-keys
// 4. Click "New Key" → Chọn "Admin" hoặc tick permissions cần thiết
// 5. Copy JWT (API Key)
// 6. Thêm vào file .env:
//    PINATA_JWT=your_jwt_here

// Kiểm tra Pinata config
const checkPinataConfig = () => {
  const jwt = process.env.PINATA_JWT;
  if (!jwt || jwt === 'your_jwt_here') {
    throw new Error('PINATA_JWT chưa được cấu hình trong .env. Vui lòng xem hướng dẫn trong backend/config/googleDrive.js');
  }
  return jwt;
};

// Upload file lên Pinata IPFS
const uploadFileToDrive = async (fileBuffer, fileName, mimeType) => {
  try {
    const jwt = checkPinataConfig();

    // Tạo FormData
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: mimeType,
    });

    // Metadata (optional)
    const metadata = JSON.stringify({
      name: fileName,
    });
    formData.append('pinataMetadata', metadata);

    // Upload lên Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${jwt}`,
        },
        maxBodyLength: Infinity,
      }
    );

    // Pinata trả về IpfsHash
    const ipfsHash = response.data.IpfsHash;
    
    // URL để truy cập ảnh qua Pinata Gateway
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    return {
      fileId: ipfsHash, // IPFS hash
      imageUrl: imageUrl,
      ipfsHash: ipfsHash,
    };
  } catch (error) {
    console.error('Error uploading to Pinata:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Lỗi khi upload ảnh lên Pinata');
  }
};

// Xóa file từ Pinata (unpin)
const deleteFileFromDrive = async (ipfsHash) => {
  try {
    const jwt = checkPinataConfig();

    await axios.delete(
      `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    return true;
  } catch (error) {
    console.error('Error deleting from Pinata:', error.response?.data || error.message);
    throw new Error('Lỗi khi xóa ảnh từ Pinata');
  }
};

// Lấy URL ảnh từ IPFS hash
const getImageUrl = (ipfsHash) => {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
};

module.exports = {
  uploadFileToDrive,
  deleteFileFromDrive,
  getImageUrl,
};

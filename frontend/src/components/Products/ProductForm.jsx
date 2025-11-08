import { useState, useEffect } from 'react';
import { productService } from '../../services/api';
import './ProductForm.css';

function ProductForm({ product, onSubmit, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    specifications: '',
    imageUrl: '',
    images: [],
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load categories khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getCategories();
        if (response.success && response.categories) {
          setCategories(response.categories);
          // Set default category
          if (!formData.category && response.categories.length > 0) {
            setFormData(prev => ({
              ...prev,
              category: response.categories[0].name
            }));
          }
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || (categories.length > 0 ? categories[0].name : ''),
        stock: product.stock || '',
        specifications: product.specifications 
          ? (typeof product.specifications === 'object' 
              ? JSON.stringify(product.specifications, null, 2) 
              : product.specifications)
          : '',
        imageUrl: product.imageUrl || '',
        images: product.images || [],
      });
      if (product.images && product.images.length > 0) {
        setImagePreviews(product.images);
      } else if (product.imageUrl) {
        setImagePreviews([product.imageUrl]);
      }
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Tạo preview cho các ảnh đã chọn
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // TODO: Upload ảnh lên Pinata IPFS
  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError('');

    try {
      // Upload lên Pinata IPFS thông qua API
      const result = await productService.uploadProductImages(selectedFiles);
      
      // TODO: result.imageUrls chứa các URL từ Pinata Gateway
      // Format: https://gateway.pinata.cloud/ipfs/IPFS_HASH
      setFormData((prev) => ({
        ...prev,
        images: result.imageUrls || [],
        imageUrl: result.imageUrls?.[0] || '', // Ảnh đầu tiên làm ảnh chính
      }));

      alert('Upload ảnh thành công!');
    } catch (err) {
      // TODO: Nếu Pinata chưa setup, sẽ hiện thông báo hướng dẫn
      setError(err.message || 'Lỗi khi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate
      if (!formData.name || !formData.price || !formData.stock) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }

      // Parse specifications nếu là JSON string
      let specifications = formData.specifications;
      if (typeof specifications === 'string' && specifications.trim()) {
        try {
          specifications = JSON.parse(specifications);
        } catch {
          // Nếu không parse được thì để nguyên string
        }
      }

      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        specifications,
      };

      await onSubmit(submitData);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>Thông tin cơ bản</h3>
        
        <div className="form-group">
          <label htmlFor="name">
            Tên sản phẩm <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên sản phẩm"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">
              Danh mục <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              disabled={categories.length === 0}
            >
              {categories.length === 0 ? (
                <option value="">Đang tải danh mục...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.category_id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">
              Giá (VNĐ) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              min="0"
              step="1000"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">
              Số lượng tồn kho <span className="required">*</span>
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô tả sản phẩm</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả chi tiết về sản phẩm"
            rows="5"
          />
        </div>

        <div className="form-group">
          <label htmlFor="specifications">
            Thông số kỹ thuật (JSON)
          </label>
          <textarea
            id="specifications"
            name="specifications"
            value={formData.specifications}
            onChange={handleChange}
            placeholder='{"Màn hình": "6.7 inch", "RAM": "8GB", ...}'
            rows="6"
          />
          <small className="form-hint">
            Nhập dạng JSON hoặc text thường. Ví dụ: {`{"Màn hình": "6.7 inch", "RAM": "8GB"}`}
          </small>
        </div>
      </div>

      <div className="form-section">
        <h3>Hình ảnh sản phẩm</h3>

        <div className="form-group">
          <label htmlFor="images">Chọn ảnh</label>
          <input
            type="file"
            id="images"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
          />
          <small className="form-hint">
            Chọn nhiều ảnh để upload. Ảnh đầu tiên sẽ là ảnh chính.
          </small>
        </div>

        {selectedFiles.length > 0 && (
          <div className="upload-section">
            <button
              type="button"
              className="btn-upload"
              onClick={handleUploadImages}
              disabled={uploading}
            >
              {uploading ? 'Đang upload...' : `Upload ${selectedFiles.length} ảnh`}
            </button>
          </div>
        )}

        {imagePreviews.length > 0 && (
          <div className="image-preview-grid">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="image-preview-item">
                <img src={preview} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  className="btn-remove-image"
                  onClick={() => handleRemoveImage(index)}
                  title="Xóa ảnh"
                >
                  ×
                </button>
                {index === 0 && <span className="main-image-badge">Ảnh chính</span>}
              </div>
            ))}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="imageUrl">URL ảnh chính (tuỳ chọn)</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
          <small className="form-hint">
            Hoặc nhập trực tiếp URL ảnh nếu không upload file
          </small>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button
          type="button"
          className="btn-cancel"
          onClick={onCancel}
          disabled={loading}
        >
          Hủy
        </button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : product ? 'Cập nhật' : 'Thêm sản phẩm'}
        </button>
      </div>
    </form>
  );
}

export default ProductForm;

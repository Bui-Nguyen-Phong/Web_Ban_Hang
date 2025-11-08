import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../services/api';
import ProductForm from '../../components/Products/ProductForm';
import './EditProduct.css';
import placeholderImage from '../../assets/images/demo_8.jpg';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await productService.getProductById(id);
      setProduct(data);
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin sản phẩm');
      // Mock data nếu API chưa sẵn sàng
      setProduct({
        id,
        name: 'Sản phẩm mẫu',
        description: 'Mô tả sản phẩm mẫu',
        price: 10000000,
        category: 'Điện thoại',
        stock: 15,
        specifications: {
          'Màn hình': '6.7 inch',
          'RAM': '8GB',
        },
        imageUrl: placeholderImage,
        images: [placeholderImage],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (productData) => {
    try {
      await productService.updateProduct(id, productData);
      alert('Cập nhật sản phẩm thành công!');
      navigate('/seller/products');
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/seller/products');
  };

  if (loading) {
    return (
      <div className="edit-product-container">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="edit-product-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/seller/products')} className="btn-back">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="edit-product-container">
      <div className="page-header">
        <h1>Chỉnh sửa sản phẩm</h1>
        <p>Cập nhật thông tin sản phẩm của bạn</p>
      </div>

      {product && (
        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

export default EditProduct;

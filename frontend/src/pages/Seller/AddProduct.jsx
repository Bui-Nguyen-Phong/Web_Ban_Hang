import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/api';
import ProductForm from '../../components/Products/ProductForm';
import './AddProduct.css';

function AddProduct() {
  const navigate = useNavigate();

  const handleSubmit = async (productData) => {
    try {
      await productService.createProduct(productData);
      alert('Thêm sản phẩm thành công!');
      navigate('/seller/products');
    } catch (error) {
      throw error;
    }
  };

  const handleCancel = () => {
    navigate('/seller/products');
  };

  return (
    <div className="add-product-container">
      <div className="page-header">
        <h1>Thêm sản phẩm mới</h1>
        <p>Điền thông tin chi tiết về sản phẩm của bạn</p>
      </div>

      <ProductForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}

export default AddProduct;

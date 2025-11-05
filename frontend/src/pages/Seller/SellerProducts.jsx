import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/api';
import './SellerProducts.css';

function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: currentPage,
        limit: 10,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await productService.getSellerProducts(params);
      
      // Mock data nếu API chưa sẵn sàng
      if (response.products) {
        setProducts(response.products);
        setTotalPages(response.totalPages || 1);
      } else {
        // Mock data
        setProducts([
          {
            id: 1,
            name: 'iPhone 15 Pro Max',
            category: 'Điện thoại',
            price: 29990000,
            stock: 25,
            imageUrl: 'https://via.placeholder.com/200',
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            name: 'MacBook Pro M3',
            category: 'Laptop',
            price: 45990000,
            stock: 10,
            imageUrl: 'https://via.placeholder.com/200',
            createdAt: new Date().toISOString(),
          },
        ]);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách sản phẩm');
      // Mock data khi lỗi
      setProducts([
        {
          id: 1,
          name: 'Sản phẩm mẫu 1',
          category: 'Điện thoại',
          price: 10000000,
          stock: 15,
          imageUrl: 'https://via.placeholder.com/200',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Sản phẩm mẫu 2',
          category: 'Laptop',
          price: 20000000,
          stock: 5,
          imageUrl: 'https://via.placeholder.com/200',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setDeleteConfirm(null);
      alert('Xóa sản phẩm thành công!');
    } catch (err) {
      alert(err.message || 'Không thể xóa sản phẩm');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  if (loading && products.length === 0) {
    return (
      <div className="seller-products-container">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="seller-products-container">
      <div className="products-header">
        <h1>Quản lý sản phẩm</h1>
        <Link to="/seller/products/add" className="btn-add-product">
          + Thêm sản phẩm mới
        </Link>
      </div>

      <div className="products-toolbar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Tìm kiếm</button>
        </form>

        <div className="products-stats">
          <span className="stat-item">
            Tổng số: <strong>{products.length}</strong> sản phẩm
          </span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {products.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có sản phẩm nào</p>
          <Link to="/seller/products/add" className="btn-add-first">
            Thêm sản phẩm đầu tiên
          </Link>
        </div>
      ) : (
        <>
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-image-cell">
                        <img
                          src={product.imageUrl || 'https://via.placeholder.com/100'}
                          alt={product.name}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="product-name-cell">
                        <Link to={`/products/${product.id}`}>
                          {product.name}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{product.category}</span>
                    </td>
                    <td>
                      <span className="price-cell">{formatPrice(product.price)}</span>
                    </td>
                    <td>
                      <span
                        className={`stock-badge ${
                          product.stock === 0
                            ? 'out-of-stock'
                            : product.stock < 10
                            ? 'low-stock'
                            : ''
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td>{formatDate(product.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/seller/products/edit/${product.id}`}
                          className="btn-edit"
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </Link>
                        <button
                          className="btn-delete"
                          onClick={() => setDeleteConfirm(product.id)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                « Trước
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={currentPage === index + 1 ? 'active' : ''}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sau »
              </button>
            </div>
          )}
        </>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa sản phẩm này?</p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Hủy
              </button>
              <button
                className="btn-confirm-delete"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerProducts;

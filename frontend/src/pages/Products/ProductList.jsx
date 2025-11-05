import React, { useState, useEffect } from 'react';
import { productService } from '../../services/api';
import ProductCard from '../../components/Products/ProductCard';
import SearchFilter from '../../components/Products/SearchFilter';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
  });

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: filters.search,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sortBy: filters.sortBy,
      };

      // Loại bỏ params rỗng
      Object.keys(params).forEach(
        (key) => (params[key] === '' || params[key] === null) && delete params[key]
      );

      const response = await productService.getProducts(params);
      
      setProducts(response.products || response.data || []);
      
      if (response.pagination) {
        setPagination({
          ...pagination,
          totalPages: response.pagination.totalPages || 1,
          totalItems: response.pagination.totalItems || 0,
        });
      }
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
      console.error('Error fetching products:', err);
      // Sử dụng dữ liệu mẫu nếu API chưa có
      setProducts(getMockProducts());
    } finally {
      setLoading(false);
    }
  };

  const getMockProducts = () => {
    return [
      {
        id: 1,
        name: 'iPhone 15 Pro Max',
        description: 'Điện thoại thông minh cao cấp với chip A17 Pro mạnh mẽ',
        price: 29990000,
        category: 'Điện thoại',
        stock: 15,
        images: ['https://via.placeholder.com/300x300?text=iPhone+15'],
        sellerName: 'Apple Store',
      },
      {
        id: 2,
        name: 'MacBook Pro 14" M3',
        description: 'Laptop chuyên nghiệp với chip M3 hiệu năng cao',
        price: 45990000,
        category: 'Laptop',
        stock: 8,
        images: ['https://via.placeholder.com/300x300?text=MacBook+Pro'],
        sellerName: 'Apple Store',
      },
      {
        id: 3,
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Flagship Android với camera 200MP ấn tượng',
        price: 27990000,
        category: 'Điện thoại',
        stock: 20,
        images: ['https://via.placeholder.com/300x300?text=Galaxy+S24'],
        sellerName: 'Samsung Official',
      },
      {
        id: 4,
        name: 'AirPods Pro 2',
        description: 'Tai nghe không dây chống ồn chủ động',
        price: 5990000,
        category: 'Phụ kiện',
        stock: 50,
        images: ['https://via.placeholder.com/300x300?text=AirPods'],
        sellerName: 'Apple Store',
      },
      {
        id: 5,
        name: 'iPad Pro 11"',
        description: 'Máy tính bảng với chip M2 mạnh mẽ',
        price: 21990000,
        category: 'Máy tính bảng',
        stock: 12,
        images: ['https://via.placeholder.com/300x300?text=iPad+Pro'],
        sellerName: 'Apple Store',
      },
      {
        id: 6,
        name: 'Dell XPS 13',
        description: 'Laptop siêu mỏng nhẹ, hiệu năng cao',
        price: 32990000,
        category: 'Laptop',
        stock: 5,
        images: ['https://via.placeholder.com/300x300?text=Dell+XPS'],
        sellerName: 'Dell Official',
      },
    ];
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, currentPage: page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={pagination.currentPage === 1}
        className="pagination-btn"
      >
        ← Trước
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === pagination.currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        pages.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      pages.push(
        <button
          key={pagination.totalPages}
          onClick={() => handlePageChange(pagination.totalPages)}
          className="pagination-btn"
        >
          {pagination.totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={pagination.currentPage === pagination.totalPages}
        className="pagination-btn"
      >
        Sau →
      </button>
    );

    return <div className="pagination">{pages}</div>;
  };

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h1>Danh Sách Sản Phẩm</h1>
        <p className="product-count">
          {pagination.totalItems > 0
            ? `Tìm thấy ${pagination.totalItems} sản phẩm`
            : 'Đang tải...'}
        </p>
      </div>

      <SearchFilter onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchProducts} className="btn-retry">
            Thử lại
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-container">
          <div className="empty-icon">📦</div>
          <h3>Không tìm thấy sản phẩm</h3>
          <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default ProductList;

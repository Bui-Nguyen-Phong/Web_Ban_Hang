import React, { useState } from 'react';
import './SearchFilter.css';

const SearchFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
  });

  const categories = [
    'Tất cả',
    'Điện thoại',
    'Laptop',
    'Máy tính bảng',
    'Phụ kiện',
    'Đồng hồ',
    'Thời trang',
    'Gia dụng',
    'Sách',
    'Khác',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(newFilters);
    
    // Debounce search
    if (name === 'search') {
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        onFilterChange(newFilters);
      }, 500);
    } else {
      onFilterChange(newFilters);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="search-filter-container">
      <div className="search-bar">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleInputChange}
          placeholder="🔍 Tìm kiếm sản phẩm..."
          className="search-input"
        />
      </div>

      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="category">Danh mục</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleInputChange}
            className="filter-select"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat === 'Tất cả' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Khoảng giá</label>
          <div className="price-range">
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleInputChange}
              placeholder="Từ"
              className="price-input"
              min="0"
            />
            <span className="price-separator">-</span>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleInputChange}
              placeholder="Đến"
              className="price-input"
              min="0"
            />
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="sortBy">Sắp xếp</label>
          <select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleInputChange}
            className="filter-select"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="name-asc">Tên A-Z</option>
            <option value="name-desc">Tên Z-A</option>
          </select>
        </div>

        <div className="filter-actions">
          <button onClick={handleReset} className="btn-reset">
            🔄 Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;

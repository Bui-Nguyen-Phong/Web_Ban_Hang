import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/api';
import './RevenueStats.css';

const RevenueStats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('day'); // 'day', 'month', 'year'
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [stats, setStats] = useState([]);
  const [summary, setSummary] = useState({
    total_orders: 0,
    total_revenue: 0,
    total_products_sold: 0,
    avg_order_value: 0
  });
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    loadRevenueStats();
  }, [period, year, month]);

  const loadRevenueStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { period };
      if (period === 'day' || period === 'month') {
        params.year = year;
      }
      if (period === 'day') {
        params.month = month;
      }

      const data = await orderService.getRevenueStats(params);
      setStats(data.stats || []);
      setSummary(data.summary || {});
      setTopProducts(data.topProducts || []);
    } catch (err) {
      console.error('Load revenue stats error:', err);
      setError(err.message || 'Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getChartHeight = (value, maxValue) => {
    if (maxValue === 0) return 0;
    return Math.max((value / maxValue) * 100, 2); // Min 2% để hiển thị
  };

  const getMaxRevenue = () => {
    if (stats.length === 0) return 0;
    return Math.max(...stats.map(s => s.revenue || 0));
  };

  const getLabel = (stat) => {
    if (period === 'day') {
      return stat.day || stat.date;
    } else if (period === 'month') {
      return `Tháng ${stat.month}`;
    } else {
      return stat.year;
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e) => {
    setMonth(parseInt(e.target.value));
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  };

  if (loading) {
    return <div className="revenue-stats-loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="revenue-stats-error">Lỗi: {error}</div>;
  }

  const maxRevenue = getMaxRevenue();

  return (
    <div className="revenue-stats-container">
      <div className="stats-header">
        <h1>Thống kê doanh thu</h1>
      </div>

      {/* Filters */}
      <div className="stats-filters">
        <div className="period-selector">
          <button
            className={`period-btn ${period === 'day' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('day')}
          >
            Theo ngày
          </button>
          <button
            className={`period-btn ${period === 'month' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('month')}
          >
            Theo tháng
          </button>
          <button
            className={`period-btn ${period === 'year' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('year')}
          >
            Theo năm
          </button>
        </div>

        <div className="date-selectors">
          {(period === 'day' || period === 'month') && (
            <select value={year} onChange={handleYearChange} className="year-select">
              {getYearOptions().map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
          
          {period === 'day' && (
            <select value={month} onChange={handleMonthChange} className="month-select">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card revenue">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Tổng doanh thu</h3>
            <p className="card-value">{formatCurrency(summary.total_revenue)}</p>
          </div>
        </div>
        <div className="summary-card orders">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>Tổng đơn hàng</h3>
            <p className="card-value">{summary.total_orders}</p>
          </div>
        </div>
        <div className="summary-card products">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Sản phẩm đã bán</h3>
            <p className="card-value">{summary.total_products_sold}</p>
          </div>
        </div>
        <div className="summary-card average">
          <div className="card-icon">💵</div>
          <div className="card-content">
            <h3>Giá trị TB/đơn</h3>
            <p className="card-value">{formatCurrency(summary.avg_order_value)}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-section">
        <h2>Biểu đồ doanh thu</h2>
        {stats.length === 0 ? (
          <div className="no-data">Chưa có dữ liệu thống kê</div>
        ) : (
          <div className="chart-container">
            <div className="chart">
              {stats.map((stat, index) => (
                <div key={index} className="chart-bar-wrapper">
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar"
                      style={{ height: `${getChartHeight(stat.revenue, maxRevenue)}%` }}
                      title={`Doanh thu: ${formatCurrency(stat.revenue)}`}
                    >
                      <span className="bar-value">{formatCurrency(stat.revenue)}</span>
                    </div>
                  </div>
                  <div className="chart-label">{getLabel(stat)}</div>
                  <div className="chart-details">
                    <div>📦 {stat.order_count} đơn</div>
                    <div>📦 {stat.products_sold} SP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Products */}
      <div className="top-products-section">
        <h2>Top 10 sản phẩm bán chạy</h2>
        {topProducts.length === 0 ? (
          <div className="no-data">Chưa có dữ liệu</div>
        ) : (
          <div className="top-products-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên sản phẩm</th>
                  <th>Giá</th>
                  <th>Đã bán</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={product.product_id}>
                    <td>{index + 1}</td>
                    <td>{product.name}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{product.sold_quantity}</td>
                    <td className="revenue-cell">{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueStats;

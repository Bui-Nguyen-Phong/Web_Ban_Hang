const crypto = require('crypto-js');
const moment = require('moment');
const qs = require('qs');

// TODO: Đăng ký tài khoản VNPAY Sandbox để test
// 1. Vào https://sandbox.vnpayment.vn/devreg/
// 2. Đăng ký tài khoản doanh nghiệp DEMO
// 3. Sau khi đăng ký, VNPAY sẽ gửi email chứa:
//    - TMN Code (Terminal Code - Mã website)
//    - Hash Secret (Secret Key)
// 4. Thêm vào file .env:
//    VNPAY_TMN_CODE=your_tmn_code
//    VNPAY_HASH_SECRET=your_hash_secret
//    VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
//    VNPAY_RETURN_URL=http://localhost:3000/payment/vnpay-return

// Config VNPAY
const vnpayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE,
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
  vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/vnpay-return',
};

// Hàm sắp xếp object theo key (VNPAY yêu cầu)
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}

// Tạo URL thanh toán VNPAY
const createPaymentUrl = (orderId, amount, orderInfo, ipAddr) => {
  try {
    // Kiểm tra config
    if (!vnpayConfig.vnp_TmnCode || vnpayConfig.vnp_TmnCode === 'your_tmn_code') {
      throw new Error('VNPAY_TMN_CODE chưa được cấu hình trong .env');
    }
    if (!vnpayConfig.vnp_HashSecret || vnpayConfig.vnp_HashSecret === 'your_hash_secret') {
      throw new Error('VNPAY_HASH_SECRET chưa được cấu hình trong .env');
    }

    const createDate = moment().format('YYYYMMDDHHmmss');
    const expireDate = moment().add(15, 'minutes').format('YYYYMMDDHHmmss');

    // Build query parameters
    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId.toString(),
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100, // VNPAY nhân với 100
      vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // Sắp xếp params
    vnp_Params = sortObject(vnp_Params);

    // Tạo secure hash
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.HmacSHA512(signData, vnpayConfig.vnp_HashSecret);
    const signed = hmac.toString(crypto.enc.Hex);

    vnp_Params['vnp_SecureHash'] = signed;

    // Tạo URL
    const paymentUrl = vnpayConfig.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

    return paymentUrl;
  } catch (error) {
    console.error('Error creating VNPAY payment URL:', error);
    throw error;
  }
};

// Verify callback từ VNPAY
const verifyReturnUrl = (vnp_Params) => {
  try {
    const secureHash = vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp params
    const sortedParams = sortObject(vnp_Params);

    // Tạo secure hash để so sánh
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.HmacSHA512(signData, vnpayConfig.vnp_HashSecret);
    const signed = hmac.toString(crypto.enc.Hex);

    // Verify
    if (secureHash === signed) {
      return {
        verified: true,
        orderId: vnp_Params['vnp_TxnRef'],
        amount: vnp_Params['vnp_Amount'] / 100,
        responseCode: vnp_Params['vnp_ResponseCode'],
        transactionNo: vnp_Params['vnp_TransactionNo'],
        bankCode: vnp_Params['vnp_BankCode'],
        payDate: vnp_Params['vnp_PayDate'],
      };
    }

    return { verified: false };
  } catch (error) {
    console.error('Error verifying VNPAY return URL:', error);
    return { verified: false };
  }
};

// VNPAY response codes
const vnpayResponseCode = {
  '00': 'Giao dịch thành công',
  '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
  '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
  '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
  '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
  '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
  '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
  '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
  '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
  '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
  '75': 'Ngân hàng thanh toán đang bảo trì.',
  '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
  '99': 'Các lỗi khác',
};

// Lấy message từ response code
const getResponseMessage = (responseCode) => {
  return vnpayResponseCode[responseCode] || 'Lỗi không xác định';
};

module.exports = {
  createPaymentUrl,
  verifyReturnUrl,
  getResponseMessage,
  vnpayConfig,
};

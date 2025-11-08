#!/bin/bash

# Script kiểm tra setup Google Drive
echo "🔍 Kiểm tra Google Drive API Setup..."
echo ""

# Check credentials file
if [ -f "backend/config/google-drive-credentials.json" ]; then
    echo "✅ File credentials đã có"
else
    echo "❌ Chưa có file google-drive-credentials.json"
    echo "   → Hãy làm theo hướng dẫn trong backend/GOOGLE_DRIVE_SETUP.md"
fi

# Check .env
if [ -f "backend/.env" ]; then
    if grep -q "GOOGLE_DRIVE_FOLDER_ID" backend/.env; then
        FOLDER_ID=$(grep "GOOGLE_DRIVE_FOLDER_ID" backend/.env | cut -d '=' -f2)
        if [ "$FOLDER_ID" != "your_folder_id_here" ] && [ ! -z "$FOLDER_ID" ]; then
            echo "✅ GOOGLE_DRIVE_FOLDER_ID đã được cấu hình"
        else
            echo "❌ Chưa cấu hình GOOGLE_DRIVE_FOLDER_ID trong .env"
            echo "   → Thêm FOLDER_ID vào backend/.env"
        fi
    else
        echo "❌ Thiếu GOOGLE_DRIVE_FOLDER_ID trong .env"
    fi
else
    echo "❌ Không tìm thấy file .env"
fi

# Check googleapis package
if [ -f "backend/package.json" ]; then
    if grep -q "googleapis" backend/package.json; then
        echo "✅ Package googleapis đã được cài đặt"
    else
        echo "⚠️  Chưa cài package googleapis"
        echo "   → Chạy: cd backend && npm install googleapis"
    fi
fi

echo ""
echo "📖 Xem hướng dẫn đầy đủ tại: backend/GOOGLE_DRIVE_SETUP.md"

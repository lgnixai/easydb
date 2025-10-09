#!/bin/bash

echo "=== Testing Formula Field Calculation ==="
echo ""

# 1. 获取字段列表
echo "1. Getting fields list..."
curl -s "http://localhost:8080/api/fields?table_id=tbl_b0vWEewyNyg8JdB1hSQDb" | jq '.data[] | {id, name, type, options}' | head -50

echo ""
echo "2. Getting records..."
# 2. 获取记录列表
curl -s "http://localhost:8080/api/records?table_id=tbl_b0vWEewyNyg8JdB1hSQDb&limit=5" | jq '.data[] | {id, data}' | head -50

echo ""
echo "3. Checking Formula field in database..."
# 3. 检查数据库中的Formula字段
psql -d teable -c "SELECT id, name, type, options FROM field WHERE table_id = 'tbl_b0vWEewyNyg8JdB1hSQDb' AND type = 'formula';" 2>/dev/null || echo "PostgreSQL not available for direct query"

echo ""
echo "=== Test Complete ==="



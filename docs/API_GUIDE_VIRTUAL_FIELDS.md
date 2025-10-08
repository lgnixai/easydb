# 虚拟字段 API 使用指南

## 📋 概述

本文档说明如何通过API创建和管理虚拟字段（Lookup、Formula、AI、Rollup）。

## 🔗 新增的API端点

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/fields` | 创建字段（已支持虚拟字段参数） |
| POST | `/api/fields/:field_id/calculate` | 计算虚拟字段值 |
| GET | `/api/fields/:field_id/virtual-info` | 获取虚拟字段配置 |

## 📝 API 详细说明

### 1. 创建 Lookup 字段

#### 请求

```http
POST /api/fields
Content-Type: application/json

{
  "table_id": "tbl_orders",
  "name": "产品名称（查找）",
  "type": "lookup",
  "is_lookup": true,
  "lookup_options": "{\"link_field_id\":\"fld_link_001\",\"foreign_table_id\":\"tbl_products\",\"lookup_field_id\":\"fld_name_001\"}"
}
```

#### lookup_options 结构

```json
{
  "link_field_id": "fld_link_001",        // Link字段ID
  "foreign_table_id": "tbl_products",     // 外部表ID
  "lookup_field_id": "fld_name_001"       // 要查找的字段ID
}
```

#### 响应

```json
{
  "code": 0,
  "data": {
    "id": "fld_lookup_xxx",
    "name": "产品名称（查找）",
    "type": "lookup",
    "is_computed": true,
    "is_lookup": true,
    "is_pending": true,
    "has_error": false,
    "lookup_linked_field_id": "fld_link_001",
    "lookup_options": {...}
  },
  "message": ""
}
```

### 2. 创建 AI 字段

#### 请求

```http
POST /api/fields
Content-Type: application/json

{
  "table_id": "tbl_articles",
  "name": "AI摘要",
  "type": "text",
  "ai_config": "{\"type\":\"summary\",\"model_key\":\"gpt-3.5-turbo\",\"source_field_id\":\"fld_content_001\",\"is_auto_fill\":true}"
}
```

#### ai_config 结构

```json
{
  "type": "summary",                  // AI操作类型
  "model_key": "gpt-3.5-turbo",       // AI模型
  "source_field_id": "fld_content_001", // 源字段
  "is_auto_fill": true                // 是否自动填充
}
```

**AI操作类型**:
- `summary` - 摘要
- `translation` - 翻译
- `improvement` - 文本改进
- `extraction` - 信息提取
- `classification` - 分类
- `tag` - 打标签
- `customization` - 自定义

#### 响应

```json
{
  "code": 0,
  "data": {
    "id": "fld_ai_xxx",
    "name": "AI摘要",
    "type": "text",
    "is_computed": true,
    "is_pending": true,
    "ai_config": {...}
  },
  "message": ""
}
```

### 3. 创建 Formula 字段

#### 请求

```http
POST /api/fields
Content-Type: application/json

{
  "table_id": "tbl_orders",
  "name": "总价",
  "type": "formula",
  "options": "{\"formula\":\"price * quantity\"}"
}
```

#### 响应

```json
{
  "code": 0,
  "data": {
    "id": "fld_formula_xxx",
    "name": "总价",
    "type": "formula",
    "is_computed": true,
    "is_pending": true,
    "options": {
      "formula": "price * quantity"
    }
  },
  "message": ""
}
```

### 4. 计算虚拟字段

#### 请求

```http
POST /api/fields/:field_id/calculate
Content-Type: application/json

{
  "record_id": "rec_xxx"
}
```

#### 响应

```json
{
  "code": 0,
  "data": {
    "field_id": "fld_lookup_xxx",
    "record_id": "rec_xxx",
    "is_pending": false,
    "has_error": false,
    "is_computed": true,
    "is_lookup": true,
    "message": "虚拟字段计算功能待集成",
    "hint": "需要在 service 层集成 virtual_field_service.go 的计算逻辑"
  },
  "message": ""
}
```

**注意**: 当前API返回字段状态，实际计算逻辑需要在Service层集成`virtual_field_service.go`。

### 5. 获取虚拟字段配置

#### 请求

```http
GET /api/fields/:field_id/virtual-info
```

#### 响应

```json
{
  "code": 0,
  "data": {
    "field_id": "fld_lookup_xxx",
    "name": "产品名称（查找）",
    "type": "lookup",
    "is_computed": true,
    "is_lookup": true,
    "is_pending": false,
    "has_error": false,
    "lookup_options": {
      "link_field_id": "fld_link_001",
      "foreign_table_id": "tbl_products",
      "lookup_field_id": "fld_name_001"
    },
    "lookup_linked_field_id": "fld_link_001"
  },
  "message": ""
}
```

## 🧪 完整测试示例

### 创建 Lookup 字段的完整流程

```bash
#!/bin/bash

BASE_URL="http://localhost:8080"

# 1. 创建产品表
PRODUCTS_TABLE=$(curl -s -X POST "$BASE_URL/api/tables" \
  -H "Content-Type: application/json" \
  -d '{"base_id":"bas_test","name":"产品表"}')

PRODUCTS_TABLE_ID=$(echo "$PRODUCTS_TABLE" | jq -r '.data.id')

# 2. 创建订单表
ORDERS_TABLE=$(curl -s -X POST "$BASE_URL/api/tables" \
  -H "Content-Type: application/json" \
  -d '{"base_id":"bas_test","name":"订单表"}')

ORDERS_TABLE_ID=$(echo "$ORDERS_TABLE" | jq -r '.data.id')

# 3. 在产品表创建"产品名称"字段
PRODUCT_NAME_FIELD=$(curl -s -X POST "$BASE_URL/api/fields" \
  -H "Content-Type: application/json" \
  -d "{\"table_id\":\"$PRODUCTS_TABLE_ID\",\"name\":\"产品名称\",\"type\":\"text\"}")

PRODUCT_NAME_FIELD_ID=$(echo "$PRODUCT_NAME_FIELD" | jq -r '.data.id')

# 4. 在订单表创建Link字段（关联到产品表）
LINK_FIELD=$(curl -s -X POST "$BASE_URL/api/fields" \
  -H "Content-Type: application/json" \
  -d "{\"table_id\":\"$ORDERS_TABLE_ID\",\"name\":\"关联产品\",\"type\":\"link\",\"options\":\"{\\\"link_table_id\\\":\\\"$PRODUCTS_TABLE_ID\\\"}\"}")

LINK_FIELD_ID=$(echo "$LINK_FIELD" | jq -r '.data.id')

# 5. 在订单表创建Lookup字段（查找产品名称）
LOOKUP_OPTIONS="{\\\"link_field_id\\\":\\\"$LINK_FIELD_ID\\\",\\\"foreign_table_id\\\":\\\"$PRODUCTS_TABLE_ID\\\",\\\"lookup_field_id\\\":\\\"$PRODUCT_NAME_FIELD_ID\\\"}"

LOOKUP_FIELD=$(curl -s -X POST "$BASE_URL/api/fields" \
  -H "Content-Type: application/json" \
  -d "{\"table_id\":\"$ORDERS_TABLE_ID\",\"name\":\"产品名称（查找）\",\"type\":\"lookup\",\"is_lookup\":true,\"lookup_options\":\"$LOOKUP_OPTIONS\"}")

LOOKUP_FIELD_ID=$(echo "$LOOKUP_FIELD" | jq -r '.data.id')

# 6. 获取Lookup字段信息
echo "Lookup字段信息："
curl -s "$BASE_URL/api/fields/$LOOKUP_FIELD_ID/virtual-info" | jq '.'

echo "✅ Lookup字段创建成功！"
```

## 🔍 字段状态说明

### is_computed (计算字段)

自动设置为 `true` 的情况：
- `is_lookup = true`
- `type = "formula"`
- `type = "rollup"`
- `ai_config` 不为空

### is_pending (待计算)

- 新创建的虚拟字段自动设置为 `true`
- 计算完成后设置为 `false`
- 配置变更后重新设置为 `true`

### has_error (计算错误)

- 计算失败时设置为 `true`
- 成功计算后设置为 `false`

## 💡 最佳实践

### 1. 创建虚拟字段前的准备

```bash
# 1. 确保依赖字段已创建
# 2. 对于Lookup：确保Link字段已创建
# 3. 对于AI：确保源字段已存在
# 4. 对于Formula：确保引用字段已存在
```

### 2. 配置JSON格式

使用工具生成正确的JSON字符串：

```bash
# 使用 jq 生成
echo '{"link_field_id":"fld_xxx","foreign_table_id":"tbl_xxx","lookup_field_id":"fld_yyy"}' | jq -c '.' | jq -R '.'

# 或使用 Python
python3 -c 'import json; print(json.dumps({"link_field_id":"fld_xxx"}))'
```

### 3. 错误处理

```bash
# 创建失败时检查：
# 1. 依赖字段是否存在
# 2. JSON格式是否正确
# 3. 字段ID是否有效
# 4. 权限是否足够
```

## 🆘 故障排查

### 问题：创建虚拟字段失败

**检查**:
1. Link字段是否已创建
2. 外部表是否存在
3. lookup_field_id 是否有效
4. JSON格式是否正确

**解决**:
```bash
# 验证JSON格式
echo '你的lookup_options' | jq '.'

# 检查字段是否存在
curl http://localhost:8080/api/fields/fld_xxx
```

### 问题：虚拟字段值为空

**原因**: 计算逻辑尚未集成到Service层

**解决**: 需要在 `service.go` 中集成 `virtual_field_service.go` 的计算逻辑

## 📞 获取帮助

- 查看测试脚本: `./scripts/test_virtual_fields.sh`
- 查看下一步指南: `docs/NEXT_STEPS.md`
- 查看完整文档: `docs/VIRTUAL_FIELDS_AI_INTEGRATION_GUIDE.md`

---

**API版本**: v1  
**虚拟字段支持**: ✅ 已启用  
**计算服务**: 🔄 待集成  
**状态**: ✅ API就绪


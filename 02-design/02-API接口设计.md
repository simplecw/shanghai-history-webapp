# API Interface Design - 上海历史研究系统 Web 应用 v3.0

## 1. 基本信息

| 项目 | 内容 |
|------|------|
| 服务名称 | Shanghai History API |
| Base URL | http://localhost:5205/api/v1 |
| 认证方式 | None（公开接口） |
| 更新日期 | 2026-05-06 |

---

## 2. API 分组

| 路径前缀 | 模块 | 描述 |
|----------|------|------|
| /api/v1/buildings | 历史保护建筑 | 地图展示用 |
| /api/v1/maps | 历史地图 | 地图列表用 |
| /api/v1/historical-buildings | 历史建筑 | CRUD管理 |
| /api/v1/photographs | 历史照片 | 照片管理 |

---

## 3. 历史保护建筑接口（Buildings）

### 3.1 建筑列表

- 方法：GET
- 路径：/api/v1/buildings
- 描述：获取历史保护建筑列表（地图展示用）

| 参数 | 必填 | 类型 | 描述 |
|------|------|------|------|
| page | No | int | 页码（默认 1） |
| size | No | int | 每页数量（默认 100） |
| preservationCategory | No | string | 保护等级筛选 |
| batch | No | string | 文物批次筛选 |

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "buildingId": 1,
        "originalName": "原名称",
        "currentName": "现名称",
        "address": "地址",
        "latitude": 31.23,
        "longitude": 121.47,
        "imagePath": "map/historic_preservation_building/xxx.jpg",
        "preservationCategory": "一类",
        "batch": "第五批"
      }
    ],
    "total": 579,
    "uniqueValues": {
      "preservationCategories": ["一类", "二类", "三类", "四类"],
      "batches": ["第一批", "第二批", ...]
    }
  }
}
```

### 3.2 建筑详情

- 方法：GET
- 路径：/api/v1/buildings/{id}
- 描述：获取建筑详情（含关联照片）

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "buildingId": 1,
    "originalName": "原名称",
    "currentName": "现名称",
    "address": "地址",
    "structureType": "结构类型",
    "constructionYear": "建造年代",
    "preservationCategory": "一类",
    "preservationRequirements": "保护要求",
    "imagePath": "map/historic_preservation_building/xxx.jpg",
    "latitude": 31.23,
    "longitude": 121.47,
    "batch": "第五批",
    "photos": [
      {
        "id": 1,
        "chineseTitle": "中文标题",
        "englishTitle": "English Title",
        "year": "1930",
        "imageFilename": "photo/dbImage_ID-xxx.jpg"
      }
    ]
  }
}
```

---

## 4. 历史地图接口（Maps）

### 4.1 地图列表

- 方法：GET
- 路径：/api/v1/maps

| 参数 | 必填 | 类型 | 描述 |
|------|------|------|------|
| page | No | int | 页码（默认 1） |
| size | No | int | 每页数量（默认 100） |
| mapType | No | string | 类型 | 城市地图 |
| subtype | No | string | 子类型 | 街区图 |
| tags | No | string | 标签 | 商业 |
| series | No | string | 系列 | 外滩 |
| clarity | No | string | 清晰程度 | 清晰 |
| importance | No | string | 重要性 | 高 |
| usageSuggestions | No | string | 使用建议 | 研究 |
| source | No | string | 来源 | 档案馆 |
| year | No | string | 年份 | 1930 |

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [...],
    "total": 794,
    "uniqueValues": {
      "mapType": ["城市地图", "区域图", ...],
      "subtype": ["街区图", "道路图", ...],
      "clarity": ["清晰", "一般", ...],
      "importance": ["高", "中", "低"],
      "source": ["档案馆", "图书馆", ...],
      "series": ["外滩", "租界", ...],
      "tags": ["商业", "住宅", ...],
      "usageSuggestions": ["研究", "展示", ...]
    }
  }
}
```

### 4.2 地图详情

- 方法：GET
- 路径：/api/v1/maps/{id}

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "mapId": 1,
    "title": "上海地图",
    "chineseName": "上海地图",
    "foreignName": "Shanghai Map",
    "year": "1930",
    "era": "民国",
    "mapType": "城市地图",
    "subtype": "街区图",
    "series": "外滩",
    "tags": "商业",
    "clarity": "清晰",
    "importance": "高",
    "usageSuggestions": "研究",
    "source": "档案馆",
    "description": "描述",
    "imageFilename": "map/shanghai_historic_map/vcMap_ID-xxx.jpg"
  }
}
```

---

## 5. 历史建筑CRUD接口（Historical Buildings）

### 5.1 建筑列表

- 方法：GET
- 路径：/api/v1/historical-buildings

| 参数 | 必填 | 类型 | 描述 |
|------|------|------|------|
| page | No | int | 页码（默认 1） |
| size | No | int | 每页数量（默认 50） |
| name | No | string | 建筑名称筛选 |
| address | No | string | 地址筛选 |
| buildingType | No | string | 建筑类型筛选 |
| dateStart | No | string | 开始年代筛选 |
| dateEnd | No | string | 结束年代筛选 |
| builder | No | string | 建筑商筛选 |
| hasPhotos | No | bool | 是否有照片 |

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "buildingId": 1,
        "buildingName": "Building Name",
        "buildingChineseName": "建筑名称",
        "buildingAddress": "地址",
        "dateStart": "1900",
        "dateEnd": "1950",
        "types": [
          { "codeValue": "Commercial facility", "codeNameCn": "商业设施" }
        ],
        "photoCount": 5
      }
    ],
    "total": 1804
  }
}
```

### 5.2 建筑详情

- 方法：GET
- 路径：/api/v1/historical-buildings/{id}

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "buildingId": 1,
    "buildingName": "Building Name",
    "buildingChineseName": "建筑名称",
    "buildingAddress": "地址",
    "dateStart": "1900",
    "dateEnd": "1950",
    "xAxis": 123.456,
    "yAxis": 31.234,
    "types": [
      { "codeValue": "Commercial facility", "codeNameCn": "商业设施" }
    ],
    "photos": [
      {
        "id": 1,
        "chineseTitle": "中文标题",
        "englishTitle": "English Title",
        "year": "1930",
        "imageFilename": "photo/dbImage_ID-xxx.jpg"
      }
    ]
  }
}
```

### 5.3 创建建筑

- 方法：POST
- 路径：/api/v1/historical-buildings
- Content-Type: application/json

### 请求体

```json
{
  "buildingName": "Building Name",
  "buildingChineseName": "建筑名称",
  "buildingAddress": "地址",
  "dateStart": "1900",
  "dateEnd": "1950",
  "xAxis": 123.456,
  "yAxis": 31.234,
  "types": ["Commercial facility"]
}
```

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "buildingId": 1805
  }
}
```

### 5.4 更新建筑

- 方法：PUT
- 路径：/api/v1/historical-buildings/{id}
- Content-Type: application/json

### 请求体（同创建）

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

### 5.5 删除建筑

- 方法：DELETE
- 路径：/api/v1/historical-buildings/{id}

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

### 5.6 添加建筑类型

- 方法：POST
- 路径：/api/v1/historical-buildings/{id}/types

### 请求体

```json
{
  "codeValue": "Commercial facility"
}
```

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

### 5.7 删除建筑类型

- 方法：DELETE
- 路径：/api/v1/historical-buildings/{id}/types/{codeValue}

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

### 5.8 获取建筑类型列表

- 方法：GET
- 路径：/api/v1/building-types

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "codeType": "建筑类型", "codeValue": "Administrative facility", "codeNameCn": "行政设施" },
    { "codeType": "建筑类型", "codeValue": "Commercial facility", "codeNameCn": "商业设施" }
  ]
}
```

---

## 6. 历史照片接口（Photographs）

### 6.1 照片列表

- 方法：GET
- 路径：/api/v1/photographs

| 参数 | 必填 | 类型 | 描述 |
|------|------|------|------|
| page | No | int | 页码（默认 1） |
| size | No | int | 每页数量（默认 50） |
| source | No | string | 来源筛选 |
| timePeriod | No | string | 时期筛选 |
| photoType | No | string | 照片类型筛选 |
| tag | No | string | 标签筛选 |
| buildingId | No | int | 关联建筑ID筛选 |

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "chineseTitle": "中文标题",
        "englishTitle": "English Title",
        "source": "来源",
        "year": "1930",
        "timePeriod": "时期",
        "imageFilename": "photo/dbImage_ID-xxx.jpg",
        "tags": ["外滩", "建筑"],
        "types": [
          { "codeValue": "Architecture", "codeNameCn": "建筑" }
        ],
        "buildingCount": 2
      }
    ],
    "total": 6624
  }
}
```

### 6.2 照片详情

- 方法：GET
- 路径：/api/v1/photographs/{id}

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "chineseTitle": "中文标题",
    "englishTitle": "English Title",
    "source": "来源",
    "year": "1930",
    "timePeriod": "时期",
    "description": "描述",
    "imageFilename": "photo/dbImage_ID-xxx.jpg",
    "tags": ["外滩", "建筑"],
    "types": [
      { "codeValue": "Architecture", "codeNameCn": "建筑" }
    ],
    "buildings": [
      { "buildingId": 1, "buildingChineseName": "建筑名称" }
    ]
  }
}
```

### 6.3 批量绑定建筑

- 方法：POST
- 路径：/api/v1/photographs/bindings

### 请求体

```json
{
  "photographyIds": [1, 2, 3],
  "buildingId": 5
}
```

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "successCount": 3
  }
}
```

### 6.4 绑定照片到建筑

- 方法：POST
- 路径：/api/v1/photographs/{id}/buildings

### 请求体

```json
{
  "buildingId": 5
}
```

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

### 6.5 解除照片与建筑绑定

- 方法：DELETE
- 路径：/api/v1/photographs/{id}/buildings/{buildingId}

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

### 6.6 添加照片标签

- 方法：POST
- 路径：/api/v1/photographs/tags

### 请求体

```json
{
  "photographyId": 1,
  "tag": "外滩"
}
```

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

### 6.7 删除照片标签

- 方法：DELETE
- 路径：/api/v1/photographs/{id}/tags/{tag}

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

### 6.8 添加照片类型

- 方法：POST
- 路径：/api/v1/photographs/types

### 请求体

```json
{
  "photographyId": 1,
  "codeValue": "Architecture"
}
```

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

### 6.9 删除照片类型

- 方法：DELETE
- 路径：/api/v1/photographs/{id}/types/{codeValue}

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

### 6.10 获取照片标签列表

- 方法：GET
- 路径：/api/v1/photo-tags

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": ["外滩", "南京路", "豫园", ...]
}
```

### 6.11 获取照片类型列表

- 方法：GET
- 路径：/api/v1/photo-types

### 响应结果

```json
{
  "code": 0,
  "message": "success",
  "data": [
    { "codeType": "照片类型", "codeValue": "War", "codeNameCn": "战争" },
    { "codeType": "照片类型", "codeValue": "Cityscape", "codeNameCn": "城市景观" }
  ]
}
```

---

## 7. 前端交互规范

### 7.1 键盘交互

| 键 | 场景 | 行为 |
|----|------|------|
| ESC | 详情弹窗打开时 | 关闭弹窗 |
| ESC | 图片灯箱打开时 | 关闭灯箱 |
| ← | 详情弹窗（地图） | 切换到上一个地图 |
| → | 详情弹窗（地图） | 切换到下一个地图 |
| ← | 图片灯箱 | 显示上一张图片（循环） |
| → | 图片灯箱 | 显示下一张图片（循环） |

### 7.2 图片URL规范

前端图片访问地址：`http://localhost:5105/data/{imagePath}`

其中 imagePath 来自数据库，例如：
- 建筑主图：`map/historic_preservation_building/W02014xxx.jpg`
- 历史照片：`photo/dbImage_ID-21_No-1.jpeg`
- 历史地图：`map/shanghai_historic_map/vcMap_ID-xxx.jpg`

### 7.3 弹窗层级

| 层级 | z-index | 用途 |
|------|---------|------|
| Leaflet MapPane | 400-700 | 地图内部元素 |
| Leaflet ControlPane | 800 | 地图控件 |
| Modal Backdrop | 999 | 遮罩层 |
| Modal Container | 1000 | 弹窗主体 |
| Image Lightbox | 3000 | 图片灯箱 |

---

## 8. 错误码规范

| 错误码 | 含义 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 资源不存在 |
| 1003 | 服务器内部错误 |

---

## 9. 设计规范

1. **RESTful 风格**：使用标准 HTTP 方法
2. **统一返回结构**：所有接口返回 `{ code, message, data }` 格式
3. **分页支持**：列表接口支持 page/size 参数
4. **筛选支持**：列表接口支持多条件筛选
5. **唯一值返回**：列表接口返回各字段的唯一值，供前端填充筛选器
6. **类型格式**：types 字段统一返回 `[{codeValue, codeNameCn}]` 格式

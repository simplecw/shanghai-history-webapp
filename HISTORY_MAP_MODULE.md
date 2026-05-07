# 历史地图模块

提供历史地图检索与筛选功能。

## 功能

- 8个筛选条件：MAP_TYPE、SUBTYPE、TAGS、SERIES、CLARITY、IMPORTANCE、USAGE_SUGGESTIONS、SOURCE
- 10个显示字段：TITLE、CHINESE_NAME、FOREIGN_NAME、YEAR、ERA、MAP_TYPE、SUBTYPE、TAGS、SERIES、SOURCE
- 点击行查看地图大图
- 键盘左右键循环切换

## API

- `GET /api/v1/maps` - 获取地图列表
- `GET /api/v1/maps/{id}` - 获取地图详情
- `GET /api/v1/maps/filters/unique-values` - 获取筛选选项

## 文件

- `maps.html` - 前端页面
- `03-backend/app/app/models/map.py` - 数据模型
- `03-backend/app/app/schemas/map.py` - API Schema
- `03-backend/app/app/services/map_service.py` - 服务层
- `03-backend/app/app/api/v1/maps.py` - API路由
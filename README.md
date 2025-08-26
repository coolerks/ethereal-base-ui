# 🌌 Ethereal Base

**Ethereal Base** 是一款优雅、灵活的数据库管理工具，支持自定义连接数据库驱动，为开发者提供便捷的数据库操作体验。  

---

## ✨ 功能特色

- 🛠 **自定义数据库驱动**：支持多种数据库类型的灵活连接  
- 💡 **智能代码提示**：内置 74+ 聚合函数，支持 MySQL、Oracle、PostgreSQL、SQL Server  
- 📊 **丰富的聚合函数库**：包含基础聚合、统计分析、窗口函数、JSON 处理等 19 个分类  
- 🎯 **精准文档提示**：每个函数都有详细的使用说明、示例代码和数据库兼容性信息  
- ⚛️ **现代前端技术**：基于 React 构建，提供流畅的用户体验  
- ☕ **强大后端支持**：使用 Java 编写，保证高性能与稳定性  


---

## 🚀 快速开始

1. **克隆代码库**
   ```bash
   git clone https://github.com/coolerks/ethereal-base-ui.git
   ```

2. **安装依赖**  
   前端：
   ```bash
   cd ethereal-base-ui
   yarn
   ```

3. **运行项目**  
   前端：
   ```bash
    yarn dev
   ```

---

## 📊 聚合函数功能

### 🎯 丰富的函数库
Ethereal Base 内置了 **74+ 个聚合函数**，覆盖 19 个主要分类：

| 分类 | 函数数量 | 主要功能 |
|------|----------|----------|
| 基础聚合 | 5 | AVG, COUNT, MAX, MIN, SUM |
| 统计分析 | 15 | 方差、标准差、众数、偏度等 |
| 窗口函数 | 11 | 排名、偏移、百分位数等 |
| 字符串聚合 | 4 | GROUP_CONCAT, LISTAGG, STRING_AGG |
| JSON 处理 | 4 | JSON_ARRAYAGG, JSON_OBJECTAGG |
| 回归分析 | 9 | 线性回归相关的统计函数 |
| 位运算 | 3 | BIT_AND, BIT_OR, BIT_XOR |
| 地理空间 | 2 | ST_UNION, ST_COLLECT |
| 其他高级 | 21 | 包括近似计算、时间序列等 |

### 🗃️ 数据库支持
- **MySQL**: 26 个函数
- **Oracle**: 52 个函数  
- **PostgreSQL**: 56 个函数
- **SQL Server**: 45 个函数

### 💡 智能提示功能
- **函数分类显示**: 按功能分组，快速定位所需函数
- **详细文档**: 包含语法、示例、注意事项
- **兼容性提示**: 显示各数据库的支持情况
- **上下文感知**: 在适当的 SQL 子句中自动提示相关函数

### 📝 使用示例
```sql
-- 基础统计
SELECT AVG(salary), COUNT(*), MAX(hire_date) 
FROM employees;

-- 窗口函数
SELECT name, salary,
       RANK() OVER (ORDER BY salary DESC) as rank,
       PERCENT_RANK() OVER (ORDER BY salary) as percentile
FROM employees;

-- 字符串聚合 (MySQL)
SELECT department, GROUP_CONCAT(name SEPARATOR ', ') as team_members
FROM employees 
GROUP BY department;

-- JSON 聚合 (PostgreSQL)
SELECT JSON_AGG(
  JSON_BUILD_OBJECT('name', name, 'salary', salary)
) as employee_data
FROM employees;
```

---

## ⚙️ 配置指南

- **数据库驱动**  
  在配置文件中设置目标数据库的驱动与连接参数。

- **代码提示**  
  通过自定义配置 `config.json`，定义适配的代码提示规则。例如：
  ```json
  ....
  ```

---

## 🛡 开发与贡献

欢迎贡献代码或提出改进建议！🎉  

---

## 📄 许可证

本项目遵循 [MIT License](./LICENSE)。

---

🌠 **让数据管理变得更简单、更优雅！**
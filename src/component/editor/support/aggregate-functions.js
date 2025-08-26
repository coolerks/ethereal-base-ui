export const functions = [
  // 基础聚合函数 (Basic Aggregate Functions)
  { 
    name: 'AVG', 
    doc: 'AVG(column) - 计算指定列的平均值\n示例: SELECT AVG(salary) FROM employees;\n注意: 自动忽略 NULL 值', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'basic'
  },
  { 
    name: 'COUNT', 
    doc: 'COUNT(column|*) - 返回指定列或行的计数\n示例: COUNT(*) 计算所有行, COUNT(column) 计算非NULL值\n用法: SELECT COUNT(*) FROM users WHERE active = 1;', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'basic'
  },
  { 
    name: 'MAX', 
    doc: 'MAX(column) - 找出指定列的最大值\n示例: SELECT MAX(created_date) FROM orders;\n适用于数值、日期、字符串类型', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'basic'
  },
  { 
    name: 'MIN', 
    doc: 'MIN(column) - 找出指定列的最小值\n示例: SELECT MIN(price) FROM products WHERE category = \'electronics\';\n适用于数值、日期、字符串类型', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'basic'
  },
  { 
    name: 'SUM', 
    doc: 'SUM(column) - 计算指定列的总和\n示例: SELECT SUM(amount) FROM transactions WHERE status = \'completed\';\n仅适用于数值类型', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'basic'
  },
  
  // 字符串聚合函数 (String Aggregation Functions)
  { 
    name: 'GROUP_CONCAT', 
    doc: 'GROUP_CONCAT(column [SEPARATOR sep]) - 将列的值连接成字符串 (MySQL 专用)\n示例: SELECT GROUP_CONCAT(name SEPARATOR \', \') FROM users;\n可自定义分隔符，默认为逗号', 
    support: ['MySQL'],
    category: 'string'
  },
  { 
    name: 'LISTAGG', 
    doc: 'LISTAGG(column [, separator]) WITHIN GROUP (ORDER BY column) - 将列的值连接成字符串 (Oracle 专用)\n示例: SELECT LISTAGG(product_name, \', \') WITHIN GROUP (ORDER BY price) FROM products;\n支持排序和自定义分隔符', 
    support: ['Oracle'],
    category: 'string'
  },
  { 
    name: 'STRING_AGG', 
    doc: 'STRING_AGG(column, separator [ORDER BY column]) - 将列的值连接成字符串 (PostgreSQL 专用)\n示例: SELECT STRING_AGG(tag, \', \' ORDER BY tag) FROM post_tags;\n支持排序和去重', 
    support: ['PostgreSQL'],
    category: 'string'
  },
  { 
    name: 'STRING_AGG_DISTINCT', 
    doc: 'STRING_AGG(DISTINCT column, separator) - 将去重的列值连接成字符串\n示例: SELECT STRING_AGG(DISTINCT category, \', \') FROM products;\n自动去除重复值', 
    support: ['PostgreSQL'],
    category: 'string'
  },

  // 统计聚合函数 (Statistical Aggregate Functions)
  { 
    name: 'MEDIAN', 
    doc: 'MEDIAN(column) - 计算中位数 (Oracle 专用)\n示例: SELECT MEDIAN(salary) FROM employees;\n返回数据集的中位数值', 
    support: ['Oracle'],
    category: 'statistical'
  },
  { 
    name: 'VAR_POP', 
    doc: 'VAR_POP(column) - 计算总体方差\n示例: SELECT VAR_POP(score) FROM test_results;\n用于计算整个总体的方差', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'statistical'
  },
  { 
    name: 'VAR_SAMP', 
    doc: 'VAR_SAMP(column) - 计算样本方差\n示例: SELECT VAR_SAMP(revenue) FROM monthly_sales;\n用于计算样本的方差（N-1分母）', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'statistical'
  },
  { 
    name: 'STDDEV_POP', 
    doc: 'STDDEV_POP(column) - 计算总体标准差\n示例: SELECT STDDEV_POP(age) FROM population;\n总体标准差的平方根', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'statistical'
  },
  { 
    name: 'STDDEV_SAMP', 
    doc: 'STDDEV_SAMP(column) - 计算样本标准差\n示例: SELECT STDDEV_SAMP(height) FROM sample_data;\n样本标准差的平方根', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'statistical'
  },
  { 
    name: 'STDDEV', 
    doc: 'STDDEV(column) - 计算标准差（通常等同于 STDDEV_SAMP）\n示例: SELECT STDDEV(temperature) FROM weather_data;\n常用的标准差函数', 
    support: ['MySQL', 'Oracle', 'PostgreSQL'],
    category: 'statistical'
  },
  { 
    name: 'VARIANCE', 
    doc: 'VARIANCE(column) - 计算方差（通常等同于 VAR_SAMP）\n示例: SELECT VARIANCE(response_time) FROM performance_logs;\n常用的方差函数', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'statistical'
  },
  // JSON 聚合函数 (JSON Aggregate Functions)
  { 
    name: 'JSON_ARRAYAGG', 
    doc: 'JSON_ARRAYAGG(column) - 将列的值聚合成 JSON 数组\n示例: SELECT JSON_ARRAYAGG(product_name) FROM products;\n生成 JSON 格式的数组', 
    support: ['MySQL', 'Oracle'],
    category: 'json'
  },
  { 
    name: 'JSON_OBJECTAGG', 
    doc: 'JSON_OBJECTAGG(key_column, value_column) - 将键值对聚合成 JSON 对象\n示例: SELECT JSON_OBJECTAGG(name, value) FROM config;\n生成 JSON 格式的对象', 
    support: ['MySQL', 'PostgreSQL', 'Oracle'],
    category: 'json'
  },
  { 
    name: 'JSONB_AGG', 
    doc: 'JSONB_AGG(column) - 将列值聚合成 JSONB 数组 (PostgreSQL 专用)\n示例: SELECT JSONB_AGG(data) FROM json_table;\n性能更优的二进制 JSON 格式', 
    support: ['PostgreSQL'],
    category: 'json'
  },
  { 
    name: 'JSONB_OBJECT_AGG', 
    doc: 'JSONB_OBJECT_AGG(key, value) - 将键值对聚合成 JSONB 对象 (PostgreSQL 专用)\n示例: SELECT JSONB_OBJECT_AGG(key, value) FROM settings;\n二进制 JSON 对象格式', 
    support: ['PostgreSQL'],
    category: 'json'
  },

  // 相关性和回归函数 (Correlation and Regression Functions)
  { 
    name: 'CORR', 
    doc: 'CORR(column1, column2) - 计算两列之间的皮尔逊相关系数\n示例: SELECT CORR(advertising_spend, sales) FROM campaigns;\n返回值范围 [-1, 1]，表示线性相关程度', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'correlation'
  },
  { 
    name: 'COVAR_POP', 
    doc: 'COVAR_POP(column1, column2) - 计算总体协方差\n示例: SELECT COVAR_POP(x, y) FROM coordinates;\n衡量两个变量的联合变异程度', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'correlation'
  },
  { 
    name: 'COVAR_SAMP', 
    doc: 'COVAR_SAMP(column1, column2) - 计算样本协方差\n示例: SELECT COVAR_SAMP(temperature, humidity) FROM weather;\n使用 N-1 作为分母的协方差', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'correlation'
  },
  // 百分位数函数 (Percentile Functions)
  { 
    name: 'PERCENTILE_CONT', 
    doc: 'PERCENTILE_CONT(percentile) WITHIN GROUP (ORDER BY column) - 计算连续分位数\n示例: SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary) FROM employees;\n返回精确的百分位数值（插值计算）', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'percentile'
  },
  { 
    name: 'PERCENTILE_DISC', 
    doc: 'PERCENTILE_DISC(percentile) WITHIN GROUP (ORDER BY column) - 计算离散分位数\n示例: SELECT PERCENTILE_DISC(0.75) WITHIN GROUP (ORDER BY score) FROM tests;\n返回实际存在的数据值', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'percentile'
  },
  { 
    name: 'PERCENT_RANK', 
    doc: 'PERCENT_RANK() OVER (PARTITION BY column ORDER BY column) - 计算百分比排名\n示例: SELECT name, PERCENT_RANK() OVER (ORDER BY salary) FROM employees;\n返回 0 到 1 之间的排名百分比', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'percentile'
  },
  { 
    name: 'CUME_DIST', 
    doc: 'CUME_DIST() OVER (PARTITION BY column ORDER BY column) - 计算累积分布值\n示例: SELECT name, CUME_DIST() OVER (ORDER BY score DESC) FROM students;\n返回小于等于当前值的行数比例', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'percentile'
  },

  // 窗口排名函数 (Window Ranking Functions)
  { 
    name: 'DENSE_RANK', 
    doc: 'DENSE_RANK() OVER (PARTITION BY column ORDER BY column) - 计算密集排名\n示例: SELECT name, DENSE_RANK() OVER (ORDER BY score DESC) FROM competition;\n相同值得到相同排名，无跳跃', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server', 'MySQL'],
    category: 'ranking'
  },
  { 
    name: 'RANK', 
    doc: 'RANK() OVER (PARTITION BY column ORDER BY column) - 计算排名（有跳跃）\n示例: SELECT name, RANK() OVER (ORDER BY sales DESC) FROM salesperson;\n相同值后的排名会跳跃', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server', 'MySQL'],
    category: 'ranking'
  },
  { 
    name: 'ROW_NUMBER', 
    doc: 'ROW_NUMBER() OVER (PARTITION BY column ORDER BY column) - 计算行号\n示例: SELECT *, ROW_NUMBER() OVER (ORDER BY created_date) FROM orders;\n为每行分配唯一序号', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server', 'MySQL'],
    category: 'ranking'
  },
  { 
    name: 'NTILE', 
    doc: 'NTILE(n) OVER (PARTITION BY column ORDER BY column) - 将数据分为 n 组\n示例: SELECT name, NTILE(4) OVER (ORDER BY salary) AS quartile FROM employees;\n将数据均匀分配到指定数量的桶中', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server', 'MySQL'],
    category: 'ranking'
  },

  // 窗口偏移函数 (Window Offset Functions)
  { 
    name: 'FIRST_VALUE', 
    doc: 'FIRST_VALUE(column) OVER (PARTITION BY column ORDER BY column) - 获取分组中第一个值\n示例: SELECT *, FIRST_VALUE(price) OVER (PARTITION BY category ORDER BY date) FROM products;\n返回窗口中第一行的值', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server', 'MySQL'],
    category: 'offset'
  },
  { 
    name: 'LAST_VALUE', 
    doc: 'LAST_VALUE(column) OVER (PARTITION BY column ORDER BY column) - 获取分组中最后一个值\n示例: SELECT *, LAST_VALUE(status) OVER (PARTITION BY user_id ORDER BY timestamp) FROM user_actions;\n注意需要适当的框架规范', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server', 'MySQL'],
    category: 'offset'
  },
  { 
    name: 'LEAD', 
    doc: 'LEAD(column [, offset [, default]]) OVER (PARTITION BY column ORDER BY column) - 获取后续行的值\n示例: SELECT date, value, LEAD(value, 1) OVER (ORDER BY date) AS next_value FROM time_series;\n访问当前行之后的数据', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server', 'MySQL'],
    category: 'offset'
  },
  { 
    name: 'LAG', 
    doc: 'LAG(column [, offset [, default]]) OVER (PARTITION BY column ORDER BY column) - 获取前面行的值\n示例: SELECT date, price, LAG(price, 1) OVER (ORDER BY date) AS prev_price FROM stock_prices;\n访问当前行之前的数据', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server', 'MySQL'],
    category: 'offset'
  },
  { 
    name: 'NTH_VALUE', 
    doc: 'NTH_VALUE(column, n) OVER (PARTITION BY column ORDER BY column) - 获取第 n 行的值\n示例: SELECT *, NTH_VALUE(salary, 2) OVER (PARTITION BY dept ORDER BY salary DESC) FROM employees;\n返回窗口中第 n 行的值', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'offset'
  },
  // 模式和频率函数 (Mode and Frequency Functions)
  { 
    name: 'MODE', 
    doc: 'MODE() WITHIN GROUP (ORDER BY column) - 找出出现频率最高的值\n示例: SELECT MODE() WITHIN GROUP (ORDER BY department) FROM employees;\n返回最常见的值', 
    support: ['Oracle', 'PostgreSQL'],
    category: 'statistical'
  },
  { 
    name: 'STATS_MODE', 
    doc: 'STATS_MODE(column) - 计算众数（Oracle 专用）\n示例: SELECT STATS_MODE(grade) FROM student_grades;\n返回出现次数最多的值', 
    support: ['Oracle'],
    category: 'statistical'
  },

  // 线性回归函数 (Linear Regression Functions)
  { 
    name: 'REGR_SLOPE', 
    doc: 'REGR_SLOPE(y_column, x_column) - 返回线性回归的斜率\n示例: SELECT REGR_SLOPE(sales, advertising_cost) FROM campaigns;\n计算 y = ax + b 中的 a 值', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'regression'
  },
  { 
    name: 'REGR_INTERCEPT', 
    doc: 'REGR_INTERCEPT(y_column, x_column) - 返回线性回归的截距\n示例: SELECT REGR_INTERCEPT(profit, investment) FROM projects;\n计算 y = ax + b 中的 b 值', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'regression'
  },
  { 
    name: 'REGR_COUNT', 
    doc: 'REGR_COUNT(y_column, x_column) - 返回回归分析中参与计算的点数\n示例: SELECT REGR_COUNT(revenue, cost) FROM business_data;\n统计非空的数据点数量', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'regression'
  },
  { 
    name: 'REGR_R2', 
    doc: 'REGR_R2(y_column, x_column) - 返回线性回归的决定系数 (R²)\n示例: SELECT REGR_R2(performance, training_hours) FROM employees;\n衡量回归模型的拟合优度', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'regression'
  },
  { 
    name: 'REGR_AVGX', 
    doc: 'REGR_AVGX(y_column, x_column) - 返回自变量的平均值\n示例: SELECT REGR_AVGX(score, study_hours) FROM students;\n计算 x 变量的均值', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'regression'
  },
  { 
    name: 'REGR_AVGY', 
    doc: 'REGR_AVGY(y_column, x_column) - 返回因变量的平均值\n示例: SELECT REGR_AVGY(sales, price) FROM products;\n计算 y 变量的均值', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'regression'
  },
  { 
    name: 'REGR_SXX', 
    doc: 'REGR_SXX(y_column, x_column) - 返回自变量的平方和\n示例: SELECT REGR_SXX(output, input) FROM manufacturing;\n计算 Σ(x - x̄)²', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'regression'
  },
  { 
    name: 'REGR_SYY', 
    doc: 'REGR_SYY(y_column, x_column) - 返回因变量的平方和\n示例: SELECT REGR_SYY(efficiency, resources) FROM operations;\n计算 Σ(y - ȳ)²', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'regression'
  },
  { 
    name: 'REGR_SXY', 
    doc: 'REGR_SXY(y_column, x_column) - 返回自变量和因变量的协方差\n示例: SELECT REGR_SXY(profit, investment) FROM ventures;\n计算 Σ(x - x̄)(y - ȳ)', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'],
    category: 'regression'
  },
  // 位运算聚合函数 (Bitwise Aggregate Functions)
  { 
    name: 'BIT_AND', 
    doc: 'BIT_AND(column) - 按位与操作聚合值\n示例: SELECT BIT_AND(permissions) FROM user_roles;\n对所有行进行位与运算', 
    support: ['MySQL', 'PostgreSQL'],
    category: 'bitwise'
  },
  { 
    name: 'BIT_OR', 
    doc: 'BIT_OR(column) - 按位或操作聚合值\n示例: SELECT BIT_OR(flags) FROM feature_toggles;\n对所有行进行位或运算', 
    support: ['MySQL', 'PostgreSQL'],
    category: 'bitwise'
  },
  { 
    name: 'BIT_XOR', 
    doc: 'BIT_XOR(column) - 按位异或操作聚合值\n示例: SELECT BIT_XOR(checksum) FROM data_blocks;\n对所有行进行位异或运算', 
    support: ['MySQL'],
    category: 'bitwise'
  },

  // 布尔聚合函数 (Boolean Aggregate Functions)
  { 
    name: 'BOOL_AND', 
    doc: 'BOOL_AND(column) - 返回布尔列的逻辑与\n示例: SELECT BOOL_AND(is_active) FROM services;\n所有值为 true 时返回 true', 
    support: ['PostgreSQL'],
    category: 'boolean'
  },
  { 
    name: 'BOOL_OR', 
    doc: 'BOOL_OR(column) - 返回布尔列的逻辑或\n示例: SELECT BOOL_OR(has_error) FROM process_logs;\n任一值为 true 时返回 true', 
    support: ['PostgreSQL'],
    category: 'boolean'
  },
  { 
    name: 'EVERY', 
    doc: 'EVERY(condition) - 检查是否所有行都满足条件（等同于 BOOL_AND）\n示例: SELECT EVERY(salary > 30000) FROM employees;\n所有条件为真时返回 true', 
    support: ['PostgreSQL'],
    category: 'boolean'
  },

  // 数组和集合聚合函数 (Array and Set Aggregate Functions)
  { 
    name: 'ARRAY_AGG', 
    doc: 'ARRAY_AGG(column [ORDER BY column]) - 将列的值聚合成数组\n示例: SELECT ARRAY_AGG(tag ORDER BY tag) FROM post_tags;\n支持排序和去重', 
    support: ['PostgreSQL', 'Oracle'],
    category: 'array'
  },
  { 
    name: 'COLLECT', 
    doc: 'COLLECT(column) - 将列值收集到嵌套表中 (Oracle 专用)\n示例: SELECT COLLECT(employee_id) FROM departments;\n返回 Oracle 嵌套表类型', 
    support: ['Oracle'],
    category: 'array'
  },

  // XML 聚合函数 (XML Aggregate Functions)
  { 
    name: 'XMLAGG', 
    doc: 'XMLAGG(xml_column [ORDER BY column]) - 将列的值聚合成 XML (Oracle 专用)\n示例: SELECT XMLAGG(XMLELEMENT(NAME "item", product_name)) FROM products;\n生成结构化的 XML 文档', 
    support: ['Oracle'],
    category: 'xml'
  },

  // 高级统计函数 (Advanced Statistical Functions)
  { 
    name: 'KURTOSIS', 
    doc: 'KURTOSIS(column) - 计算峰度系数\n示例: SELECT KURTOSIS(response_time) FROM api_calls;\n衡量数据分布的尖锐程度', 
    support: ['SQL Server'],
    category: 'statistical'
  },
  { 
    name: 'SKEWNESS', 
    doc: 'SKEWNESS(column) - 计算偏度系数\n示例: SELECT SKEWNESS(income) FROM population;\n衡量数据分布的对称性', 
    support: ['SQL Server'],
    category: 'statistical'
  },

  // SQL Server 特有函数 (SQL Server Specific Functions)
  { 
    name: 'STDEV', 
    doc: 'STDEV(column) - 计算标准差 (SQL Server)\n示例: SELECT STDEV(score) FROM test_results;\nSQL Server 中的标准差函数', 
    support: ['SQL Server'],
    category: 'statistical'
  },
  { 
    name: 'STDEVP', 
    doc: 'STDEVP(column) - 计算总体标准差 (SQL Server)\n示例: SELECT STDEVP(population_age) FROM census;\n总体标准差的 SQL Server 版本', 
    support: ['SQL Server'],
    category: 'statistical'
  },
  { 
    name: 'VAR', 
    doc: 'VAR(column) - 计算方差 (SQL Server)\n示例: SELECT VAR(monthly_sales) FROM sales_data;\nSQL Server 中的方差函数', 
    support: ['SQL Server'],
    category: 'statistical'
  },
  { 
    name: 'VARP', 
    doc: 'VARP(column) - 计算总体方差 (SQL Server)\n示例: SELECT VARP(test_scores) FROM all_students;\n总体方差的 SQL Server 版本', 
    support: ['SQL Server'],
    category: 'statistical'
  },

  // 近似聚合函数 (Approximate Aggregate Functions)
  { 
    name: 'APPROX_COUNT_DISTINCT', 
    doc: 'APPROX_COUNT_DISTINCT(column) - 近似计算不重复值的数量\n示例: SELECT APPROX_COUNT_DISTINCT(user_id) FROM page_views;\n大数据集上的快速近似计算', 
    support: ['PostgreSQL', 'Oracle'],
    category: 'approximate'
  },
  { 
    name: 'APPROX_PERCENTILE', 
    doc: 'APPROX_PERCENTILE(column, percentile) - 近似计算百分位数\n示例: SELECT APPROX_PERCENTILE(response_time, 0.95) FROM requests;\n快速计算大数据集的百分位数', 
    support: ['Oracle'],
    category: 'approximate'
  },

  // 时间序列函数 (Time Series Functions)
  { 
    name: 'FIRST', 
    doc: 'FIRST(column ORDER BY time_column) - 获取时间序列中的第一个值\n示例: SELECT FIRST(price ORDER BY timestamp) FROM stock_prices;\n时间序列分析中的首值', 
    support: ['PostgreSQL'],
    category: 'timeseries'
  },
  { 
    name: 'LAST', 
    doc: 'LAST(column ORDER BY time_column) - 获取时间序列中的最后一个值\n示例: SELECT LAST(status ORDER BY updated_at) FROM order_history;\n时间序列分析中的末值', 
    support: ['PostgreSQL'],
    category: 'timeseries'
  },

  // 地理空间聚合函数 (Geospatial Aggregate Functions)
  { 
    name: 'ST_UNION', 
    doc: 'ST_UNION(geometry_column) - 合并几何对象\n示例: SELECT ST_UNION(polygon) FROM city_districts;\n将多个几何体合并为一个', 
    support: ['PostgreSQL', 'Oracle'],
    category: 'geospatial'
  },
  { 
    name: 'ST_COLLECT', 
    doc: 'ST_COLLECT(geometry_column) - 收集几何对象到集合中\n示例: SELECT ST_COLLECT(point) FROM sensor_locations;\n创建几何对象的集合', 
    support: ['PostgreSQL'],
    category: 'geospatial'
  },

  // 自定义聚合辅助函数 (Custom Aggregate Helper Functions)
  { 
    name: 'CHECKSUM_AGG', 
    doc: 'CHECKSUM_AGG(column) - 计算列值的校验和\n示例: SELECT CHECKSUM_AGG(id) FROM users;\n用于数据完整性验证', 
    support: ['SQL Server'],
    category: 'utility'
  },
  { 
    name: 'COUNT_BIG', 
    doc: 'COUNT_BIG(*|column) - 返回大整数类型的计数\n示例: SELECT COUNT_BIG(*) FROM large_table;\n处理超大数据集的计数', 
    support: ['SQL Server'],
    category: 'utility'
  },

  // 窗口框架函数 (Window Frame Functions)
  { 
    name: 'SUM_OVER_RANGE', 
    doc: 'SUM(column) OVER (ORDER BY column RANGE BETWEEN ... AND ...) - 范围窗口求和\n示例: SELECT SUM(amount) OVER (ORDER BY date RANGE BETWEEN INTERVAL \'7\' DAY PRECEDING AND CURRENT ROW) FROM transactions;\n基于值范围的窗口聚合', 
    support: ['PostgreSQL', 'Oracle', 'SQL Server'],
    category: 'window'
  },
  { 
    name: 'AVG_OVER_ROWS', 
    doc: 'AVG(column) OVER (ORDER BY column ROWS BETWEEN ... AND ...) - 行窗口平均值\n示例: SELECT AVG(price) OVER (ORDER BY date ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING) FROM stock_data;\n基于行数的移动平均', 
    support: ['PostgreSQL', 'Oracle', 'SQL Server', 'MySQL'],
    category: 'window'
  },

  // 高级窗口函数 (Advanced Window Functions)
  { 
    name: 'RATIO_TO_REPORT', 
    doc: 'RATIO_TO_REPORT(column) OVER (PARTITION BY column) - 计算占总数的比例\n示例: SELECT sales, RATIO_TO_REPORT(sales) OVER () AS percentage FROM regional_sales;\n计算每个值占总和的百分比', 
    support: ['Oracle'],
    category: 'analytical'
  },
  { 
    name: 'WIDTH_BUCKET', 
    doc: 'WIDTH_BUCKET(expression, min_value, max_value, num_buckets) - 将值分配到直方图桶中\n示例: SELECT WIDTH_BUCKET(salary, 20000, 100000, 10) FROM employees;\n创建等宽直方图', 
    support: ['Oracle', 'PostgreSQL'],
    category: 'analytical'
  }
]
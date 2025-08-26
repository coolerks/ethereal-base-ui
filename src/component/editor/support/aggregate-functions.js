/**
 * SQL 聚合函数和窗口函数集合
 * 涵盖基础聚合、统计分析、窗口函数、条件聚合等多种类型
 * 支持 MySQL、Oracle、PostgreSQL、SQL Server、SQLite 等主流数据库
 */
export const functions = [
  // ==================== 基础聚合函数 ====================
  { 
    name: 'AVG', 
    doc: 'AVG(column) - 计算指定列的平均值。示例：SELECT AVG(salary) FROM employees; 返回所有员工的平均工资', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server', 'SQLite'] 
  },
  { 
    name: 'COUNT', 
    doc: 'COUNT(column|*) - 返回指定列或行的计数。COUNT(*) 计算所有行，COUNT(column) 计算非NULL值。示例：SELECT COUNT(*) FROM users;', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server', 'SQLite'] 
  },
  { 
    name: 'MAX', 
    doc: 'MAX(column) - 找出指定列的最大值。支持数值、日期、字符串类型。示例：SELECT MAX(created_date) FROM orders;', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server', 'SQLite'] 
  },
  { 
    name: 'MIN', 
    doc: 'MIN(column) - 找出指定列的最小值。支持数值、日期、字符串类型。示例：SELECT MIN(price) FROM products;', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server', 'SQLite'] 
  },
  { 
    name: 'SUM', 
    doc: 'SUM(column) - 计算指定列的总和。只适用于数值类型。示例：SELECT SUM(amount) FROM transactions;', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server', 'SQLite'] 
  },

  // ==================== 字符串聚合函数 ====================
  { 
    name: 'GROUP_CONCAT', 
    doc: 'GROUP_CONCAT(column [SEPARATOR sep]) - 将列的值连接成字符串，可指定分隔符。示例：SELECT GROUP_CONCAT(name SEPARATOR \', \') FROM users;', 
    support: ['MySQL'] 
  },
  { 
    name: 'LISTAGG', 
    doc: 'LISTAGG(column, \',\') WITHIN GROUP (ORDER BY column) - 将列的值连接成字符串，支持排序。示例：SELECT LISTAGG(name, \', \') WITHIN GROUP (ORDER BY name) FROM employees;', 
    support: ['Oracle', 'SQL Server'] 
  },
  { 
    name: 'STRING_AGG', 
    doc: 'STRING_AGG(column, \',\' [ORDER BY column]) - 将列的值聚合成字符串，支持排序。示例：SELECT STRING_AGG(name, \', \' ORDER BY name) FROM users;', 
    support: ['PostgreSQL', 'SQL Server'] 
  },

  // ==================== 统计函数 ====================
  { 
    name: 'MEDIAN', 
    doc: 'MEDIAN(column) - 计算中位数，返回数据集中间位置的值。对于偶数个数据点返回中间两个值的平均值。', 
    support: ['Oracle'] 
  },
  { 
    name: 'VAR_POP', 
    doc: 'VAR_POP(column) - 计算总体方差，衡量数据的离散程度。适用于整个总体的数据分析。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'VAR_SAMP', 
    doc: 'VAR_SAMP(column) - 计算样本方差，用于样本数据的方差估计。比总体方差更常用于统计推断。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'STDDEV_POP', 
    doc: 'STDDEV_POP(column) - 计算总体标准差，方差的平方根。衡量数据相对于平均值的离散程度。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'STDDEV_SAMP', 
    doc: 'STDDEV_SAMP(column) - 计算样本标准差，用于样本数据的标准差估计。统计学中最常用的标准差计算方法。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },

  // ==================== JSON 聚合函数 ====================
  { 
    name: 'JSON_ARRAYAGG', 
    doc: 'JSON_ARRAYAGG(column) - 将列的值聚合成 JSON 数组格式。示例：SELECT JSON_ARRAYAGG(name) FROM users; 返回 ["Alice", "Bob", "Charlie"]', 
    support: ['MySQL', 'Oracle'] 
  },
  { 
    name: 'JSON_OBJECTAGG', 
    doc: 'JSON_OBJECTAGG(key_column, value_column) - 将键值对聚合成 JSON 对象。示例：SELECT JSON_OBJECTAGG(id, name) FROM users;', 
    support: ['MySQL', 'PostgreSQL', 'Oracle'] 
  },

  // ==================== 相关性和协方差函数 ====================
  { 
    name: 'CORR', 
    doc: 'CORR(column1, column2) - 计算两列间的皮尔逊相关系数，值域[-1,1]。1表示完全正相关，-1表示完全负相关，0表示无相关性。', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'COVAR_POP', 
    doc: 'COVAR_POP(column1, column2) - 计算总体协方差，衡量两个变量的联合变异程度。正值表示正相关，负值表示负相关。', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'COVAR_SAMP', 
    doc: 'COVAR_SAMP(column1, column2) - 计算样本协方差，用于样本数据的协方差估计。比总体协方差更常用于统计推断。', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'] 
  },

  // ==================== 分位数函数 ====================
  { 
    name: 'PERCENTILE_CONT', 
    doc: 'PERCENTILE_CONT(percentile) WITHIN GROUP (ORDER BY column) - 计算连续分位数，使用插值法。示例：计算工资的75%分位数', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'PERCENTILE_DISC', 
    doc: 'PERCENTILE_DISC(percentile) WITHIN GROUP (ORDER BY column) - 计算离散分位数，返回实际存在的值。不使用插值法。', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'] 
  },

  // ==================== 窗口函数 ====================
  { 
    name: 'ROW_NUMBER', 
    doc: 'ROW_NUMBER() OVER (PARTITION BY column ORDER BY column) - 为结果集中的每一行分配唯一的行号。示例：按部门为员工编号', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'RANK', 
    doc: 'RANK() OVER (PARTITION BY column ORDER BY column) - 计算排名，相同值获得相同排名，后续排名会跳跃。如：1,2,2,4', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'DENSE_RANK', 
    doc: 'DENSE_RANK() OVER (PARTITION BY column ORDER BY column) - 计算密集排名，相同值获得相同排名，后续排名不跳跃。如：1,2,2,3', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'NTILE', 
    doc: 'NTILE(n) OVER (PARTITION BY column ORDER BY column) - 将数据分为 n 个相等的组，为每行分配组号。常用于分析数据分布。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },

  // ==================== 取值函数 ====================
  { 
    name: 'FIRST_VALUE', 
    doc: 'FIRST_VALUE(column) OVER (PARTITION BY column ORDER BY column) - 获取分组中第一个值。常用于获取每组的最早记录。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'LAST_VALUE', 
    doc: 'LAST_VALUE(column) OVER (PARTITION BY column ORDER BY column ROWS UNBOUNDED PRECEDING) - 获取分组中最后一个值。注意需要指定窗口范围。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'NTH_VALUE', 
    doc: 'NTH_VALUE(column, n) OVER (PARTITION BY column ORDER BY column) - 获取分组中第n个值。n从1开始计数。', 
    support: ['Oracle', 'PostgreSQL', 'SQL Server'] 
  },

  // ==================== 偏移函数 ====================
  { 
    name: 'LEAD', 
    doc: 'LEAD(column, offset, default) OVER (PARTITION BY column ORDER BY column) - 获取后续第offset行的值。可指定默认值。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'LAG', 
    doc: 'LAG(column, offset, default) OVER (PARTITION BY column ORDER BY column) - 获取前offset行的值。常用于计算环比增长率。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },

  // ==================== 统计分布函数 ====================
  { 
    name: 'PERCENT_RANK', 
    doc: 'PERCENT_RANK() OVER (PARTITION BY column ORDER BY column) - 计算百分比排名，值域[0,1]。公式：(rank-1)/(rows-1)', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'CUME_DIST', 
    doc: 'CUME_DIST() OVER (PARTITION BY column ORDER BY column) - 计算累积分布值，表示小于等于当前值的行数比例。值域(0,1]', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },

  // ==================== 线性回归函数 ====================
  { 
    name: 'REGR_SLOPE', 
    doc: 'REGR_SLOPE(y_column, x_column) - 返回线性回归的斜率系数。用于预测y随x变化的趋势。', 
    support: ['Oracle', 'PostgreSQL'] 
  },
  { 
    name: 'REGR_INTERCEPT', 
    doc: 'REGR_INTERCEPT(y_column, x_column) - 返回线性回归的截距，即x=0时y的预测值。', 
    support: ['Oracle', 'PostgreSQL'] 
  },
  { 
    name: 'REGR_COUNT', 
    doc: 'REGR_COUNT(y_column, x_column) - 返回回归分析中参与计算的非NULL数据点数量。', 
    support: ['Oracle', 'PostgreSQL'] 
  },
  { 
    name: 'REGR_R2', 
    doc: 'REGR_R2(y_column, x_column) - 返回线性回归的决定系数(R²)，衡量回归模型的拟合优度。值域[0,1]', 
    support: ['Oracle', 'PostgreSQL'] 
  },
  { 
    name: 'REGR_AVGX', 
    doc: 'REGR_AVGX(y_column, x_column) - 返回自变量x的平均值。用于回归分析的基础统计。', 
    support: ['Oracle', 'PostgreSQL'] 
  },
  { 
    name: 'REGR_AVGY', 
    doc: 'REGR_AVGY(y_column, x_column) - 返回因变量y的平均值。用于回归分析的基础统计。', 
    support: ['Oracle', 'PostgreSQL'] 
  },
  { 
    name: 'REGR_SXX', 
    doc: 'REGR_SXX(y_column, x_column) - 返回自变量x的离差平方和。用于计算回归系数。', 
    support: ['Oracle', 'PostgreSQL'] 
  },
  { 
    name: 'REGR_SYY', 
    doc: 'REGR_SYY(y_column, x_column) - 返回因变量y的离差平方和。用于计算回归系数。', 
    support: ['Oracle', 'PostgreSQL'] 
  },
  { 
    name: 'REGR_SXY', 
    doc: 'REGR_SXY(y_column, x_column) - 返回x和y的离差乘积和，即协方差的分子部分。', 
    support: ['Oracle', 'PostgreSQL'] 
  },

  // ==================== 位操作聚合函数 ====================
  { 
    name: 'BIT_AND', 
    doc: 'BIT_AND(column) - 对整数列执行按位与操作聚合。所有位都为1时结果位才为1。常用于权限掩码计算。', 
    support: ['MySQL', 'PostgreSQL'] 
  },
  { 
    name: 'BIT_OR', 
    doc: 'BIT_OR(column) - 对整数列执行按位或操作聚合。任一位为1时结果位就为1。常用于状态标志合并。', 
    support: ['MySQL', 'PostgreSQL'] 
  },
  { 
    name: 'BIT_XOR', 
    doc: 'BIT_XOR(column) - 对整数列执行按位异或操作聚合。奇数个1时结果为1。可用于数据校验。', 
    support: ['MySQL'] 
  },

  // ==================== 布尔聚合函数 ====================
  { 
    name: 'BOOL_AND', 
    doc: 'BOOL_AND(boolean_column) - 返回布尔列的逻辑与结果。所有值都为true时返回true，否则返回false。', 
    support: ['PostgreSQL'] 
  },
  { 
    name: 'BOOL_OR', 
    doc: 'BOOL_OR(boolean_column) - 返回布尔列的逻辑或结果。任一值为true时返回true，全为false时返回false。', 
    support: ['PostgreSQL'] 
  },
  { 
    name: 'EVERY', 
    doc: 'EVERY(boolean_column) - 等同于BOOL_AND，返回所有布尔值的逻辑与结果。SQL标准函数。', 
    support: ['PostgreSQL'] 
  },

  // ==================== 数组和集合聚合函数 ====================
  { 
    name: 'ARRAY_AGG', 
    doc: 'ARRAY_AGG(column [ORDER BY column]) - 将列的值聚合成数组。支持排序。示例：SELECT ARRAY_AGG(name ORDER BY name) FROM users;', 
    support: ['PostgreSQL'] 
  },
  { 
    name: 'ARRAY_TO_STRING', 
    doc: 'ARRAY_TO_STRING(array_column, delimiter) - 将数组转换为字符串，用指定分隔符连接。与ARRAY_AGG配合使用。', 
    support: ['PostgreSQL'] 
  },

  // ==================== XML 聚合函数 ====================
  { 
    name: 'XMLAGG', 
    doc: 'XMLAGG(xml_column [ORDER BY column]) - 将XML列的值聚合成单个XML文档。支持排序和格式化。', 
    support: ['Oracle', 'PostgreSQL'] 
  },

  // ==================== 条件聚合函数 ====================
  { 
    name: 'COUNT_IF', 
    doc: 'COUNT_IF(condition) - 计算满足条件的行数。等同于COUNT(CASE WHEN condition THEN 1 END)。', 
    support: ['PostgreSQL'] 
  },
  { 
    name: 'SUM_IF', 
    doc: 'SUM_IF(column, condition) - 计算满足条件的行的列值总和。常用于条件性聚合分析。', 
    support: ['PostgreSQL'] 
  },

  // ==================== 统计众数和频率函数 ====================
  { 
    name: 'MODE', 
    doc: 'MODE() WITHIN GROUP (ORDER BY column) - 找出出现频率最高的值（众数）。对于多个众数返回其中一个。', 
    support: ['Oracle', 'PostgreSQL'] 
  },

  // ==================== 高级统计函数 ====================
  { 
    name: 'SKEWNESS', 
    doc: 'SKEWNESS(column) - 计算数据分布的偏度，衡量分布的不对称性。正值表示右偏，负值表示左偏。', 
    support: ['Oracle'] 
  },
  { 
    name: 'KURTOSIS', 
    doc: 'KURTOSIS(column) - 计算数据分布的峰度，衡量分布的尖锐程度。高峰度表示分布更尖锐。', 
    support: ['Oracle'] 
  },

  // ==================== SQL Server 特有函数 ====================
  { 
    name: 'CHECKSUM_AGG', 
    doc: 'CHECKSUM_AGG(column) - 计算列值的校验和聚合。用于检测数据变化，不保证唯一性。', 
    support: ['SQL Server'] 
  },
  { 
    name: 'BINARY_CHECKSUM', 
    doc: 'BINARY_CHECKSUM(*) - 计算行的二进制校验和。用于检测行数据的完整性变化。', 
    support: ['SQL Server'] 
  },
  { 
    name: 'GROUPING', 
    doc: 'GROUPING(column) - 在GROUP BY ROLLUP/CUBE中使用，标识某列是否参与了分组。返回0或1。', 
    support: ['SQL Server', 'Oracle', 'PostgreSQL'] 
  },
  { 
    name: 'GROUPING_ID', 
    doc: 'GROUPING_ID(column1, column2, ...) - 返回分组级别的位图标识。用于区分不同的汇总级别。', 
    support: ['SQL Server', 'Oracle'] 
  },

  // ==================== 窗口框架函数 ====================
  { 
    name: 'SUM_OVER', 
    doc: 'SUM(column) OVER (ORDER BY column ROWS BETWEEN n PRECEDING AND CURRENT ROW) - 滑动窗口求和。计算当前行及前n行的总和。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'AVG_OVER', 
    doc: 'AVG(column) OVER (ORDER BY column ROWS BETWEEN n PRECEDING AND n FOLLOWING) - 滑动窗口平均值。可自定义窗口范围。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'COUNT_OVER', 
    doc: 'COUNT(*) OVER (ORDER BY column RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) - 累计计数。计算从开始到当前行的累计行数。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },

  // ==================== 近似聚合函数 ====================
  { 
    name: 'APPROX_COUNT_DISTINCT', 
    doc: 'APPROX_COUNT_DISTINCT(column) - 近似计算不重复值的数量。对大数据集性能更好，结果为估算值。', 
    support: ['Oracle', 'PostgreSQL'] 
  },
  { 
    name: 'APPROX_PERCENTILE', 
    doc: 'APPROX_PERCENTILE(column, percentile) - 近似计算分位数。对大数据集提供快速的分位数估算。', 
    support: ['Oracle'] 
  },

  // ==================== 时间序列聚合函数 ====================
  { 
    name: 'FIRST', 
    doc: 'FIRST(column) - 返回时间序列中的第一个值。常用于时间序列分析的起始值获取。', 
    support: ['Oracle'] 
  },
  { 
    name: 'LAST', 
    doc: 'LAST(column) - 返回时间序列中的最后一个值。常用于获取时间序列的最新状态。', 
    support: ['Oracle'] 
  },

  // ==================== 集合运算聚合函数 ====================
  { 
    name: 'COLLECT', 
    doc: 'COLLECT(column) - 将列值收集到嵌套表中。Oracle特有的集合聚合函数，用于对象关系数据库。', 
    support: ['Oracle'] 
  },

  // ==================== 自定义聚合函数示例 ====================
  { 
    name: 'VARIANCE', 
    doc: 'VARIANCE(column) - 计算方差，等同于VAR_SAMP。是VAR_SAMP的别名，提供更直观的函数名。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'STDDEV', 
    doc: 'STDDEV(column) - 计算标准差，等同于STDDEV_SAMP。是STDDEV_SAMP的别名，提供更简洁的函数名。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },

  // ==================== 空值处理聚合函数 ====================
  { 
    name: 'COUNT_NULL', 
    doc: 'COUNT(CASE WHEN column IS NULL THEN 1 END) - 计算NULL值的数量。用于数据质量分析。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server', 'SQLite'] 
  },
  { 
    name: 'COUNT_NOT_NULL', 
    doc: 'COUNT(column) - 计算非NULL值的数量。等同于COUNT(column)，用于数据完整性检查。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server', 'SQLite'] 
  },

  // ==================== 几何和空间聚合函数 ====================
  { 
    name: 'ST_UNION', 
    doc: 'ST_UNION(geometry_column) - 合并几何对象。返回所有几何对象的并集，用于空间数据分析。', 
    support: ['PostgreSQL', 'MySQL'] 
  },
  { 
    name: 'ST_COLLECT', 
    doc: 'ST_COLLECT(geometry_column) - 收集几何对象到几何集合中。保持原始几何对象的独立性。', 
    support: ['PostgreSQL'] 
  },

  // ==================== 增强的聚合函数 ====================
  { 
    name: 'LISTAGG_DISTINCT', 
    doc: 'LISTAGG(DISTINCT column, \',\') WITHIN GROUP (ORDER BY column) - 聚合不重复的值为字符串。避免重复值的干扰。', 
    support: ['Oracle'] 
  },
  { 
    name: 'STRING_AGG_DISTINCT', 
    doc: 'STRING_AGG(DISTINCT column, \',\' ORDER BY column) - PostgreSQL中聚合不重复值为字符串的方法。', 
    support: ['PostgreSQL'] 
  },

  // ==================== 条件统计函数 ====================
  { 
    name: 'COUNT_DISTINCT', 
    doc: 'COUNT(DISTINCT column) - 计算不重复值的数量。常用于分析数据的唯一性和多样性。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server', 'SQLite'] 
  },
  { 
    name: 'AVG_DISTINCT', 
    doc: 'AVG(DISTINCT column) - 计算不重复值的平均值。排除重复值对平均值的影响。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'SUM_DISTINCT', 
    doc: 'SUM(DISTINCT column) - 计算不重复值的总和。避免重复值被多次累加。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },

  // ==================== 分组统计函数 ====================
  { 
    name: 'COUNT_GROUP', 
    doc: 'COUNT(*) GROUP BY column - 按组计算每组的行数。基础的分组统计方法。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server', 'SQLite'] 
  },
  { 
    name: 'MAX_BY', 
    doc: 'MAX_BY(value_column, order_column) - 返回order_column最大值对应的value_column值。等同于排序后取第一个。', 
    support: ['PostgreSQL'] 
  },
  { 
    name: 'MIN_BY', 
    doc: 'MIN_BY(value_column, order_column) - 返回order_column最小值对应的value_column值。用于找到条件最小时的关联值。', 
    support: ['PostgreSQL'] 
  },

  // ==================== 高级窗口函数 ====================
  { 
    name: 'RATIO_TO_REPORT', 
    doc: 'RATIO_TO_REPORT(column) OVER () - 计算每行值占总和的比例。返回值在0到1之间，所有行的比例之和为1。', 
    support: ['Oracle'] 
  },
  { 
    name: 'WIDTH_BUCKET', 
    doc: 'WIDTH_BUCKET(column, min_value, max_value, num_buckets) - 将数值分配到指定数量的等宽桶中。返回桶编号。', 
    support: ['Oracle', 'PostgreSQL'] 
  },

  // ==================== 累积聚合函数 ====================
  { 
    name: 'RUNNING_SUM', 
    doc: 'SUM(column) OVER (ORDER BY column ROWS UNBOUNDED PRECEDING) - 累积求和。计算从第一行到当前行的累计总和。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'RUNNING_AVG', 
    doc: 'AVG(column) OVER (ORDER BY column ROWS UNBOUNDED PRECEDING) - 累积平均值。计算从第一行到当前行的累计平均值。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  },
  { 
    name: 'RUNNING_COUNT', 
    doc: 'COUNT(*) OVER (ORDER BY column ROWS UNBOUNDED PRECEDING) - 累积计数。计算从第一行到当前行的累计行数。', 
    support: ['MySQL', 'Oracle', 'PostgreSQL', 'SQL Server'] 
  }
]
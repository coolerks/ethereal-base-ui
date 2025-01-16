export const databases = [
  {
    "schema": "public",  // 模式名称，表示数据库中的一个逻辑分组
    "tables": [
      {
        "name": "users",  // 表名，表示数据库表的名称
        "comment": "用户信息",  // 表注释，对表的用途进行说明
        "ddl": "CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100));",  // 表的创建DDL语句
        "columns": [
          {
            "name": "id",  // 列名，表示表中字段的名称
            "comment": "主键",  // 列注释，对列的用途进行说明
            "order": 1,  // 列顺序，字段在表中的排列顺序
            "nullable": false,  // 是否允许为空，true表示允许，false表示不允许
            "dataType": "INT",  // 数据类型，字段的数据格式
            "defaultValue": null  // 默认值，字段的默认值
          },
          {
            "name": "name",  // 列名，表示表中字段的名称
            "comment": "用户名",  // 列注释，对列的用途进行说明
            "order": 2,  // 列顺序，字段在表中的排列顺序
            "nullable": false,  // 是否允许为空，true表示允许，false表示不允许
            "dataType": "VARCHAR(100)",  // 数据类型，字段的数据格式
            "defaultValue": null  // 默认值，字段的默认值
          }
        ],
        "indexes": [
          {
            "name": "pk_users",  // 索引名称
            "unique": true,  // 是否唯一，true表示唯一索引
            "columns": ["id"],  // 列名，索引涉及的列
            "order": 1  // 索引顺序
          }
        ],
        "foreignKeys": [
          {
            "name": "fk_users_roles",  // 外键名称
            "localColumns": ["role_id"],  // 本地列名，参与外键约束的列
            "referencedTable": "roles",  // 引用的表名
            "referencedColumns": ["id"],  // 引用的列名
            "onUpdate": "CASCADE",  // 更新规则
            "onDelete": "SET NULL"  // 删除规则
          }
        ]
      },
      {
        "name": "roles",  // 表名，表示数据库表的名称
        "comment": "角色信息",  // 表注释，对表的用途进行说明
        "ddl": "CREATE TABLE roles (id INT PRIMARY KEY, name VARCHAR(100));",  // 表的创建DDL语句
        "columns": [
          {
            "name": "id",  // 列名，表示表中字段的名称
            "comment": "主键",  // 列注释，对列的用途进行说明
            "order": 1,  // 列顺序，字段在表中的排列顺序
            "nullable": false,  // 是否允许为空，true表示允许，false表示不允许
            "dataType": "INT",  // 数据类型，字段的数据格式
            "defaultValue": null  // 默认值，字段的默认值
          },
          {
            "name": "name",  // 列名，表示表中字段的名称
            "comment": "角色名",  // 列注释，对列的用途进行说明
            "order": 2,  // 列顺序，字段在表中的排列顺序
            "nullable": false,  // 是否允许为空，true表示允许，false表示不允许
            "dataType": "VARCHAR(100)",  // 数据类型，字段的数据格式
            "defaultValue": null  // 默认值，字段的默认值
          },
          {
            "name": "status",  // 列名，表示表中字段的名称
            "comment": "状态",  // 列注释，对列的用途进行说明
            "order": 3,  // 列顺序，字段在表中的排列顺序
            "nullable": true,  // 是否允许为空，true表示允许，false表示不允许
            "dataType": "VARCHAR(10)",  // 数据类型，字段的数据格式
            "defaultValue": "'ACTIVE'"  // 默认值，字段的默认值
          }
        ],
        "indexes": [
          {
            "name": "pk_roles",  // 索引名称
            "unique": true,  // 是否唯一，true表示唯一索引
            "columns": ["id"],  // 列名，索引涉及的列
            "order": 1  // 索引顺序
          }
        ]
      }
    ],
    "views": [
      {
        "name": "user_summary",  // 视图名称
        "comment": "用户信息摘要",  // 视图注释
        "ddl": "CREATE VIEW user_summary AS SELECT id, name FROM users;"  // 视图的创建DDL语句
      }
    ],
    "functions": [
      {
        "name": "get_user_count",  // 函数名称
        "parameters": [
          {"name": "status", "type": "VARCHAR", "order": 1}  // 参数列表，包括名称、类型、顺序
        ],
        "returnType": "INT",  // 返回值类型
        "ddl": "CREATE FUNCTION get_user_count(status VARCHAR) RETURNS INT AS $$ BEGIN RETURN 0; END; $$ LANGUAGE plpgsql;"  // 函数的创建DDL语句
      }
    ],
    "procedures": [
      {
        "name": "update_user_status",  // 存储过程名称
        "ddl": "CREATE PROCEDURE update_user_status(IN user_id INT, IN status VARCHAR) LANGUAGE SQL AS $$ BEGIN UPDATE users SET status = status WHERE id = user_id; END; $$;"  // 存储过程的创建DDL语句
      }
    ],
    "triggers": [
      {
        "name": "user_status_update_trigger",  // 触发器名称
        "event": "UPDATE",  // 触发事件，INSERT、UPDATE或DELETE
        "timing": "AFTER",  // 触发时间，BEFORE或AFTER
        "status": "ENABLED",  // 触发器状态，启用或禁用
        "ddl": "CREATE TRIGGER user_status_update_trigger AFTER UPDATE ON users FOR EACH ROW EXECUTE FUNCTION log_status_change();"  // 触发器的创建DDL语句
      }
    ],
    "privileges": [
      {
        "user": "db_user",  // 用户名
        "table": "users",  // 表名
        "type": "SELECT",  // 权限类型，例如SELECT、INSERT等
        "scope": "ALL"  // 权限范围
      }
    ]
  }
]

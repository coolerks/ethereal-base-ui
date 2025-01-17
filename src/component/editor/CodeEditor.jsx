import React, {useRef, useState} from 'react';
import {Editor} from "@monaco-editor/react";
import {Parser} from "node-sql-parser";
import {databases} from "./support/schema.js";
import {functions} from "./support/aggregate-functions.js";

function CodeEditor() {
  const [sql, setSql] = useState('');
  const parser = useRef(new Parser());
  const editorRef = useRef(null);
  const [isLight, setIsLight] = useState(true);
  const ast = useRef(null);

  // SQL 关键字列表
  const SQLKeywords = [
    "SELECT", "FROM", "WHERE", "INSERT INTO", "UPDATE", "DELETE", "CREATE", "DROP", "ALTER", "TABLE", "DATABASE", "INDEX",
    "GROUP BY", "ORDER BY", "HAVING", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "LIMIT", "OFFSET", "UNION",
    "AND", "OR", "NOT", "IN", "BETWEEN", "LIKE", "IS NULL", "IS NOT NULL", "INTO", "SET", "VALUES", "AS", "ON", "USING",
    "PRIMARY KEY", "FOREIGN KEY", "REFERENCES", "UNIQUE", "CHECK", "DEFAULT", "AUTO_INCREMENT", "CHAR", "VARCHAR",
    "TEXT", "INT", "INTEGER", "BIGINT", "FLOAT", "DOUBLE", "DECIMAL", "DATE", "TIME", "TIMESTAMP", "YEAR", "ENUM",
    "BOOLEAN", "BIT", "BLOB", "JSON", "NULL", "TRUE", "FALSE", "CASE", "WHEN", "THEN", "ELSE", "END", "WHILE", "DO",
    "BEGIN", "IF", "ELSIF", "END IF", "LOOP", "EXIT", "CONTINUE", "RETURN", "RETURNS", "FUNCTION", "PROCEDURE", "CALL",
    "TRIGGER", "EVENT", "REPLACE", "GRANT", "REVOKE", "PRIVILEGES", "ALL", "ANY", "SOME", "TO", "WITH", "OPTION",
    "SESSION", "SYSTEM", "GRANTED", "IDENTIFIED", "BY", "PASSWORD", "ADMIN", "RESOURCE", "ROLE", "ROLES", "VIEW",
    "SCHEMA", "USER", "USERS", "GROUP", "COLUMN", "COLUMNS", "INDEXES", "VIEWS", "FUNCTIONS", "PROCEDURES", "TRIGGERS",
    "PRIVILEGE", "EXECUTE", "ORDER", "LEFT", "RIGHT", "INNER", "OUTER", "FULL", "CROSS", "NATURAL", "IS"
  ];

  // 获取当前数据库模式下的所有表
  const getTables = () => {
    return databases.reduce((acc, db) => {
      acc.push(...db.tables.map(table => ({
        name: table.name,
        comment: table.comment,
        ddl: table.ddl,
        columns: table.columns
      })));
      return acc;
    }, []);
  };

  // 获取指定表的所有列
  const getColumns = (tableName) => {
    for (const db of databases) {
      const table = db.tables.find(t => t.name === tableName);
      if (table) {
        return table.columns.map(col => ({...col, tableName}));
      }
    }
    return [];
  };

  // 从 AST 中获取别名对应的表名
  const getTableFromAlias = (alias) => {
    if (!ast || !ast.current?.from) return null;

    const tableRef = ast.current?.from.find(item =>
        (item.as === alias) || // 检查别名
        (!item.as && item.table === alias) // 检查表名本身
    );

    return tableRef ? tableRef.table : null;
  };

  const handleEditorChange = (val) => {
    try {
      setSql(val);
      const opt = {
        database: 'MySQL'
      }
      const newAst = parser.current.astify(val, opt);
      ast.current = newAst;
      console.log('AST:', newAst);
    } catch (e) {
    }
  };

  // 创建代码提示项
  const createCompletionItem = (monaco, range, item, kind) => {
    const base = {
      range: range,
      kind: kind,
      insertText: item.name || item,
      label: item.name || item,
    };


    switch (kind) {
      case monaco.languages.CompletionItemKind.Class: // 表
        return {
          ...base,
          detail: `Table: ${item.name}`,
          sortText: '0001',
          documentation: {
            value: [
              `**Description**: ${item.comment}`,
              '```sql',
              item.ddl,
              '```'
            ].join('\n')
          }
        };

      case monaco.languages.CompletionItemKind.Field: // 列
        return {
          ...base,
          label: item.name,
          kind: monaco.languages.CompletionItemKind.Field,
          insertText: item.name,
          range: range,
          detail: `Column: ${item.dataType}`,
          sortText: '0002',
          documentation: {
            value: [
              `**Comment**: ${item.comment}\n`,
              `**Table**: ${item.tableName}\n`,
              `**Type**: ${item.dataType}\n`,
              `**Nullable**: ${item.nullable ? 'true' : 'false'}\n`,
              `**Default**: ${item.defaultValue || 'null'}\n`
            ].join('\n')
          },
        };

      case monaco.languages.CompletionItemKind.Function: // 函数
        return {
          ...base,
          detail: `Function: ${item.name}`,
          documentation: {
            value: [
              `**Description**: ${item.doc}\n`,
              `**Support**: ${item.support.join(', ')}`
            ].join('\n')
          },
          sortText: '9999',
        };

      default:
        return base;
    }
  };

  // 获取已使用的表和别名的映射关系
  const getUsedTablesAndAliases = () => {
    if (!ast.current?.from) return new Map();

    return new Map(ast.current.from.map(item => [
      item.as || item.table,
      item.table
    ]));
  };

  // 获取当前位置所在的SQL子句
  const getCurrentClause = (textUntilPosition) => {
    const upperText = textUntilPosition.toUpperCase();
    if (!upperText.includes('SELECT')) return '';

    if (!upperText.includes('FROM')) return 'SELECT';
    if (!upperText.includes('WHERE') && !upperText.includes('GROUP BY') &&
        !upperText.includes('HAVING') && !upperText.includes('ORDER BY')) {
      if (upperText.includes('JOIN')) {
        const lastJoinIndex = upperText.lastIndexOf('JOIN');
        const lastOnIndex = upperText.lastIndexOf('ON');
        if (lastOnIndex > lastJoinIndex) return 'ON';
        return 'JOIN';
      }
      return 'FROM';
    }

    if (upperText.includes('WHERE')) {
      const whereIndex = upperText.lastIndexOf('WHERE');
      const groupByIndex = upperText.lastIndexOf('GROUP BY');
      const havingIndex = upperText.lastIndexOf('HAVING');
      const orderByIndex = upperText.lastIndexOf('ORDER BY');

      if (groupByIndex === -1 || whereIndex > groupByIndex) {
        if (havingIndex === -1 || whereIndex > havingIndex) {
          if (orderByIndex === -1 || whereIndex > orderByIndex) {
            return 'WHERE';
          }
        }
      }
    }

    if (upperText.includes('GROUP BY')) {
      const groupByIndex = upperText.lastIndexOf('GROUP BY');
      const havingIndex = upperText.lastIndexOf('HAVING');
      const orderByIndex = upperText.lastIndexOf('ORDER BY');

      if (havingIndex === -1 || groupByIndex > havingIndex) {
        if (orderByIndex === -1 || groupByIndex > orderByIndex) {
          return 'GROUP BY';
        }
      }
    }

    if (upperText.includes('HAVING')) {
      const havingIndex = upperText.lastIndexOf('HAVING');
      const orderByIndex = upperText.lastIndexOf('ORDER BY');

      if (orderByIndex === -1 || havingIndex > orderByIndex) {
        return 'HAVING';
      }
    }

    if (upperText.includes('ORDER BY')) {
      return 'ORDER BY';
    }

    return '';
  };

  const editorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.languages.registerCompletionItemProvider('sql', {
      triggerCharacters: ['.', ' '],
      provideCompletionItems: (model, position) => {
        // 状态变量，用于判断是否命各种判断条件
        let canProvide = false;

        const word = model.getWordUntilPosition(position);
        const lineContent = model.getLineContent(position.lineNumber);
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        // 判断当前光标位置是否在注释中，如果是则不进行代码提示
        if (lineContent.trim().startsWith('--')) {
          canProvide = true;
          return {suggestions: []};
        }

        // 判断当前光标位置是否在字符串中，如果是则不进行代码提示，也就是光标前有奇数个单引号或者双引号
        const matches = textUntilPosition.match(/['"]/g);
        if (matches && matches.length % 2 !== 0) {
          canProvide = true;
          return {suggestions: []};
        }

        const currentClause = getCurrentClause(textUntilPosition);
        const usedTablesAndAliases = getUsedTablesAndAliases();
        let suggestions = [];

        // 处理表字段提示
        if (textUntilPosition.endsWith('.')) {
          canProvide = true;
          const words = textUntilPosition.split(/[^a-zA-Z0-9_]/);
          const alias = words[words.length - 2];
          const tableName = getTableFromAlias(alias) || alias;
          const columns = getColumns(tableName);

          console.log('Columns:', columns);
          console.log('alias = ', alias)
          console.log('ast = ', ast)
          return {
            suggestions: columns.map(column => {
                  const columnItem = {...column, tableName};
                  return createCompletionItem(monaco, range, columnItem, monaco.languages.CompletionItemKind.Field)
                }
            )
          };
        }


        // 根据不同子句提供不同的提示
        switch (currentClause) {
          case 'SELECT':
            canProvide = true;
            for (const [alias, tableName] of usedTablesAndAliases) {
              // 添加表别名
              suggestions.push({
                label: alias,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: alias,
                range: range,
                sortText: '0001'
              });

              // 添加表字段
              const columns = getColumns(tableName);
              console.log('Columns:', columns);
              suggestions.push(
                  ...columns.map(column => ({
                    label: `${alias}.${column.name}`,
                    kind: monaco.languages.CompletionItemKind.Field,
                    insertText: `${alias}.${column.name}`,
                    range: range,
                    detail: `Column: ${column.dataType}`,
                    documentation: {
                      value: [
                        `**Comment**: ${column.comment}\n`,
                        `**Table**: ${column.tableName}\n`,
                        `**Type**: ${column.dataType}\n`,
                        `**Nullable**: ${column.nullable ? 'true' : 'false'}\n`,
                        `**Default**: ${column.defaultValue || 'null'}\n`
                      ].join('\n')
                    },
                    sortText: '0002'
                  }))
              );
            }
            // 添加所有字段
            for (const table of getTables()) {
              suggestions.push(
                  ...table.columns.map(column => {
                        const columnItem = {...column, tableName: table.name};
                        return createCompletionItem(monaco, range, columnItem, monaco.languages.CompletionItemKind.Field)
                      }
                  )
              );
            }
            // 添加聚合函数
            suggestions.push(
                ...functions.map(func =>
                    createCompletionItem(monaco, range, func, monaco.languages.CompletionItemKind.Function)
                )
            );
            // 添加 FROM
            suggestions.push({
              label: 'FROM',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'FROM',
              range: range,
              sortText: '0000'
            });
            break;

          case 'FROM':
          case 'JOIN':
          case 'LEFT JOIN':
          case 'RIGHT JOIN':
          case 'INNER JOIN':
            canProvide = true;
            suggestions.push(
                ...getTables().map(table =>
                    createCompletionItem(monaco, range, table, monaco.languages.CompletionItemKind.Class)
                )
            );
            // 如果不是 FROM 子句，添加 on
            if (currentClause !== 'FROM') {
              suggestions.push({
                label: 'ON',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'ON',
                range: range,
              });
            }
            suggestions.push(
                ...['WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ORDER BY'].map(join => ({
                  label: join,
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: join,
                  range: range,
                }))
            );
            break;

          case 'ON':
          case 'WHERE':
          case 'GROUP BY':
          case 'HAVING':
          case 'ORDER BY':
            canProvide = true;
            for (const [alias, tableName] of usedTablesAndAliases) {
              // 添加表名和别名
              suggestions.push({
                label: tableName,
                kind: monaco.languages.CompletionItemKind.Class,
                insertText: tableName,
                range: range,
                sortText: '0001'
              });

              if (alias !== tableName) {
                suggestions.push({
                  label: alias,
                  kind: monaco.languages.CompletionItemKind.Variable,
                  insertText: alias,
                  range: range,
                  sortText: '0001'
                });
              }

              // 添加字段
              const columns = getColumns(tableName);
              suggestions.push(
                  ...columns.map(column => ({
                        label: `${alias}.${column.name}`,
                        kind: monaco.languages.CompletionItemKind.Field,
                        insertText: `${alias}.${column.name}`,
                        range: range,
                        detail: `Column: ${column.dataType}`,
                        documentation: {
                          value: [
                            `**Comment**: ${column.comment}\n`,
                            `**Table**: ${column.tableName}\n`,
                            `**Type**: ${column.dataType}\n`,
                            `**Nullable**: ${column.nullable ? 'true' : 'false'}\n`,
                            `**Default**: ${column.defaultValue || 'null'}\n`
                          ].join('\n')
                        },
                        sortText: '0002'
                      }
                  ))
              );
            }
            // 如果是 ON 子句，添加 四种 JOIN、WHERE 、GROUP BY、ORDER BY
            if (currentClause === 'ON') {
              suggestions.push(
                  ...['JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'WHERE', 'GROUP BY', 'ORDER BY',
                    'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL'].map(join => ({
                    label: join,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: join,
                    range: range,
                  }))
              );
            }
            // 如果是 WHERE 子句，添加 AND、OR、NOT、IN、BETWEEN、LIKE、IS NULL、IS NOT NULL
            if (currentClause === 'WHERE') {
              suggestions.push(
                  ...['AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL', 'GROUP BY', 'ORDER BY']
                      .map(keyword => ({
                        label: keyword,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: keyword,
                        range: range,
                      }))
              );
            }
            // 如果是 GROUP BY 子句，添加 HAVING
            if (currentClause === 'GROUP BY') {
              suggestions.push({
                label: 'HAVING',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'HAVING',
                range: range,
              });
              // order by
              suggestions.push({
                label: 'ORDER BY',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'ORDER BY',
                range: range,
              });
            }
            // 如果是 having 子句，添加聚合函数\AND\OR\NOT\IN\BETWEEN\LIKE\IS NULL\IS NOT NULL
            if (currentClause === 'HAVING') {
              suggestions.push(
                  ...functions.map(func =>
                      createCompletionItem(monaco, range, func, monaco.languages.CompletionItemKind.Function)
                  )
              );
              suggestions.push(
                  ...['AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL', 'ORDER BY']
                      .map(keyword => ({
                        label: keyword,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: keyword,
                        range: range,
                      }))
              );
            }
            // 如果是 ORDER BY 子句，添加 ASC、DESC
            if (currentClause === 'ORDER BY') {
              suggestions.push(
                  ...['ASC', 'DESC'].map(order => ({
                    label: order,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: order,
                    range: range,
                  }))
              );
            }
            break;
        }

        // 提供 SQL 关键字提示
        if (!canProvide) {
          // 判断是否是 insert
          if (textUntilPosition.toUpperCase().includes('INSERT INTO')) {
            // 判读是否有表名，如果有表名则提示字段，用正则匹配表名
            const matches = textUntilPosition.match(/INSERT INTO ([a-zA-Z0-9_]+)/i);
            if (matches && matches[1]) {
              const columns = getColumns(matches[1]);
              suggestions.push(
                  ...columns.map(column => {
                        const columnItem = {...column, tableName: matches[1]};
                        return createCompletionItem(monaco, range, columnItem, monaco.languages.CompletionItemKind.Field)
                      }
                  ));
            } else {
              // 提示表名，插入的内容为表名(字段1, 字段2, ...) VALUES ()
              suggestions.push(...(getTables().map(table => ({
                label: table.name,
                kind: monaco.languages.CompletionItemKind.Class,
                insertText: `${table.name}(${table.columns.map(col => col.name).join(', ')}) VALUES ()`,
                range: range,
                sortText: '0001'
              }))));
            }
            return {suggestions};
          }
          // 判断是否是 update
          if (textUntilPosition.toUpperCase().includes('UPDATE')) {
            // 判断是否有表名，如果有表名则提示字段，用正则匹配表名
            const matches = textUntilPosition.match(/UPDATE ([a-zA-Z0-9_]+)/i);
            if (matches && matches[1]) {
              const columns = getColumns(matches[1]);
              suggestions.push(
                  ...columns.map(column => {
                        const columnItem = {...column, tableName: matches[1]};
                        return createCompletionItem(monaco, range, columnItem, monaco.languages.CompletionItemKind.Field)
                      }
                  ));
              // 如果不存在 SET 关键字，则提示 SET
              if (!textUntilPosition.toUpperCase().includes('SET')) {
                suggestions.push({
                  label: 'SET',
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: 'SET',
                  range: range,
                  sortText: '0000'
                });
              }
              // 如果不存在 WHERE 关键字，则提示 WHERE
              if (!textUntilPosition.toUpperCase().includes('WHERE')) {
                suggestions.push({
                  label: 'WHERE',
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: 'WHERE',
                  range: range,
                  sortText: '0003'
                });
              }
            } else {
              // 提示表名
              suggestions.push(...(getTables().map(table => ({
                label: table.name,
                kind: monaco.languages.CompletionItemKind.Class,
                insertText: table.name,
                range: range,
                sortText: '0001'
              }))));

            }
            // 如果当前光标位于 where 后，则提示 AND、OR、NOT、IN、BETWEEN、LIKE、IS NULL、IS NOT NULL
            if (textUntilPosition.toUpperCase().includes('WHERE')) {
              suggestions.push(
                  ...['AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL']
                      .map(keyword => ({
                        label: keyword,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: keyword,
                        range: range,
                      }))
              );
            }
            return {suggestions};
          }
          // 判断是否是 delete
          if (textUntilPosition.toUpperCase().includes('DELETE')) {
            // 判断是否有表名，如果有表名则提示字段，用正则匹配表名
            const matches = textUntilPosition.match(/DELETE FROM ([a-zA-Z0-9_]+)/i);
            if (matches && matches[1]) {
              const columns = getColumns(matches[1]);
              suggestions.push(
                  ...columns.map(column => {
                        const columnItem = {...column, tableName: matches[1]};
                        return createCompletionItem(monaco, range, columnItem, monaco.languages.CompletionItemKind.Field)
                      }
                  ));
              // 如果不存在 WHERE 关键字，则提示 WHERE
              if (!textUntilPosition.toUpperCase().includes('WHERE')) {
                suggestions.push({
                  label: 'WHERE',
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: 'WHERE',
                  range: range,
                  sortText: '0003'
                });
              }
            } else {
              // 判断是否有 FROM 关键字，如果没有则提示 FROM
              if (!textUntilPosition.toUpperCase().includes('FROM')) {
                suggestions.push({
                  label: 'FROM',
                  kind: monaco.languages.CompletionItemKind.Keyword,
                  insertText: 'FROM',
                  range: range,
                  sortText: '0000'
                });
              }
              // 提示表名
              suggestions.push(...(getTables().map(table => ({
                label: table.name,
                kind: monaco.languages.CompletionItemKind.Class,
                insertText: table.name,
                range: range,
                sortText: '0001'
              }))));
            }
            return {suggestions};
          }
          suggestions.push(
              ...SQLKeywords.map(keyword => ({
                label: keyword,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: keyword,
                range: range,
              }))
          );
          // 提供表名提示
          suggestions.push(
              ...getTables().map(table =>
                  createCompletionItem(monaco, range, table, monaco.languages.CompletionItemKind.Class)
              )
          );
          // 提供聚合函数提示
          suggestions.push(
              ...functions.map(func =>
                  createCompletionItem(monaco, range, func, monaco.languages.CompletionItemKind.Function)
              )
          );
          // 提供字段提示，格式 table.column，无需别名
          for (const table of getTables()) {
            suggestions.push(
                ...table.columns.map(column => {
                      const columnItem = {...column, tableName: table.name};
                      return createCompletionItem(monaco, range, columnItem, monaco.languages.CompletionItemKind.Field)
                    }
                )
            );
          }
        }
        return {suggestions};
      }
    });
  };

  return (
      <>
        <p>{sql}</p>
        <p>{JSON.stringify(ast)}</p>
        <Editor
            onMount={editorDidMount}
            onChange={handleEditorChange}
            options={{
              minimap: {enabled: false},
              suggest: {
                snippetsPreventQuickSuggestions: false,
                showKeywords: true,
                showSnippets: true
              }
            }}
            height="90vh"
            theme={isLight ? 'light' : 'vs-dark'}
            defaultLanguage="sql"
        />
      </>
  );
}

export default CodeEditor;
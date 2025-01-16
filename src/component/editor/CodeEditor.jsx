import React, {useRef, useState} from 'react';
import {Editor} from "@monaco-editor/react";
import {Parser} from "node-sql-parser";
import {databases} from "./support/schema.js";

function CodeEditor() {
  const [sql, setSql] = useState('');
  const parser = useRef(new Parser());
  const editorRef = useRef(null);
  const [isLight, setIsLight] = useState(true);
  const ast = useRef(null);

  // SQL 关键字列表
  const SQLKeywords = [
    "SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE", "DROP", "ALTER", "TABLE", "DATABASE", "INDEX",
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
        return table.columns;
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
          detail: `Column: ${item.dataType}${item.nullable ? ' (nullable)' : ''}`,
          documentation: {
            value: [
              `**Description**: ${item.comment}`,
              `**Default**: ${item.defaultValue || 'None'}`,
              `**Order**: ${item.order}`
            ].join('\n')
          }
        };

      case monaco.languages.CompletionItemKind.Function: // 函数
        return {
          ...base,
          detail: `Function: ${item.name}`,
          documentation: {
            value: [
              `**Return Type**: ${item.returnType}`,
              '```sql',
              item.ddl,
              '```'
            ].join('\n')
          }
        };

      default:
        return base;
    }
  };

  const editorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.languages.registerCompletionItemProvider('sql', {
      triggerCharacters: ['.', ' '],
      provideCompletionItems: (model, position) => {
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
          return {suggestions: []};
        }

        // 判断当前光标位置是否在字符串中，如果是则不进行代码提示，也就是光标前有奇数个单引号或者双引号
        const matches = textUntilPosition.match(/['"]/g);
        if (matches && matches.length % 2 !== 0) {
          return {suggestions: []};
        }


        // 处理表字段提示
        if (textUntilPosition.endsWith('.')) {
          const words = textUntilPosition.split(/[^a-zA-Z0-9_]/);
          const alias = words[words.length - 2];
          const tableName = getTableFromAlias(alias) || alias;
          const columns = getColumns(tableName);

          console.log('Columns:', columns);
          console.log('alias = ', alias)
          console.log('ast = ', ast)
          return {
            suggestions: columns.map(column =>
                createCompletionItem(monaco, range, column, monaco.languages.CompletionItemKind.Field)
            )
          };
        }

        let suggestions = [];

        // SQL 类型相关提示
        if (ast) {
          switch (ast.current?.type) {
            case 'select':
              suggestions.push(
                  ...['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT']
                      .map(keyword => ({
                        label: keyword,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: keyword,
                        range: range
                      }))
              );
              break;
            case 'update':
              suggestions.push(
                  ...['UPDATE', 'SET', 'WHERE']
                      .map(keyword => ({
                        label: keyword,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: keyword,
                        range: range
                      }))
              );
              break;
            case 'insert':
              suggestions.push(
                  ...['INSERT', 'INTO', 'VALUES']
                      .map(keyword => ({
                        label: keyword,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: keyword,
                        range: range
                      }))
              );
              break;
            case 'delete':
              suggestions.push(
                  ...['DELETE', 'FROM', 'WHERE']
                      .map(keyword => ({
                        label: keyword,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: keyword,
                        range: range
                      }))
              );
              break;
              // 可以添加其他类型的处理...
          }
        }

        // 默认情况下所有的列名都会被提示
        suggestions.push(
            ...getColumns().map(column =>
                createCompletionItem(monaco, range, column, monaco.languages.CompletionItemKind.Field)
            )
        );
        // 所有的 SQL 关键字都会被提示
        suggestions.push(
            ...SQLKeywords.map(keyword => ({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: keyword,
              range: range
            }))
        );
        // 输出去重复元素后的keyword

        // 添加表提示
        suggestions.push(
            ...getTables().map(table =>
                createCompletionItem(monaco, range, table, monaco.languages.CompletionItemKind.Class)
            )
        );

        // 添加数据库函数提示
        databases.forEach(db => {
          if (db.functions) {
            suggestions.push(
                ...db.functions.map(func =>
                    createCompletionItem(monaco, range, func, monaco.languages.CompletionItemKind.Function)
                )
            );
          }
        });

        // 添加代码片段提示
        suggestions.push({
          label: 'sel',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'SELECT ${1:*} FROM ${2:table_name}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Select all columns from a table',
          range: range
        });

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
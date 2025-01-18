import React, {useRef, useState} from 'react';
import {Editor} from "@monaco-editor/react";
import {Parser} from "node-sql-parser";
import {databases} from "./support/schema.js";
import {functions} from "./support/aggregate-functions.js";
import {SQLKeywords} from "./support/sql-keywords.js";

function CodeEditor() {
  const [sql, setSql] = useState('');
  const parser = useRef(new Parser());
  const editorRef = useRef(null);
  const [isLight, setIsLight] = useState(true);
  const ast = useRef(null);

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
        (item.as === alias) || (!item.as && item.table === alias)
    );
    return tableRef ? tableRef.table : null;
  };

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

  const handleEditorChange = (val) => {
    try {
      setSql(val);
      const opt = {database: 'MySQL'};
      let preSql = val;
      if (val.trim().match(/(WHERE|LEFT JOIN|RIGHT JOIN|INNERR JOIN|JOIN|GROUP BY|ORDER BY)\s*$/i)) {
        preSql = val.trim().replace(/(WHERE|JOIN|GROUP BY|ORDER BY)\s*$/i, '');
      }
      ast.current = parser.current.astify(preSql, opt);
      console.log('AST:', ast.current);
    } catch (e) {
    }
  };

  // 创建基础提示项
  const createBaseSuggestion = (monaco, range, item, kind) => ({
    range,
    kind,
    insertText: item.name || item,
    label: item.name || item,
  });

  // 创建表提示项
  const createTableSuggestion = (monaco, range, item) => ({
    ...createBaseSuggestion(monaco, range, item, monaco.languages.CompletionItemKind.Class),
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
  });

  // 创建字段提示项
  const createColumnSuggestion = (monaco, range, item) => ({
    ...createBaseSuggestion(monaco, range, item, monaco.languages.CompletionItemKind.Field),
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
    }
  });

  // 创建函数提示项
  const createFunctionSuggestion = (monaco, range, item) => ({
    ...createBaseSuggestion(monaco, range, item, monaco.languages.CompletionItemKind.Function),
    detail: `Function: ${item.name}`,
    documentation: {
      value: [
        `**Description**: ${item.doc}\n`,
        `**Support**: ${item.support.join(', ')}`
      ].join('\n')
    },
    sortText: '9999'
  });

  // 创建关键字提示项
  const createKeywordSuggestion = (monaco, range, keyword) => ({
    label: keyword,
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: keyword,
    range
  });

  // 获取字段提示
  const getColumnSuggestions = (monaco, range, tableName, alias = null) => {
    const columns = getColumns(tableName);
    return columns.map(column => {
      const suggestion = createColumnSuggestion(monaco, range, {...column, tableName});
      if (alias) {
        suggestion.label = `${alias}.${column.name}`;
        suggestion.insertText = `${alias}.${column.name}`;
      }
      return suggestion;
    });
  };

  // 处理表字段提示
  const handleTableColumnSuggestions = (monaco, range, words) => {
    const alias = words[words.length - 2];
    const tableName = getTableFromAlias(alias) || alias;
    return getColumns(tableName).map(column =>
        createColumnSuggestion(monaco, range, {...column, tableName})
    );
  };

  // 处理SELECT子句提示
  const handleSelectClauseSuggestions = (monaco, range, usedTablesAndAliases) => {
    let suggestions = [];

    // 添加表别名和字段
    for (const [alias, tableName] of usedTablesAndAliases) {
      suggestions.push({
        label: alias,
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: alias,
        range,
        sortText: '0001'
      });
      suggestions.push(...getColumnSuggestions(monaco, range, tableName, alias));
    }

    // 添加所有字段
    getTables().forEach(table => {
      suggestions.push(...getColumnSuggestions(monaco, range, table.name));
    });

    // 添加函数和FROM关键字
    suggestions.push(
        ...functions.map(func => createFunctionSuggestion(monaco, range, func)),
        createKeywordSuggestion(monaco, range, 'FROM')
    );

    return suggestions;
  };

  // 处理FROM/JOIN子句提示
  const handleFromJoinClauseSuggestions = (monaco, range, currentClause) => {
    const suggestions = getTables().map(table => createTableSuggestion(monaco, range, table));

    if (currentClause !== 'FROM') {
      suggestions.push(createKeywordSuggestion(monaco, range, 'ON'));
    }

    const keywords = ['WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'GROUP BY', 'ORDER BY'];
    suggestions.push(...keywords.map(keyword => createKeywordSuggestion(monaco, range, keyword)));

    return suggestions;
  };

  // 处理条件子句提示
  const handleConditionClauseSuggestions = (monaco, range, currentClause, usedTablesAndAliases) => {
    let suggestions = [];

    // 添加表名、别名和字段提示
    for (const [alias, tableName] of usedTablesAndAliases) {
      suggestions.push(
          createTableSuggestion(monaco, range, {name: tableName}),
          ...(alias !== tableName ? [{
            label: alias,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: alias,
            range,
            sortText: '0001'
          }] : []),
          ...getColumnSuggestions(monaco, range, tableName, alias)
      );
    }

    // 根据不同子句添加特定关键字
    const clauseKeywords = {
      'ON': ['JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'WHERE', 'GROUP BY', 'ORDER BY',
        'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL'],
      'WHERE': ['AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL', 'GROUP BY', 'ORDER BY'],
      'GROUP BY': ['HAVING', 'ORDER BY'],
      'HAVING': ['AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL', 'ORDER BY'],
      'ORDER BY': ['ASC', 'DESC']
    };

    if (clauseKeywords[currentClause]) {
      suggestions.push(...clauseKeywords[currentClause].map(keyword =>
          createKeywordSuggestion(monaco, range, keyword)
      ));
    }

    // 为HAVING子句添加聚合函数
    if (currentClause === 'HAVING') {
      suggestions.push(...functions.map(func => createFunctionSuggestion(monaco, range, func)));
    }

    return suggestions;
  };

  // 获取 insert into 的代码提示
  const getInsertIntoSuggestions = (textUntilPosition, monaco, range) => {
    const suggestions = [];
    // 判读是否有表名，如果有表名则提示字段，用正则匹配表名
    const matches = textUntilPosition.match(/INSERT INTO ([a-zA-Z0-9_]+)/i);
    if (matches && matches[1]) {
      const columns = getColumns(matches[1]);
      suggestions.push(
          ...columns.map(column => {
                const columnItem = {...column, tableName: matches[1]};
                return createColumnSuggestion(monaco, range, columnItem);
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

  // 获取 update 的代码提示
  const getUpdateSuggestions = (textUntilPosition, monaco, range) => {
    const suggestions = [];
    // 判断是否有表名，如果有表名则提示字段，用正则匹配表名
    const matches = textUntilPosition.match(/UPDATE ([a-zA-Z0-9_]+)/i);
    if (matches && matches[1]) {
      const columns = getColumns(matches[1]);
      suggestions.push(
          ...columns.map(column => {
                const columnItem = {...column, tableName: matches[1]};
                return createColumnSuggestion(monaco, range, columnItem);
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

  // 获取 delete 的代码提示
  const getDeleteSuggestions = (textUntilPosition, monaco, range) => {
    const suggestions = [];
    // 判断是否有表名，如果有表名则提示字段，用正则匹配表名
    const matches = textUntilPosition.match(/DELETE FROM ([a-zA-Z0-9_]+)/i);
    if (matches && matches[1]) {
      const columns = getColumns(matches[1]);
      suggestions.push(
          ...columns.map(column => {
                const columnItem = {...column, tableName: matches[1]};
                return createColumnSuggestion(monaco, range, columnItem);
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

  const editorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.languages.registerCompletionItemProvider('sql', {
      triggerCharacters: ['.', ' '],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const lineContent = model.getLineContent(position.lineNumber);
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        // 检查是否在注释或字符串中
        if (lineContent.trim().startsWith('--') ||
            (textUntilPosition.match(/['"]/g)?.length ?? 0) % 2 !== 0) {
          return {suggestions: []};
        }

        const currentClause = getCurrentClause(textUntilPosition);
        const usedTablesAndAliases = getUsedTablesAndAliases();

        // 处理表字段提示
        if (textUntilPosition.endsWith('.')) {
          return {
            suggestions: handleTableColumnSuggestions(monaco, range, textUntilPosition.split(/[^a-zA-Z0-9_]/))
          };
        }

        // 根据不同子句提供提示
        switch (currentClause) {
          case 'SELECT':
            return {suggestions: handleSelectClauseSuggestions(monaco, range, usedTablesAndAliases)};
          case 'FROM':
          case 'JOIN':
          case 'LEFT JOIN':
          case 'RIGHT JOIN':
          case 'INNER JOIN':
            return {suggestions: handleFromJoinClauseSuggestions(monaco, range, currentClause)};
          case 'ON':
          case 'WHERE':
          case 'GROUP BY':
          case 'HAVING':
          case 'ORDER BY':
            return {suggestions: handleConditionClauseSuggestions(monaco, range, currentClause, usedTablesAndAliases)};
          default:
            if (textUntilPosition.toUpperCase().includes('INSERT INTO')) {
              return getInsertIntoSuggestions(textUntilPosition, monaco, range);
            } else if (textUntilPosition.toUpperCase().includes('UPDATE')) {
              return getUpdateSuggestions(textUntilPosition, monaco, range);
            } else if (textUntilPosition.toUpperCase().includes('DELETE')) {
              return getDeleteSuggestions(textUntilPosition, monaco, range);
            }

            // 提供默认提示
            return {
              suggestions: [
                ...SQLKeywords.map(keyword => createKeywordSuggestion(monaco, range, keyword)),
                ...getTables().map(table => createTableSuggestion(monaco, range, table)),
                ...functions.map(func => createFunctionSuggestion(monaco, range, func)),
                ...getTables().flatMap(table => getColumnSuggestions(monaco, range, table.name))
              ]
            };
        }
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
import React, {useRef, useState} from 'react';
import {Editor} from "@monaco-editor/react";
import {Parser} from "node-sql-parser";
import {databases} from "./support/schema.js";
import {functions} from "./support/aggregate-functions.js";
import {SQLKeywords} from "./support/sql-keywords.js";

function CodeEditor() {
  const [sql, setSql] = useState('');
  const sqlRef = useRef('');
  const parser = useRef(new Parser());
  const editorRef = useRef(null);
  const [isLight, setIsLight] = useState(true);
  const ast = useRef(null);
  const decorationsCollection = useRef(null);

  // 添加装饰器以显示可点击的表名
  const decorations = useRef([]);


  // Function to identify SQL statement starts
  const findSQLStatements = (model) => {
    const lineCount = model.getLineCount();
    const statements = new Set();
    let inCTE = false;
    let cteStartLine = -1;
    let parenCount = 0;

    for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
      const lineContent = model.getLineContent(lineNumber).trim();
      const upperLine = lineContent.toUpperCase();

      // 跳过空行和注释
      if (!lineContent || lineContent.startsWith('--') || lineContent.startsWith('/*')) {
        continue;
      }

      // 计数括号以跟踪 CTE 和子查询结构
      for (const char of lineContent) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
      }

      // 检查 CTE 开始
      if (upperLine.startsWith('WITH ') && parenCount === 0) {
        inCTE = true;
        cteStartLine = lineNumber;
        statements.add(lineNumber); // 添加 WITH 开始的行
        continue;
      }

      // 检查独立的 SQL 语句（非 CTE 部分）
      if (!inCTE && parenCount === 0 && (
          upperLine.startsWith('SELECT') ||
          upperLine.startsWith('INSERT') ||
          upperLine.startsWith('UPDATE') ||
          upperLine.startsWith('DELETE') ||
          upperLine.startsWith('CREATE') ||
          upperLine.startsWith('ALTER') ||
          upperLine.startsWith('DROP')
      )) {
        statements.add(lineNumber);
      }

      // 语句结束时重置 CTE 标志
      if (lineContent.endsWith(';')) {
        inCTE = false;
        cteStartLine = -1;
        parenCount = 0;
      }
    }

    return Array.from(statements);
  };

  // 通过行号查找完整的 SQL 语句
  const findSQLStatementsByLineNumbers = (editor, lineNumber) => {
    const model = editor.getModel();
    if (!model) return;

    let startLine = lineNumber;
    let endLine = lineNumber;
    const lineCount = model.getLineCount();
    let parenCount = 0;

    // 向上搜索 CTE 开始位置
    for (let i = lineNumber; i >= 1; i--) {
      const lineContent = model.getLineContent(i).trim().toUpperCase();
      // 如果不是注释
      if (!lineContent.startsWith('--') && !lineContent.startsWith('/*') && !lineContent.startsWith('#') && lineContent.trim().endsWith(';')) {
        break;
      }
      if (lineContent.startsWith('WITH ')) {
        startLine = i;
        break;
      }
    }

    // 向下搜索语句结束位置
    for (let i = lineNumber; i <= lineCount; i++) {
      const lineContent = model.getLineContent(i);

      // 计数括号
      for (const char of lineContent) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
      }

      // 检查语句结束
      if (lineContent.includes(';') && parenCount === 0) {
        endLine = i;
        break;
      }
    }

    // 获取完整的 SQL 语句
    return model.getValueInRange({
      startLineNumber: startLine,
      startColumn: 1,
      endLineNumber: endLine,
      endColumn: model.getLineMaxColumn(endLine)
    });
  }

  const handleRunButtonClick = (editor, lineNumber) => {
    const sql = findSQLStatementsByLineNumbers(editor, lineNumber);
    console.log('Running SQL:', sql);
    // 添加你的 SQL 执行逻辑
  };


  // Function to update run button decorations
  // Function to update run button decorations
  const updateRunButtons = (editor, monaco) => {
    if (!editor || !monaco) return;

    const model = editor.getModel();
    if (!model) return;

    // Clear existing decorations
    if (decorationsCollection.current) {
      decorationsCollection.current.clear();
    }

    const statementLines = findSQLStatements(model);

    // Create new decorations collection if not exists
    if (!decorationsCollection.current) {
      decorationsCollection.current = editor.createDecorationsCollection();
    }

    // Add new decorations
    const newDecorations = statementLines.map(line => ({
      range: {
        startLineNumber: line,
        startColumn: 1,
        endLineNumber: line,
        endColumn: 1
      },
      options: {
        isWholeLine: false,
        glyphMarginClassName: 'sql-run-button',
        glyphMarginHoverMessage: {value: 'Run this SQL statement'}
      }
    }));

    decorationsCollection.current.set(newDecorations);
  };


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

  // 获取当前位置已使用的表名和别名
  const getUsedTablesAndAliases = () => {
    if (ast.current && ast.current.length) {
      return new Map(ast.current[0].from.map(item => [
        item.as || item.table,
        item.table
      ]))
    }
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

  // 获取当前光标处的 SQL 开始行号
  const getSQLStartLine = (model, position) => {
    const lineNumbers = findSQLStatements(model)
    // lineNumbers 从大到小排序
    lineNumbers.sort((a, b) => b - a);
    // 找出小于等于当前行号第第一个
    return lineNumbers.find(line => line <= position.lineNumber);
  }

  const handleEditorChange = (val) => {
    try {
      setSql(val);

      const editor = editorRef.current;
      if (!editor) return;
      const position = editor.getPosition();
      const model = editor.getModel();
      if (!model) return;
      // 找出小于等于当前行号第第一个
      const lineNumber = getSQLStartLine(model, position);
      const statement = findSQLStatementsByLineNumbers(editor, lineNumber);

      console.log('Current SQL statement:', statement);

      sqlRef.current = statement;
      const opt = {database: 'MySQL'};
      let preSql = statement;
      if (statement.trim().match(/(WHERE|LEFT JOIN|RIGHT JOIN|INNERR JOIN|JOIN|GROUP BY|ORDER BY)\s*$/i)) {
        preSql = statement.trim().replace(/(WHERE|LEFT JOIN|RIGHT JOIN|INNERR JOIN|JOIN|GROUP BY|ORDER BY)\s*$/i, '');
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

  // 创建聚合函数提示项
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

// 创建DML语句的表提示
  const createDMLTableSuggestion = (monaco, range, table) => ({
    label: table.name,
    kind: monaco.languages.CompletionItemKind.Class,
    insertText: table.name,
    range,
    sortText: '0001'
  });

// 创建带完整列信息的INSERT语句表提示
  const createInsertTableSuggestion = (monaco, range, table) => ({
    ...createDMLTableSuggestion(monaco, range, table),
    insertText: `${table.name}(${table.columns.map(col => col.name).join(', ')}) VALUES ()`
  });

// 通用的WHERE子句关键字提示
  const getWhereKeywords = (monaco, range) => {
    const keywords = ['AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL'];
    return keywords.map(keyword => createKeywordSuggestion(monaco, range, keyword));
  };

// 提取表名的工具函数
  const extractTableName = (text, pattern) => {
    const matches = text.match(pattern);
    return matches ? matches[1] : null;
  };

// DML语句模式匹配
  const DML_PATTERNS = {
    INSERT: /INSERT INTO ([a-zA-Z0-9_]+)/i,
    UPDATE: /UPDATE ([a-zA-Z0-9_]+)/i,
    DELETE: /DELETE FROM ([a-zA-Z0-9_]+)/i
  };

// 获取 INSERT INTO 的代码提示
  const getInsertIntoSuggestions = (textUntilPosition, monaco, range) => {
    const tableName = extractTableName(textUntilPosition, DML_PATTERNS.INSERT);

    if (tableName) {
      // 有表名时提示字段
      return {
        suggestions: getColumns(tableName).map(column =>
            createColumnSuggestion(monaco, range, {...column, tableName})
        )
      };
    }

    // 无表名时提示完整INSERT语句结构
    return {
      suggestions: getTables().map(table => createInsertTableSuggestion(monaco, range, table))
    };
  };

// 获取 UPDATE 的代码提示
  const getUpdateSuggestions = (textUntilPosition, monaco, range) => {
    const tableName = extractTableName(textUntilPosition, DML_PATTERNS.UPDATE);
    const suggestions = [];

    if (tableName) {
      // 有表名时的提示
      suggestions.push(
          ...getColumns(tableName).map(column =>
              createColumnSuggestion(monaco, range, {...column, tableName})
          )
      );

      // 添加SET和WHERE关键字提示
      const uppercaseText = textUntilPosition.toUpperCase();
      if (!uppercaseText.includes('SET')) {
        suggestions.push(createKeywordSuggestion(monaco, range, 'SET'));
      }
      if (!uppercaseText.includes('WHERE')) {
        suggestions.push(createKeywordSuggestion(monaco, range, 'WHERE'));
      }
    } else {
      // 无表名时提示表
      suggestions.push(...getTables().map(table => createDMLTableSuggestion(monaco, range, table)));
    }

    // WHERE子句的条件关键字提示
    if (textUntilPosition.toUpperCase().includes('WHERE')) {
      suggestions.push(...getWhereKeywords(monaco, range));
    }

    return {suggestions};
  };

// 获取 DELETE 的代码提示
  const getDeleteSuggestions = (textUntilPosition, monaco, range) => {
    const tableName = extractTableName(textUntilPosition, DML_PATTERNS.DELETE);
    const suggestions = [];

    if (tableName) {
      // 有表名时的提示
      suggestions.push(
          ...getColumns(tableName).map(column =>
              createColumnSuggestion(monaco, range, {...column, tableName})
          )
      );

      // 添加WHERE关键字提示
      if (!textUntilPosition.toUpperCase().includes('WHERE')) {
        suggestions.push(createKeywordSuggestion(monaco, range, 'WHERE'));
      }
    } else {
      // 无表名时的提示
      const uppercaseText = textUntilPosition.toUpperCase();
      if (!uppercaseText.includes('FROM')) {
        suggestions.push(createKeywordSuggestion(monaco, range, 'FROM'));
      }
      suggestions.push(...getTables().map(table => createDMLTableSuggestion(monaco, range, table)));
    }

    return {suggestions};
  };

  const editorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Enable glyph margin
    editor.updateOptions({
      glyphMargin: true,
      lineNumbers: true,
    });

    // Initial update of run buttons
    updateRunButtons(editor, monaco);

    // Update run buttons when content changes
    editor.onDidChangeModelContent(() => {
      updateRunButtons(editor, monaco);
    });

    // Handle glyph margin clicks
    editor.onMouseDown((e) => {
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        handleRunButtonClick(editor, e.target.position.lineNumber);
      }
    });


    // 注册hover提供器
    monaco.languages.registerHoverProvider('sql', {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;

        const lineContent = model.getLineContent(position.lineNumber);
        const startLineNumber = getSQLStartLine(model, position);
        // textUntilPosition 为鼠标移动的位置之前的文本
        const textUntilPosition = model.getValueInRange({
          startLineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });
        console.log('textUntilPosition:', textUntilPosition);
        const currentClause = getCurrentClause(textUntilPosition);
        let statement = textUntilPosition
        // 鼠标停留的 textUntilPosition 位置不一定是一个完整的单词，可能是部分单词，也可能是部分字母，所以按照字母数字下划线为为整体进行切片，所以需要判断是否以 word.word 结尾，如果不是，那么需要按照split切片找到 textUntilPosition 的最后一个单词
        if (!lineContent.endsWith(word.word)) {
          const words = textUntilPosition.split(/[^a-zA-Z0-9_]/);
          // 取最后一个单词
          const w = words[words.length - 1];
          // statement 根据word.word补全
          const suffix = word.word.substring(w.length, word.word.length);
          statement = statement + suffix;
        }

        switch (currentClause) {
          case 'SELECT':
            // 检查当前单词是否是聚合函数
            const func = functions.find(f => f.name.toLowerCase() === word.word.toLowerCase());
            if (func) {
              return {
                contents: [
                  {value: `**Function:** ${func.name}`},
                  {value: `**Description:** ${func.doc}`},
                  {value: `**Support:** ${func.support.join(', ')}`}
                ]
              };
            }
            break;
        }

        // 检查当前单词是否是表名
        const table = getTables().find(t => t.name.toLowerCase() === word.word.toLowerCase());
        if (!table) return null;

        // 返回hover内容
        return {
          contents: [
            {value: `**Table:** ${table.name}`},
            {value: `**Description:** ${table.comment || 'No description available'}`},
            // 字段，以及字段的数据类型、是否允许为空、默认值，表格展示
            {value: `**Columns:** \n\n | Name | Type | Nullable | Default |\n | --- | --- | --- | --- |\n | ${table.columns.map(col => `${col.name} | ${col.dataType} | ${col.nullable ? 'true' : 'false'} | ${col.defaultValue || 'null'}`).join('\n | ')} |`},
            {value: '```sql\n' + table.ddl + '\n```'}
          ]
        };
      }
    });

    editor.onMouseDown((e) => {
      const isMac = navigator.userAgentData.platform.includes("mac");
      // 检查是否按下ctrl键，mac上是command键
      if (((isMac ? e.event.metaKey : e.event.ctrlKey)) && e.target.type === monaco.editor.MouseTargetType.CONTENT_TEXT) {
        const position = {
          lineNumber: e.target.position.lineNumber,
          column: e.target.position.column
        };

        const word = editor.getModel().getWordAtPosition(position);
        if (!word) return;

        // 检查是否点击的是表名
        const table = getTables().find(t => t.name.toLowerCase() === word.word.toLowerCase());
        if (table) {
          alert(`Clicked table: ${table.name}`);
        }
      }
    });


    // 更新装饰器的函数
    const updateDecorations = () => {
      const model = editor.getModel();
      if (!model) return;

      const tableNames = getTables().map(t => t.name.toLowerCase());
      const text = model.getValue();
      const newDecorations = [];

      // 为所有表名添加装饰器
      tableNames.forEach(tableName => {
        const matches = text.matchAll(new RegExp(`\\b${tableName}\\b`, 'gi'));
        for (const match of matches) {
          const startPos = model.getPositionAt(match.index);
          const endPos = model.getPositionAt(match.index + tableName.length);

          newDecorations.push({
            range: new monaco.Range(
                startPos.lineNumber,
                startPos.column,
                endPos.lineNumber,
                endPos.column
            ),
            options: {
              inlineClassName: 'clickableTable',
              hoverMessage: {value: '按下Ctrl(⌘)键点击表名即可查看信息'}
            }
          });
        }
      });

      decorations.current = editor.deltaDecorations(decorations.current, newDecorations);
    };

    // 监听编辑器内容变化，更新装饰器
    editor.onDidChangeModelContent(() => {
      updateDecorations();
    });

    // 初始化装饰器
    updateDecorations();

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
        const startLineNumber = getSQLStartLine(model, position);
        // 当前光标前的文本
        const textUntilPosition = model.getValueInRange({
          startLineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        console.log('provider = :', textUntilPosition);

        // 检查是否在注释或字符串中
        if (lineContent.trim().startsWith('--') ||
            (textUntilPosition.match(/['"]/g)?.length ?? 0) % 2 !== 0) {
          return {suggestions: []};
        }

        const currentClause = getCurrentClause(textUntilPosition);
        const usedTablesAndAliases = getUsedTablesAndAliases();

        console.log('currentClause:', currentClause);
        console.log('usedTablesAndAliases:', usedTablesAndAliases);

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
            // 判断是否是 DML 语句
            if (textUntilPosition.toUpperCase().includes('INSERT INTO')) {
              return getInsertIntoSuggestions(textUntilPosition, monaco, range);
            }
            if (textUntilPosition.toUpperCase().includes('UPDATE')) {
              return getUpdateSuggestions(textUntilPosition, monaco, range);
            }
            if (textUntilPosition.toUpperCase().includes('DELETE')) {
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
        <style>
          {`
            .sql-run-button {
            background-color: #4b4b4b;
            -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='currentColor' d='M4 2v12l8-6z'/%3E%3C/svg%3E") no-repeat 50% 50%;
            mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='currentColor' d='M4 2v12l8-6z'/%3E%3C/svg%3E") no-repeat 50% 50%;
            cursor: pointer;
            width: 16px;
            height: 16px;
            margin-left: 5px;
          }
          .clickableTable {
            cursor: pointer;
            color: rgb(${isLight ? '182, 38, 292' : '234, 51, 247'});      
          }
          .clickableTable:hover {
            opacity: 0.8;
            text-decoration: underline;
            color: rgb(${isLight ? '0, 0, 255' : '234, 51, 227'});
          }
        `}
        </style>
        <Editor
            onMount={editorDidMount}
            onChange={handleEditorChange}
            options={{
              minimap: {enabled: false},
              suggest: {
                snippetsPreventQuickSuggestions: false,
                showKeywords: true,
                showSnippets: true
              },
              glyphMargin: true,
              lineNumbers: true,
            }}
            height="90vh"
            theme={isLight ? 'light' : 'vs-dark'}
            defaultLanguage="sql"
        />
      </>
  );
}

export default CodeEditor;
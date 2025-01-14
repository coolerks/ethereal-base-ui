import React, { useRef, useState } from 'react';
import { Editor, useMonaco } from "@monaco-editor/react";
import { Parser } from "node-sql-parser";

function CodeEditor() {
  const [sql, setSql] = useState('');
  const parser = useRef(new Parser());
  const editorRef = useRef(null);
  const [isLight, setIsLight] = useState(true);
  const [ast, setAst] = useState(null);

  // 定义表结构
  const tableSchema = {
    user: [
      { name: 'id', type: 'BIGINT', detail: 'Primary Key, Auto Increment' },
      { name: 'username', type: 'VARCHAR(50)', detail: 'NOT NULL, UNIQUE' },
      { name: 'password', type: 'VARCHAR(255)', detail: 'NOT NULL' },
      { name: 'email', type: 'VARCHAR(100)', detail: 'NOT NULL, UNIQUE' },
      { name: 'phone', type: 'VARCHAR(20)', detail: 'Nullable' },
      { name: 'created_at', type: 'DATETIME', detail: 'NOT NULL, Default: CURRENT_TIMESTAMP' },
      { name: 'updated_at', type: 'DATETIME', detail: 'NOT NULL, Updates on change' },
      { name: 'status', type: 'TINYINT', detail: 'NOT NULL, Default: 1' },
      { name: 'role', type: 'VARCHAR(20)', detail: 'NOT NULL, Default: "user"' },
      { name: 'profile_picture', type: 'VARCHAR(255)', detail: 'Nullable' }
    ]
  };

  // SQL 关键字列表
  const SQLKeywords = [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE',
    'CREATE', 'DROP', 'ALTER', 'TABLE', 'DATABASE', 'INDEX',
    'GROUP BY', 'ORDER BY', 'HAVING', 'JOIN', 'LEFT JOIN',
    'RIGHT JOIN', 'INNER JOIN', 'LIMIT', 'OFFSET', 'UNION',
    'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS NULL',
    'IS NOT NULL'
  ];

  const handleEditorChange = (val) => {
    try {
      setSql(val);
      const opt = {
        database: 'MySQL'
      }
      const newAst = parser.current.astify(val, opt);
      console.log('AST:', newAst);
      setAst(newAst);
    } catch (e) {
      setAst(null);
    }
  }

  // 从 AST 中获取别名对应的表名
  const getTableFromAlias = (alias) => {
    if (!ast || !ast.from) return null;

    const tableRef = ast.from.find(item =>
        (item.as === alias) || // 检查别名
        (!item.as && item.table === alias) // 检查表名本身
    );

    return tableRef ? tableRef.table : null;
  };

  const editorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.languages.registerCompletionItemProvider('sql', {
      triggerCharacters: ['.', ' '],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const lineContent = model.getLineContent(position.lineNumber);
        console.log('Word:', word);
        console.log('Line:', lineContent);
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        console.log('Text:', textUntilPosition);

        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        // 获取输入的'.'字符之前的单词
        if (textUntilPosition.endsWith('.')) {
          // 获取别名，找到.之前的单词，例如SELECT t.
          // 将 textUntilPosition split 非字母、数字字符，然后找到最后一个单词
          const words = textUntilPosition.split(/[^a-zA-Z0-9_]/);
          const alias = words[words.length - 2];
          console.log('Table Alias:', alias);
          return {
            suggestions:[
              {
                label: '测试字段',
                kind: monaco.languages.CompletionItemKind.Field,
                insertText: '测试字段',
                range: range,
                detail: 'All columns',
                documentation: 'Select all columns from the table'
              }
            ]
          }
        }

        // 默认提示
        const suggestions = [
          // 关键字提示
          ...SQLKeywords.map(keyword => ({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range: range,
            detail: '关键字',
            documentation: `SQL 关键字: ${keyword}`
          })),

          // 表名提示
          {
            label: 'user',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'user',
            detail: 'User table',
            documentation: {
              value: 'Table containing user information'
            },
            range: range
          },

          // 代码片段
          {
            label: 'sel',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'SELECT ${1:*} FROM ${2:table_name}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Select all columns from a table',
            range: range
          }
        ];

        return { suggestions };
      }
    });
  };

  return (
      <>
        <p>{sql}</p>
        <Editor
            onMount={editorDidMount}
            style={{width: '100%', height: '100%'}}
            onChange={handleEditorChange}
            options={{
              minimap: {enabled: false},
              suggest: {
                snippetsPreventQuickSuggestions: false,
                showKeywords: true,
                showSnippets: true
              }
            }}
            height="90%"
            theme={isLight ? 'light' : 'vs-dark'}
            defaultLanguage="sql"
        />
      </>
  );
}

export default CodeEditor;
import React, {useRef, useState} from 'react'
import {Editor, useMonaco} from "@monaco-editor/react";
import { Parser } from "node-sql-parser";



function CodeEditor() {
  const [sql, setSql] = useState('');
  const parser = useRef(new Parser());
  const editorRef = useRef(null);
  const [isLight, setIsLight] = useState(true);
  const handleEditorChange = (val) => {
    try {
      setSql(val);
      const opt = {
        database: 'MySQL' // MySQL is the default database
      }
      const ast = parser.current.astify(val, opt);
      console.log(ast);
      console.log(parser.current.sqlify(ast));
    } catch (e) {
      console.error(e);
    }
  }

  const editorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    console.log('editorDidMount', editor);
  };
  return (
      <>
        <p>{sql}</p>
        <Editor
            onMount={editorDidMount}
            style={{width: '100%', height: '100%'}}
            onChange={handleEditorChange}
            options={{minimap: {enabled: false}}}
            height="90%"
            theme={isLight ? 'light' : 'vs-dark'}
            defaultLanguage="sql"/>
      </>
  )
}

export default CodeEditor;
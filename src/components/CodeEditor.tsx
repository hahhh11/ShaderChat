/*
 * @Author: 98Precent
 * @Date: 2025-12-08 16:31:00
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-12-08 16:43:08
 * @FilePath: /shadertoy/src/components/CodeEditor.tsx
 */
import React, { useEffect, useRef } from 'react';
//@ts-ignore
import AceEditor from 'ace-builds/src-noconflict/ace';

// Ace编辑器类型声明
declare global {
  namespace Ace {
    interface Editor {
      setTheme(theme: string): void;
      setOptions(options: any): void;
      setValue(value: string, cursorPos?: number): void;
      getValue(): string;
      getSession(): any;
      resize(): void;
      on(event: string, callback: () => void): void;
      container: HTMLElement;
      destroy(): void;
      session: any;
    }
  }
}
import 'ace-builds/src-noconflict/mode-glsl';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/keybinding-vim';
import 'ace-builds/src-noconflict/keybinding-emacs';

interface CodeEditorProps {
  id: string;
  defaultValue: string;
  onChange: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ id, defaultValue, onChange }) => {
  const editorRef = useRef<Ace.Editor | null>(null);
  const initialValueSet = useRef(false); // 标记初始值是否已设置
  
  useEffect(() => {
    // 初始化编辑器
    const editor = AceEditor.edit(id);
    editorRef.current = editor;
    
    if (editor) {
      editor.setTheme('ace/theme/monokai');
      editor.session.setMode('ace/mode/glsl');
      
      // 设置初始值，保持光标位置
      if (!initialValueSet.current) {
        const currentValue = editor.getValue();
        if (currentValue !== defaultValue) {
          editor.setValue(defaultValue, -1); // 使用-1保持光标位置不变
          initialValueSet.current = true;
        }
      }
      
      // 添加变化监听器
      editor.on('change', () => {
        if (onChange && editorRef.current) {
          onChange(editorRef.current.getValue());
        }
      });
      
      // 设置编辑器选项
      editor.setOptions({
        fontSize: 14,
        showPrintMargin: false,
        highlightActiveLine: true,
        highlightSelectedWord: true,
        showLineNumbers: true,
        showGutter: true,
        wrap: true,
        indentedSoftWrap: false,
        behavioursEnabled: true,
        wrapBehavioursEnabled: true,
        enableAutoIndent: true,
        enableBasicAutocompletion: false,
        enableLiveAutocompletion: false,
        enableSnippets: false,
        cursorStyle: 'ace',
        scrollPastEnd: 0.5
      });
      
      if (editor.container) {
        editor.container.style.lineHeight = '1.5';
        editor.container.style.fontFamily = 'Consolas, Monaco, "Courier New", monospace';
      }
      
      // 延迟调整大小
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.resize();
        }
      }, 100);
    }
    
    // 清理函数
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
        } catch (error) {
          // 忽略销毁错误
        }
        editorRef.current = null;
        initialValueSet.current = false;
      }
    };
  }, [id]); // 只在id变化时重新初始化编辑器
  
  // 监听defaultValue变化，更新编辑器内容
  useEffect(() => {
    if (editorRef.current && defaultValue !== undefined) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== defaultValue) {
        editorRef.current.setValue(defaultValue, -1); // 使用-1保持光标位置不变
      }
    }
  }, [defaultValue]);
  
  const resizeEditor = () => {
    if (editorRef.current) {
      editorRef.current.resize();
    }
  };
  
  useEffect(() => {
    window.addEventListener('resize', resizeEditor);
    return () => {
      window.removeEventListener('resize', resizeEditor);
    };
  }, []);
  
  return <div id={id} style={{ width: '100%', height: '100%' }} />;
};

export default CodeEditor;
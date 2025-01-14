// organize-imports-ignore
// Must be loaded before other ace-builds imports
import AceEditor from 'react-ace';
// Enables Ctrl-f
import 'ace-builds/src-min-noconflict/ext-searchbox';
// Enables syntax highlighting
import 'ace-builds/src-min-noconflict/mode-javascript';
import 'ace-builds/src-min-noconflict/mode-json';
import 'ace-builds/src-min-noconflict/mode-julia';
import 'ace-builds/src-min-noconflict/mode-python';
import 'ace-builds/src-min-noconflict/mode-r';
import 'ace-builds/src-min-noconflict/mode-ruby';
import 'ace-builds/src-min-noconflict/mode-sql';
// UI theme
import 'ace-builds/src-min-noconflict/theme-github';
import 'ace-builds/src-min-noconflict/theme-dracula';
import * as React from 'react';
// Shortcuts support, TODO: support non-emacs
// This steals Ctrl-a so this should not be a default
//import 'ace-builds/src-min-noconflict/keybinding-emacs';
import { SettingsContext } from '../Settings';
import { useDebouncedLocalState } from './Input';
import { Tooltip } from './Tooltip';

export function CodeEditor({
  value,
  onChange,
  className,
  placeholder,
  disabled,
  onKeyDown,
  language,
  id,
  singleLine,
  label,
  tooltip,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  language: string;
  id: string;
  singleLine?: boolean;
  label?: string;
  tooltip?: string;
}) {
  const {
    state: { theme },
  } = React.useContext(SettingsContext);
  const [localValue, setLocalValue, flushLocalValue] = useDebouncedLocalState(
    value,
    onChange
  );

  const editor = React.useRef(null);

  // Make sure editor resizes if the overall panel changes size. For
  // example this happens when the preview height changes.
  React.useEffect(() => {
    if (editor.current) {
      const panel = editor.current.editor.container.closest('.panel');
      const obs = new ResizeObserver(function handleEditorResize() {
        editor.current.editor.resize();
      });
      obs.observe(panel);

      return () => obs.disconnect();
    }
  }, [editor.current]);

  return (
    <div
      className={`editor-container ${
        singleLine ? 'editor-container--singleLine vertical-align-center' : ''
      }`}
    >
      {label && <label className="label input-label">{label}</label>}
      <AceEditor
        ref={(r) => (editor.current = r)}
        mode={language}
        theme={theme === 'dark' ? 'dracula' : 'github'}
        maxLines={singleLine ? 1 : undefined}
        wrapEnabled={true}
        onChange={setLocalValue}
        onBlur={flushLocalValue}
        name={id}
        value={String(localValue)}
        placeholder={placeholder}
        className={`${className} ${singleLine ? 'input' : ''}`}
        readOnly={disabled}
        width={
          singleLine
            ? String(Math.max(300, String(localValue).length * 10)) + 'px'
            : '100%'
        }
        fontSize="1rem"
        commands={[
          // AceEditor wants commands in this way but outside here we
          // only support onKeyDown so doing this funky translation.
          {
            name: 'ctrl-enter',
            bindKey: { win: 'Ctrl-Enter', mac: 'Ctrl-Enter' },
            exec: () => {
              flushLocalValue();
              // Give time to flush
              return setTimeout(() =>
                onKeyDown({
                  ctrlKey: true,
                  code: 'Enter',
                } as React.KeyboardEvent)
              );
            },
          },
          singleLine
            ? {
                name: 'disable newlines',
                bindKey: { win: 'Enter|Shift-Enter', mac: 'Enter|Shift-Enter' },
                // Do nothing
                exec: () => {},
              }
            : undefined,
        ].filter(Boolean)}
        showGutter={!singleLine}
        setOptions={
          singleLine
            ? { showLineNumbers: false, highlightActiveLine: false }
            : undefined
        }
      />
      {tooltip && <Tooltip>{tooltip}</Tooltip>}
    </div>
  );
}

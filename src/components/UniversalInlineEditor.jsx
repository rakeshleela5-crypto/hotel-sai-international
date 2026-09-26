import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Edit3, Check, X, Sparkles, RotateCcw } from 'lucide-react';

/**
 * Helper: Find the closest editable text target inside the container.
 * Ignores interactive controls (buttons, inputs, selects, links, svgs)
 * to ensure all normal button clicks and form inputs continue working.
 */
function getEditableTextTarget(element, container) {
  if (!element || element === container) return null;
  // If clicked inside a button, form control, link or SVG, skip
  if (element.closest('button, input, textarea, select, option, a, svg')) {
    return null;
  }
  // If marked explicitly as no-edit
  if (element.closest('.no-inline-edit, .no-edit')) {
    return null;
  }

  // Check if target itself has direct text content
  const hasDirectText = Array.from(element.childNodes).some(
    node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
  );
  if (hasDirectText) return element;

  // Otherwise check if it's a common text leaf element
  const textCandidate = element.querySelector('span, p, h1, h2, h3, h4, h5, h6, td, th, label, strong, b, small, em');
  if (textCandidate && !textCandidate.closest('button, input, textarea, select, option, a, svg')) {
    return textCandidate;
  }

  return null;
}

/**
 * Generate a stable DOM path identifier for localStorage persistence
 */
function getElementKey(el, container) {
  if (!el) return null;
  if (el.id) return `#${el.id}`;
  if (el.dataset.editKey) return el.dataset.editKey;

  const room = el.dataset.roomId || el.closest('[data-room-id]')?.dataset.roomId;
  const field = el.dataset.field || el.dataset.editField;
  if (room && field) return `room:${room}:${field}`;

  const booking = el.dataset.bookingId || el.closest('[data-booking-id]')?.dataset.bookingId;
  if (booking && field) return `booking:${booking}:${field}`;

  // Fallback to hierarchical path from container
  const path = [];
  let curr = el;
  while (curr && curr !== container && curr !== document.body) {
    let index = 0;
    let sibling = curr.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === curr.tagName) index++;
      sibling = sibling.previousElementSibling;
    }
    path.unshift(`${curr.tagName.toLowerCase()}[${index}]`);
    curr = curr.parentElement;
  }
  return path.join('>');
}

/**
 * useUniversalInlineEdit: Hook enabling true click-to-type WYSIWYG keyboard editing
 * across all text nodes inside a container when isActive is true.
 */
export function useUniversalInlineEdit({
  isActive = false,
  containerRef,
  onSave,
  storagePrefix = 'hsi_universal'
}) {
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Apply persisted edits from localStorage when container mounts or becomes active
  useEffect(() => {
    if (!containerRef?.current) return;
    try {
      const stored = localStorage.getItem(`${storagePrefix}_edits`);
      if (stored) {
        const edits = JSON.parse(stored);
        Object.entries(edits).forEach(([key, text]) => {
          if (!text) return;
          let el = null;
          if (key.startsWith('#')) {
            el = document.querySelector(key);
          } else if (key.startsWith('room:')) {
            const [, rId, fld] = key.split(':');
            el = containerRef.current.querySelector(`[data-room-id="${rId}"][data-field="${fld}"]`) ||
                 containerRef.current.querySelector(`[data-room-id="${rId}"] [data-field="${fld}"]`);
          } else if (key.startsWith('booking:')) {
            const [, bId, fld] = key.split(':');
            el = containerRef.current.querySelector(`[data-booking-id="${bId}"][data-field="${fld}"]`) ||
                 containerRef.current.querySelector(`[data-booking-id="${bId}"] [data-field="${fld}"]`);
          }
          if (el && el.innerText !== text) {
            el.innerText = text;
          }
        });
      }
    } catch (e) {
      console.warn('Could not restore persisted edits:', e);
    }
  }, [containerRef, storagePrefix, isActive]);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container || !isActive) {
      if (container) container.classList.remove('hsi-live-edit-active');
      return;
    }

    container.classList.add('hsi-live-edit-active');

    // Click handler to activate contentEditable on the exact clicked text element
    const handlePointerDown = (e) => {
      const target = getEditableTextTarget(e.target, container);
      if (!target) return;

      // If already contentEditable and focused, let native typing handle it
      if (target.getAttribute('contenteditable') === 'true' && document.activeElement === target) {
        return;
      }

      // Activate contentEditable
      target.setAttribute('contenteditable', 'true');
      target.setAttribute('spellcheck', 'false');
      target.classList.add('hsi-currently-editing');
      target.dataset.originalText = target.innerText;

      // Give browser a tick to focus and position caret
      setTimeout(() => {
        try {
          target.focus();
        } catch (err) {
          // ignore focus error
        }
      }, 10);

      // Keydown handler: Enter to commit, Esc to revert
      const handleKeyDown = (ev) => {
        if (ev.key === 'Enter' && !ev.shiftKey) {
          ev.preventDefault();
          target.blur();
        } else if (ev.key === 'Escape') {
          ev.preventDefault();
          if (target.dataset.originalText !== undefined) {
            target.innerText = target.dataset.originalText;
          }
          target.blur();
        }
      };

      // Blur handler: persist and clean up
      const handleBlur = () => {
        target.removeAttribute('contenteditable');
        target.classList.remove('hsi-currently-editing');
        target.removeEventListener('keydown', handleKeyDown);
        target.removeEventListener('blur', handleBlur);

        const newText = target.innerText.trim();
        const oldText = (target.dataset.originalText || '').trim();

        if (newText !== oldText) {
          // Visual success flash
          target.classList.add('hsi-save-success-flash');
          setTimeout(() => target.classList.remove('hsi-save-success-flash'), 1200);

          // Save to localStorage
          try {
            const key = getElementKey(target, container);
            if (key) {
              const currentEdits = JSON.parse(localStorage.getItem(`${storagePrefix}_edits`) || '{}');
              currentEdits[key] = newText;
              localStorage.setItem(`${storagePrefix}_edits`, JSON.stringify(currentEdits));
            }
          } catch (err) {
            console.warn('Error saving inline edit:', err);
          }

          // Trigger onSave callback if available
          const field = target.dataset.field || target.dataset.editField;
          const roomId = target.dataset.roomId || target.closest('[data-room-id]')?.dataset.roomId;
          const bookingId = target.dataset.bookingId || target.closest('[data-booking-id]')?.dataset.bookingId;

          if (onSaveRef.current) {
            onSaveRef.current({
              target,
              newText,
              oldText,
              field,
              roomId,
              bookingId
            });
          }

          // Dispatch universal event so any reactive component can catch it
          window.dispatchEvent(new CustomEvent('hsi:text-edited', {
            detail: { target, newText, oldText, field, roomId, bookingId }
          }));
        }
      };

      target.addEventListener('keydown', handleKeyDown);
      target.addEventListener('blur', handleBlur);
    };

    container.addEventListener('click', handlePointerDown);

    return () => {
      container.classList.remove('hsi-live-edit-active');
      container.removeEventListener('click', handlePointerDown);
    };
  }, [isActive, containerRef, storagePrefix]);
}

/**
 * UniversalInlineContainer: Component wrapper that automatically equips all children
 * with click-to-type inline keyboard editing when isActive is true.
 */
export function UniversalInlineContainer({
  isActive = false,
  onSave,
  storagePrefix = 'hsi_universal',
  children,
  className = '',
  style = {},
  bannerLabel = 'Direct Keyboard Edit Mode',
  onToggleActive
}) {
  const containerRef = useRef(null);
  useUniversalInlineEdit({ isActive, containerRef, onSave, storagePrefix });

  return (
    <div
      ref={containerRef}
      className={`hsi-universal-container ${isActive ? 'hsi-live-edit-active' : ''} ${className}`}
      style={{ position: 'relative', width: '100%', ...style }}
    >
      {children}
      {isActive && (
        <InlineEditorBanner
          isActive={isActive}
          onToggle={onToggleActive}
          label={bannerLabel}
          onReset={() => {
            if (window.confirm('Reset all inline text edits back to default values?')) {
              localStorage.removeItem(`${storagePrefix}_edits`);
              window.location.reload();
            }
          }}
        />
      )}
    </div>
  );
}

/**
 * InlineText: Dedicated, two-way bound click-to-type inline text component.
 */
export function InlineText({
  value = '',
  onSave,
  isActive = true,
  tag = 'span',
  className = '',
  style = {},
  placeholder = 'Type here...',
  type = 'text',
  multiline = false,
  field = '',
  roomId = '',
  bookingId = ''
}) {
  const elementRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const originalValueRef = useRef(value);

  useEffect(() => {
    originalValueRef.current = value;
    if (elementRef.current && document.activeElement !== elementRef.current) {
      elementRef.current.innerText = value !== undefined && value !== null ? String(value) : '';
    }
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
    originalValueRef.current = elementRef.current ? elementRef.current.innerText : value;
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!elementRef.current) return;
    const newText = elementRef.current.innerText.trim();
    if (newText !== String(originalValueRef.current).trim()) {
      if (type === 'number') {
        const numVal = parseFloat(newText.replace(/[^0-9.-]+/g, '')) || 0;
        if (onSave) onSave(numVal, newText);
      } else {
        if (onSave) onSave(newText);
      }
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      elementRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (elementRef.current) {
        elementRef.current.innerText = String(originalValueRef.current || '');
        elementRef.current.blur();
      }
    }
  };

  const CustomTag = tag;

  return (
    <CustomTag
      ref={elementRef}
      contentEditable={isActive}
      suppressContentEditableWarning={true}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-field={field}
      data-room-id={roomId}
      data-booking-id={bookingId}
      title={isActive ? 'Click to type and edit directly with keyboard' : ''}
      className={`hsi-inline-text ${isActive ? 'hsi-inline-editable' : ''} ${className}`}
      style={{
        display: tag === 'span' ? 'inline-block' : 'block',
        cursor: isActive ? 'text' : 'inherit',
        outline: isFocused 
          ? '2px solid var(--gold-glow, #f3c64c)' 
          : isActive 
            ? '1px dashed rgba(243, 198, 76, 0.4)' 
            : 'none',
        outlineOffset: '2px',
        borderRadius: '3px',
        padding: isActive ? '1px 3px' : '0',
        backgroundColor: isFocused 
          ? 'rgba(6, 14, 26, 0.95)' 
          : justSaved 
            ? 'rgba(16, 185, 129, 0.25)' 
            : isActive 
              ? 'rgba(243, 198, 76, 0.06)' 
              : 'transparent',
        color: justSaved ? '#34d399' : isFocused ? '#fff' : 'inherit',
        transition: 'all 0.15s ease',
        minWidth: isActive && !value ? '30px' : 'auto',
        ...style
      }}
      data-placeholder={placeholder}
    >
      {value !== undefined && value !== null ? String(value) : ''}
    </CustomTag>
  );
}

/**
 * InlineEditorBanner: Floating indicator displaying active keyboard edit state
 * with quick shortcuts, instant exit, and reset options.
 */
export function InlineEditorBanner({ isActive, onToggle, onReset, label = 'Direct Keyboard Edit Mode' }) {
  if (!isActive) return null;

  return (
    <div 
      className="no-print"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999999,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))',
        border: '1.5px solid var(--gold-glow, #f3c64c)',
        borderRadius: '30px',
        padding: '8px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.75), 0 0 16px rgba(243, 198, 76, 0.35)',
        backdropFilter: 'blur(16px)',
        color: '#fff',
        fontSize: '0.82rem',
        fontWeight: 600,
        animation: 'pulse 3s infinite ease-in-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#34d399',
          boxShadow: '0 0 8px #34d399'
        }}></span>
        <Edit3 size={15} color="var(--gold-glow, #f3c64c)" />
        <span>{label}: <strong style={{ color: '#34d399' }}>ACTIVE</strong></span>
      </div>

      <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.75rem', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '10px' }}>
        Click any text on screen to type • <kbd style={{ background: 'rgba(255,255,255,0.12)', padding: '1px 5px', borderRadius: '3px' }}>Enter</kbd> to save • <kbd style={{ background: 'rgba(255,255,255,0.12)', padding: '1px 5px', borderRadius: '3px' }}>Esc</kbd> to cancel
      </span>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            borderRadius: '20px',
            padding: '3px 10px',
            fontSize: '0.72rem',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Reset all inline edits back to defaults"
        >
          <RotateCcw size={11} /> Reset
        </button>
      )}

      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#fff',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '0.75rem',
            cursor: 'pointer',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s ease'
          }}
          title="Exit Inline Edit Mode"
        >
          <Check size={13} color="#34d399" /> Done Editing
        </button>
      )}
    </div>
  );
}

export default InlineText;

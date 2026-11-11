import { useEffect, useRef, useState } from 'react';

import type { AgentAppearanceOptions } from '../../../core/src/messages.js';
import { getCachedSprite } from '../office/sprites/spriteCache.js';
import { getCharacterSprites } from '../office/sprites/spriteData.js';
import { Direction } from '../office/types.js';
import { transport } from '../transport/index.js';
import { Button } from './ui/Button.js';
import { Modal } from './ui/Modal.js';

/** Independent canvas: draft choices never touch the office character. */
function CharacterPreview({
  palette,
  repeat = 0,
  size = 96,
}: {
  palette: number;
  repeat?: number;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let frame = 0;
    const draw = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const sprites = getCharacterSprites(palette, repeat).walk[Direction.DOWN];
      const sprite = getCachedSprite(sprites[Math.floor(Date.now() / 180) % sprites.length], 4);
      canvas.width = sprite.width;
      canvas.height = sprite.height;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(sprite, 0, 0);
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [palette, repeat]);
  return (
    <canvas
      ref={canvasRef}
      aria-label="Character graphic"
      style={{ height: size, width: size / 2, imageRendering: 'pixelated' }}
    />
  );
}

export function AgentAppearanceModal({
  agentId,
  onClose,
}: {
  agentId: number;
  onClose: () => void;
}) {
  const [data, setData] = useState<AgentAppearanceOptions | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const unsubscribe = transport.onMessage((message) => {
      if (!('id' in message) || message.id !== agentId) return;
      if (message.type === 'agentAppearanceOptions') {
        setData(message);
        setDraft(message.selectedAssetId);
        setError('');
      } else if (message.type === 'agentAppearanceSaved') onClose();
      else if (message.type === 'agentAppearanceError') {
        setError(message.message);
        setSaving(false);
      } else if (message.type === 'agentClosed') {
        setError('This agent is no longer available.');
        setData(null);
      }
    });
    const unstate = transport.onStateChange((state) => {
      if (state !== 'connected') {
        setError('Connection lost. Close and reopen the picker after reconnecting.');
        setData(null);
        setSaving(false);
      }
    });
    transport.send({ type: 'requestAgentAppearance', id: agentId });
    return () => {
      unsubscribe();
      unstate();
    };
  }, [agentId, onClose]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [onClose, saving]);
  const selected = data?.options.find((option) => option.id === draft);
  const unavailable = draft !== null && !selected;
  return (
    <Modal
      isOpen
      onClose={() => {
        if (!saving) onClose();
      }}
      title="Agent Character"
      className="w-[640px]"
    >
      <div
        data-testid="agent-appearance-modal"
        role="dialog"
        aria-label="Agent Character"
        aria-modal="true"
      >
        {data ? (
          <>
            <p className="text-center text-accent-bright text-xl mb-2">{data.name}</p>
            <div
              data-testid="agent-appearance-preview"
              data-asset-id={draft ?? 'random'}
              data-palette={selected?.palette ?? data.palette}
              className="flex flex-col items-center gap-2 p-4 bg-btn-bg mb-4"
            >
              <CharacterPreview
                palette={selected?.palette ?? data.palette}
                repeat={selected ? 0 : data.repeat}
                size={160}
              />
              <span>
                {draft === null
                  ? 'Random — automatic character selection'
                  : unavailable
                    ? 'Saved character is unavailable'
                    : selected?.label}
              </span>
            </div>
            <p className="text-text-muted mb-4">
              Choose a character for this agent name, shared across all browsers. Your office
              changes only when you save.
            </p>
            <div
              className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 max-h-[300px] overflow-y-auto"
              role="group"
              aria-label="Available characters"
            >
              <Button
                size="sm"
                variant={draft === null ? 'active' : 'default'}
                aria-pressed={draft === null}
                data-testid="agent-character-random"
                onClick={() => setDraft(null)}
                disabled={saving}
              >
                Random
              </Button>
              {data.options.map((option) => (
                <Button
                  key={`${option.id}:${option.palette}`}
                  size="sm"
                  variant={draft === option.id ? 'active' : 'default'}
                  className="flex flex-col items-center p-2"
                  aria-pressed={draft === option.id}
                  aria-label={option.label}
                  data-testid="agent-character-option"
                  data-asset-id={option.id}
                  data-palette={option.palette}
                  onClick={() => setDraft(option.id)}
                  disabled={saving}
                >
                  <CharacterPreview palette={option.palette} />
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>
          </>
        ) : (
          !error && <p>Loading available characters…</p>
        )}
        {error && (
          <p role="alert" className="text-red-400 my-4">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-4 mt-4">
          <Button size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="accent"
            disabled={!data || saving || unavailable}
            onClick={() => {
              setSaving(true);
              setError('');
              transport.send({ type: 'saveAgentAppearance', id: agentId, assetId: draft });
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

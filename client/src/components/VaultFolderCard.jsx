import {
  ChevronRight,
  FolderLock,
  ShieldCheck,
} from 'lucide-react';
import { formatBytes } from '../utils/vaultEngine';

export default function VaultFolderCard({
  folder,
  onOpen,
  onAction,
}) {
  return (
    <article
      style={{
        padding: '0.85rem',
        borderRadius: '1rem',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: 0,
          border: 0,
          background: 'transparent',
          color: '#edf2ff',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            width: '2.5rem',
            height: '2.5rem',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '0.85rem',
            background:
              'linear-gradient(135deg, rgba(124,92,255,0.22), rgba(77,215,255,0.12))',
            color: '#c7bdff',
            flexShrink: 0,
          }}
        >
          <FolderLock size={18} />
        </span>

        <span style={{ minWidth: 0, flex: 1 }}>
          <strong
            style={{
              display: 'block',
              fontSize: '0.76rem',
              fontWeight: 850,
            }}
          >
            {folder.name}
          </strong>

          <span
            style={{
              display: 'block',
              marginTop: '0.2rem',
              color: '#8997b3',
              fontSize: '0.63rem',
            }}
          >
            {formatBytes(folder.usedBytes)} · {folder.items} items
          </span>
        </span>

        <ChevronRight size={15} color="#7f8ca7" />
      </button>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          marginTop: '0.7rem',
          color: '#8997b3',
          fontSize: '0.61rem',
        }}
      >
        <span>{folder.encryption}</span>
        <span>Last access: {folder.lastAccess}</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem',
            color: folder.trusted ? '#83e9c1' : '#ffd28d',
          }}
        >
          <ShieldCheck size={10} />
          {folder.trusted ? 'Trusted device' : 'Review device'}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          marginTop: '0.7rem',
        }}
      >
        {[
          'Add File',
          'Move To Safe',
          'Rename',
          'Lock Folder',
          'Share Securely',
        ].map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => onAction?.(action, folder)}
            style={{
              minHeight: '2.2rem',
              padding: '0 0.55rem',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.05)',
              color: '#dce5f8',
              fontSize: '0.59rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {action}
          </button>
        ))}
      </div>
    </article>
  );
}
import { useToastStore } from '../stores/toastStore'

export function Toast() {
  const toast = useToastStore(s => s.toast)
  const hide  = useToastStore(s => s.hide)

  return (
    <div
      className="fixed z-[300] left-1/2 whitespace-nowrap rounded-full text-[13px] font-extrabold px-[18px] py-[9px] flex items-center gap-[10px]"
      style={{
        transform: toast.visible
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(16px)',
        opacity:        toast.visible ? 1 : 0,
        bottom:         20,
        background:     toast.color,
        color:          '#fff',
        boxShadow:      `0 4px 20px ${toast.color}55`,
        pointerEvents:  toast.visible && toast.action ? 'auto' : 'none',
        transition:     'transform .3s, opacity .3s',
      }}
    >
      <span>{toast.msg}</span>
      {toast.action && (
        <button
          onClick={() => { toast.action!.fn(); hide() }}
          style={{
            background: 'rgba(255,255,255,.25)',
            border: '1px solid rgba(255,255,255,.4)',
            borderRadius: 99,
            color: '#fff',
            fontFamily: 'inherit',
            fontWeight: 800,
            fontSize: 12,
            padding: '2px 10px',
            cursor: 'pointer',
          }}
        >
          {toast.action.label}
        </button>
      )}
    </div>
  )
}

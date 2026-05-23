import { useToastStore } from '../stores/toastStore'

export function Toast() {
  const toast = useToastStore(s => s.toast)
  return (
    <div className="fixed z-[300] left-1/2 pointer-events-none transition-all duration-300 whitespace-nowrap rounded-full text-[13px] font-extrabold px-[18px] py-[9px]"
      style={{
        transform: toast.visible
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(20px)',
        opacity:    toast.visible ? 1 : 0,
        bottom:     16,
        background: toast.color,
        color:      toast.color === 'var(--green)' ? '#0d0f1e' : '#fff',
      }}>
      {toast.msg}
    </div>
  )
}

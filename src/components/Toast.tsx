import { useToastStore } from '../stores/toastStore'

export function Toast() {
  const toast = useToastStore(s => s.toast)
  return (
    <div className="fixed z-[300] left-1/2 pointer-events-none transition-all duration-300 whitespace-nowrap rounded-full text-[13px] font-extrabold px-[18px] py-[9px]"
      style={{
        transform: toast.visible
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(16px)',
        opacity: toast.visible ? 1 : 0,
        bottom:  20,
        background: toast.color,
        color: '#fff',
        boxShadow: `0 4px 20px ${toast.color}55`,
      }}>
      {toast.msg}
    </div>
  )
}

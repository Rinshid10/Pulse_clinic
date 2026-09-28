/* Opens a minimal print window with the given HTML body. Used for bills/receipts. */
export function printHtml(title, body) {
  const w = window.open('', '_blank', 'width=720,height=900')
  if (!w) return false
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; color: #0e1626; padding: 32px; max-width: 640px; margin: 0 auto; }
    h1 { font-size: 20px; margin: 0; } h2 { font-size: 14px; margin: 0; color: #515d77; font-weight: 600; }
    .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0e1626; padding-bottom: 14px; margin-bottom: 16px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; font-size: 13px; margin-bottom: 18px; }
    .meta b { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #8a93ab; }
    table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #8a93ab; border-bottom: 1px solid #e7ecf5; padding: 8px 4px; }
    td { padding: 9px 4px; border-bottom: 1px solid #f0f3f9; } td.r, th.r { text-align: right; }
    .tot td { border: none; padding: 5px 4px; } .tot .grand td { font-size: 16px; font-weight: 800; border-top: 2px solid #0e1626; padding-top: 10px; }
    .note { margin-top: 18px; padding: 12px 14px; background: #f4f6fb; border-radius: 10px; font-size: 12.5px; color: #515d77; }
    .valid { background: #d8f6ec; color: #067a52; font-weight: 700; }
    .foot { margin-top: 28px; font-size: 12px; color: #8a93ab; text-align: center; }
    @media print { body { padding: 0; } }
  </style></head><body>${body}
  <script>window.onload = () => { window.print(); }</script></body></html>`)
  w.document.close()
  return true
}

export const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

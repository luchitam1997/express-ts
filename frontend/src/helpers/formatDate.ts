// "2026-04-14T04:29:29.036Z" => "Apr 14, 4:29 AM"
export const formatDate = (value: string) => {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value))
}

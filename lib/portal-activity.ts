const activityDate = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
})

export function formatPortalActivity(date: string | null | undefined) {
  return date ? activityDate.format(new Date(date)) + " hs" : "Sin registro"
}
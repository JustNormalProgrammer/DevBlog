export default function getAnonUsername() {
  let anonUsername = localStorage.getItem('anonUsername')
  if (!anonUsername) {
    anonUsername = `Anonymous-${crypto.randomUUID().slice(0, 6)}`
    localStorage.setItem('anonUsername', anonUsername)
  }
  return anonUsername;
}

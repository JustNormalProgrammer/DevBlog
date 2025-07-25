export default function getAnonUsername() {
  const anonUsername = localStorage.getItem('anonUsername')
  if (!anonUsername) {
    const generated = `Anonymous-${crypto.randomUUID().slice(0, 6)}`
    localStorage.setItem('anonUsername', generated)
    return generated
  } else {
    return anonUsername;
  }
}

module.exports = (dateObj) => {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
  }).format(dateObj)
}

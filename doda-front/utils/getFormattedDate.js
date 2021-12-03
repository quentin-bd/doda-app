function getFormattedDate(dateString) {
  const date = new Date(dateString);
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}
export default getFormattedDate
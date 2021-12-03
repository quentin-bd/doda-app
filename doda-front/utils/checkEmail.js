var isEmail = (emailString) => {
  var regEx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailString.match(regEx) != null;
}

export default isEmail
export default function (userInfo = {}, action) {
  if (action.type == 'saveUserInfoFromSocial') {
    return action.userInfo
  } else {
    return userInfo
  }
}
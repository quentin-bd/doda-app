export default function(token = '', action){
    if(action.type == 'saveToken'){
        return action.userToken
    } else if(action.type == 'deleteToken') {
        return ''
    }
    else{
        return token
    }
} 
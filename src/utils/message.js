const genarateMessage = (username,text) => {
    return {
        username,
        text,
        createAt: new Date().getTime()
    }
}

const genarateLocationMessage = (username,url) => {
    return{
        username,
        url,
        createAt: new Date().getTime()
    }
}

module.exports = {
    genarateMessage,
    genarateLocationMessage
}
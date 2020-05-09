const socket  = io()

//Elements
const $massageForm = document.querySelector('#message-form')
const $massageFormInput = document.querySelector('input')
const $massageFormButton = document.querySelector('button')
const $sendLocationButton = document.querySelector("#send-location")
const $message = document.querySelector('#messages')

//Template
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessagetemplate = document.querySelector("#location-message-template").innerHTML
const sidebartemplate = document.querySelector("#sidebar-template").innerHTML

//Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $message.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $message.offsetHeight

    const containerHeight = $message.scrollHeight

    const scrollOffset = $message.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $message.scrollTop = $message.scrollHeight
    }
}

socket.on('message', (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        username : msg.username,
        message: msg.text,
        date : moment(msg.createdAt).format('h:m a')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessagetemplate, {
        username : message.username,
        url: message.url,
        date : moment(message.createdAt).format('h:m a')
    })
    $message.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room,users}) => {
    const html = Mustache.render(sidebartemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$massageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $massageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendmessage', message, (error) => {
        $massageFormButton.removeAttribute('disabled')
        $massageFormInput.value = ''
        $massageFormInput.focus()

        if(error){
            return console.log(error)
        }

        console.log('The message was delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    
    $sendLocationButton.setAttribute('disabled', 'disabled')

    if(!navigator.geolocation){
        return alert("Geolocation is not supported to your browser")
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendlocation', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log("location shared!")
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})
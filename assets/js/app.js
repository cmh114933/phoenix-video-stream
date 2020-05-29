// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
import channel from "./socket"
//
import "phoenix_html"

let peerConnection;

const connectButton = document.getElementById("connect")
const callButton = document.getElementById("call")
const disconnectButton = document.getElementById("disconnect")

const remoteVideo = document.getElementById("remote-stream")
const localVideo = document.getElementById("local-stream")

let remoteStream = new MediaStream();

let setVideoStream = (videoElement, stream)  => {
    videoElement.srcObject =stream;
}

let unsetVideoStream = (videoElement) => {
    if(videoElement.srcObject){
        videoElement.srcObject.getTracks().forEach(track => track.stop())       
    }
    videoElement.removeAttribute('src')
    videoElement.removeAttribute('srcObject')
}

let handleOnTrack = (event) => {
    console.log(event)
    remoteStream.addTrack(event.track)
}

let handleOnIceCandidate = (event) => {
    console.log(event)
    if(!!event.candidate) {
        pushPeerMessage('ice-candidate', event.candidate)
    }
}


let createPeerConnection = (stream) => {
    let pc = new RTCPeerConnection({
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            }
        ]
    })

    pc.ontrack = handleOnTrack;
    pc.onicecandidate = handleOnIceCandidate
    stream.getTracks().forEach(track => pc.addTrack(track))
    return pc
}

let receiveRemote = (offer) => {
    let remoteDescription = new RTCSessionDescription(offer)
    peerConnection.setRemoteDescription(remoteDescription)
}

let answerCall = (offer) => {
    receiveRemote(offer)
    peerConnection.createAnswer().then((answer)=>{
        peerConnection.setLocalDescription(answer).then(() => {
            pushPeerMessage('video-answer', peerConnection.localDescription)
        })
    })
}

let connect = () => {
    new Promise((resolve, reject) => {
        connectButton.disabled = true
        disconnectButton.disabled = false
        callButton.disabled = false

        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        }).then((localStream) => {
            console.log("Received mediadata")
            setVideoStream(localVideo, localStream)
            peerConnection = createPeerConnection(localStream)
            resolve()
        }).catch(err => {
            console.log(err)
        })
    }).then((res) => {
        console.log("executed")
    })
}


let pushPeerMessage = (type, content) => {
    channel.push('peer-message', {
        body: JSON.stringify({
            'type': type,
            'content': content
        })
    })
}

let call = () => {
    new Promise((resolve, reject) => {
        peerConnection.createOffer()
        .then((offer) => {
            peerConnection.setLocalDescription(offer)
            pushPeerMessage('video-offer', offer)
        })
    }).then()
}

let disconnect = () => {
    connectButton.disabled = false;
    disconnectButton.disabled = true;
    callButton.disabled = true;
    unsetVideoStream(localVideo)
    unsetVideoStream(remoteVideo)
    remoteStream = new MediaStream()
    setVideoStream(remoteVideo, remoteStream)
    peerConnection.close()
    peerConnection = null
}




setVideoStream(remoteVideo, remoteStream)


connectButton.disabled = false
disconnectButton.disabled = true;
callButton.disabled = true;
connectButton.onclick = connect;
callButton.onclick = call;
disconnectButton.onclick = disconnect;

channel.on('peer-message', payload => {
    const message = JSON.parse(payload.body)
    switch(message.type){
        case 'video-offer':
            console.log('offered: ', message.content);
            answerCall(message.content)
            break
        case 'video-answer':
            console.log('answered: ', message.content);
            receiveRemote(message.content)
            break
        case 'ice-candidate':
            console.log('candidate: ', message.content);
            let candidate = new RTCIceCandidate(message.content)
            peerConnection.addIceCandidate(candidate).catch((error) => {console.log(error)})

            break
        case 'disconnect':
            console.log('disconnect: ', message.content);
            break
        default:
            console.log(message.type)
    }
})
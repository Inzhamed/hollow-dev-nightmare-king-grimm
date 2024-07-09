const socket = io();

document.querySelector("#chat-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;

  socket.emit("chatMessage", msg);

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

socket.on("message", (msg) => {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p>${msg}</p>`;
  document.querySelector(".chat-messages").appendChild(div);
});


const peerConnection = new RTCPeerConnection();

socket.on("offer", (offer) => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  peerConnection.createAnswer().then((answer) => {
    peerConnection.setLocalDescription(answer);
    socket.emit("answer", answer);
  });
});

socket.on("answer", (answer) => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on("candidate", (candidate) => {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    document.getElementById("video").srcObject = stream;
    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));
  });

peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("candidate", event.candidate);
  }
};

peerConnection.ontrack = (event) => {
  const [remoteStream] = event.streams;
  document.getElementById("remote-video").srcObject = remoteStream;
};


async function createMeeting() {
  try {
    const response = await fetch("/meetings/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ meetingName: "New Meeting" }), // Customize as needed
    });

    const result = await response.json();

    if (response.ok) {
      alert("Meeting created successfully: " + result.meetingId);
      // Handle success, e.g., redirect to the meeting page
    } else {
      alert("Failed to create meeting: " + result.error);
    }
  } catch (error) {
    console.error("Error creating meeting:", error);
    alert("Error creating meeting");
  }
}

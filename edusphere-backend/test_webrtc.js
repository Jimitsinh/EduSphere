const { io } = require('socket.io-client');
const mongoose = require('mongoose');

const SOCKET_URL = 'http://localhost:5050/live';
const MEETING_ID = 'meet_lexer101';

async function testWebRtcAndSockets() {
  console.log('=== WebRTC & Socket.IO Signaling Test ===');

  const facultyUser = { id: '6a782e1cd8e9ac7cf5dc581a', name: 'Dr. Aris Thorne', email: 'faculty@test.com', role: 'faculty' };
  const studentUser = { id: '6a782e1cd8e9ac7cf5dc5813', name: 'Julian Scholar', email: 'student@test.com', role: 'student' };

  // Connect Faculty Socket
  const facultySocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
  // Connect Student Socket
  const studentSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

  let offerReceived = false;
  let answerReceived = false;
  let chatReceived = false;

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Test timed out after 10s'));
    }, 10000);

    facultySocket.on('connect', () => {
      console.log('✓ Faculty socket connected:', facultySocket.id);
      facultySocket.emit('join-room', { meetingId: MEETING_ID, user: facultyUser });
    });

    studentSocket.on('connect', () => {
      console.log('✓ Student socket connected:', studentSocket.id);
      studentSocket.emit('join-room', { meetingId: MEETING_ID, user: studentUser });
    });

    studentSocket.on('existing-participants', (list) => {
      console.log('✓ Student received existing participants:', list.length);
      // Student sends offer to faculty
      studentSocket.emit('webrtc-offer', {
        toSocketId: facultySocket.id,
        offer: { type: 'offer', sdp: 'fake_sdp_offer_data' }
      });
    });

    facultySocket.on('webrtc-offer', ({ fromSocketId, offer }) => {
      console.log('✓ Faculty received WebRTC offer from:', fromSocketId);
      offerReceived = true;
      // Faculty responds with answer
      facultySocket.emit('webrtc-answer', {
        toSocketId: fromSocketId,
        answer: { type: 'answer', sdp: 'fake_sdp_answer_data' }
      });
    });

    studentSocket.on('webrtc-answer', ({ fromSocketId, answer }) => {
      console.log('✓ Student received WebRTC answer from:', fromSocketId);
      answerReceived = true;

      // Send a live chat message
      studentSocket.emit('send-message', { text: 'Hello class! Testing WebRTC chat.' });
    });

    facultySocket.on('new-message', (msg) => {
      console.log('✓ Faculty received live chat message:', msg.text);
      chatReceived = true;

      if (offerReceived && answerReceived && chatReceived) {
        clearTimeout(timeout);
        resolve();
      }
    });
  });

  facultySocket.disconnect();
  studentSocket.disconnect();
  console.log('=== WebRTC & Socket.IO Test Result: ALL PASSED ===');
}

testWebRtcAndSockets()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('WebRTC Test Error:', err.message);
    process.exit(1);
  });

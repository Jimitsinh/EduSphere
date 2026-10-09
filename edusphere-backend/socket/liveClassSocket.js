const LiveClass = require('../models/LiveClass');
const Attendance = require('../models/Attendance');
const ChatMessage = require('../models/ChatMessage');

// Map to track active socket connections per meeting: socketId -> { meetingId, user, joinTime }
const activeSockets = new Map();

function initLiveClassSocket(io) {
  const liveNamespace = io.of('/live');

  liveNamespace.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // 1. Join Room
    socket.on('join-room', async ({ meetingId, user }) => {
      try {
        if (!meetingId || !user || !user.id) {
          return socket.emit('error-msg', 'Invalid user or meeting ID');
        }

        const roomName = `room_${meetingId}`;
        socket.join(roomName);

        const joinTime = new Date();
        activeSockets.set(socket.id, { meetingId, user, joinTime, roomName });

        // Record attendance entry or update existing
        try {
          await Attendance.create({
            meetingId,
            student: user.id,
            studentEmail: user.email || 'student@edusphere.com',
            studentName: user.name || user.email || 'Student',
            joinTime,
            status: 'present'
          });
        } catch (attErr) {
          console.error('Attendance creation error:', attErr.message);
        }

        // Increment active participants count in DB
        await LiveClass.findOneAndUpdate(
          { meetingId },
          { $inc: { activeParticipantsCount: 1 } }
        );

        // Get list of existing sockets in room (excluding current)
        const socketsInRoom = await liveNamespace.in(roomName).fetchSockets();
        const existingParticipants = socketsInRoom
          .filter((s) => s.id !== socket.id)
          .map((s) => {
            const info = activeSockets.get(s.id);
            return {
              socketId: s.id,
              user: info ? info.user : { id: 'unknown', name: 'Participant' }
            };
          });

        // Send existing participants to newly joined user
        socket.emit('existing-participants', existingParticipants);

        // Notify room that new user joined
        socket.to(roomName).emit('user-joined', {
          socketId: socket.id,
          user
        });

        console.log(`User ${user.name || user.email} joined live class ${meetingId}`);
      } catch (err) {
        console.error('join-room error:', err.message);
        socket.emit('error-msg', 'Failed to join room');
      }
    });

    // 2. WebRTC Signaling: Offer, Answer, ICE Candidate
    socket.on('webrtc-offer', ({ toSocketId, offer }) => {
      const info = activeSockets.get(socket.id);
      socket.to(toSocketId).emit('webrtc-offer', {
        fromSocketId: socket.id,
        fromUser: info ? info.user : null,
        offer
      });
    });

    socket.on('webrtc-answer', ({ toSocketId, answer }) => {
      socket.to(toSocketId).emit('webrtc-answer', {
        fromSocketId: socket.id,
        answer
      });
    });

    socket.on('webrtc-ice-candidate', ({ toSocketId, candidate }) => {
      socket.to(toSocketId).emit('webrtc-ice-candidate', {
        fromSocketId: socket.id,
        candidate
      });
    });

    // 3. Media Controls (Camera / Mic State updates)
    socket.on('media-toggle', ({ isAudioOn, isVideoOn }) => {
      const info = activeSockets.get(socket.id);
      if (info) {
        socket.to(info.roomName).emit('user-media-toggled', {
          socketId: socket.id,
          userId: info.user.id,
          isAudioOn,
          isVideoOn
        });
      }
    });

    // 4. Screen Share
    socket.on('screen-share-started', () => {
      const info = activeSockets.get(socket.id);
      if (info) {
        socket.to(info.roomName).emit('user-screen-share-started', {
          socketId: socket.id,
          userId: info.user.id,
          userName: info.user.name || info.user.email
        });
      }
    });

    socket.on('screen-share-stopped', () => {
      const info = activeSockets.get(socket.id);
      if (info) {
        socket.to(info.roomName).emit('user-screen-share-stopped', {
          socketId: socket.id,
          userId: info.user.id
        });
      }
    });

    // 5. Raise Hand
    socket.on('raise-hand', ({ isHandRaised }) => {
      const info = activeSockets.get(socket.id);
      if (info) {
        socket.to(info.roomName).emit('user-raised-hand', {
          socketId: socket.id,
          userId: info.user.id,
          userName: info.user.name || info.user.email,
          isHandRaised
        });
      }
    });

    // 6. Live Chat Messages
    socket.on('send-message', async ({ text }) => {
      try {
        const info = activeSockets.get(socket.id);
        if (!info || !text || !text.trim()) return;

        const senderName = info.user.name || info.user.email || 'Participant';
        const msg = await ChatMessage.create({
          meetingId: info.meetingId,
          sender: info.user.id,
          senderName,
          senderRole: info.user.role || 'student',
          text: text.trim(),
          timestamp: new Date()
        });

        // Broadcast to all participants in room including sender
        liveNamespace.in(info.roomName).emit('new-message', {
          id: msg._id,
          senderId: info.user.id,
          senderName,
          senderRole: info.user.role || 'student',
          text: msg.text,
          timestamp: msg.timestamp
        });
      } catch (chatErr) {
        console.error('send-message error:', chatErr.message);
      }
    });

    // 7. Faculty Controls (End Meeting)
    socket.on('end-meeting', async () => {
      try {
        const info = activeSockets.get(socket.id);
        if (!info) return;

        if (info.user.role !== 'faculty' && info.user.role !== 'admin') {
          return socket.emit('error-msg', 'Unauthorized: Only faculty can end the meeting');
        }

        // Mark LiveClass as ended / completed
        await LiveClass.findOneAndUpdate(
          { meetingId: info.meetingId },
          { status: 'ended', endedAt: new Date(), activeParticipantsCount: 0 }
        );

        // Broadcast meeting-ended event to everyone in the room
        liveNamespace.in(info.roomName).emit('meeting-ended');

        console.log(`Meeting ${info.meetingId} ended by faculty ${info.user.email}`);
      } catch (err) {
        console.error('end-meeting error:', err.message);
      }
    });

    // 7b. Faculty Controls: Mute Participant
    socket.on('mute-participant', ({ targetSocketId }) => {
      const info = activeSockets.get(socket.id);
      if (!info || (info.user.role !== 'faculty' && info.user.role !== 'admin')) {
        return socket.emit('error-msg', 'Unauthorized: Faculty access required');
      }
      liveNamespace.to(targetSocketId).emit('faculty-muted-you');
      socket.to(info.roomName).emit('participant-muted', { socketId: targetSocketId });
    });

    // 7c. Faculty Controls: Remove Participant
    socket.on('remove-participant', ({ targetSocketId }) => {
      const info = activeSockets.get(socket.id);
      if (!info || (info.user.role !== 'faculty' && info.user.role !== 'admin')) {
        return socket.emit('error-msg', 'Unauthorized: Faculty access required');
      }
      liveNamespace.to(targetSocketId).emit('faculty-removed-you');
      socket.to(info.roomName).emit('participant-removed', { socketId: targetSocketId });
    });

    // 8. Disconnect / Leave Room
    const handleDisconnect = async () => {
      const info = activeSockets.get(socket.id);
      if (!info) return;

      const leaveTime = new Date();
      const durationSeconds = Math.round((leaveTime.getTime() - info.joinTime.getTime()) / 1000);

      // Update Attendance record
      try {
        const status = durationSeconds >= 300 ? 'present' : (durationSeconds >= 60 ? 'partial' : 'absent');
        await Attendance.findOneAndUpdate(
          { meetingId: info.meetingId, student: info.user.id, leaveTime: { $exists: false } },
          { leaveTime, durationSeconds, status },
          { sort: { createdAt: -1 } }
        );
      } catch (attErr) {
        console.error('Attendance update error:', attErr.message);
      }

      // Decrement active participants count
      await LiveClass.findOneAndUpdate(
        { meetingId: info.meetingId, activeParticipantsCount: { $gt: 0 } },
        { $inc: { activeParticipantsCount: -1 } }
      );

      // Broadcast user-left to room
      socket.to(info.roomName).emit('user-left', {
        socketId: socket.id,
        userId: info.user.id,
        userName: info.user.name || info.user.email
      });

      activeSockets.delete(socket.id);
      console.log(`User ${info.user.email} left meeting ${info.meetingId}`);
    };

    socket.on('leave-room', handleDisconnect);
    socket.on('disconnect', handleDisconnect);
  });
}

module.exports = { initLiveClassSocket };

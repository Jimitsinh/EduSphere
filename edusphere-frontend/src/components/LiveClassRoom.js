import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MessageSquare,
  Users,
  Hand,
  PhoneOff,
  Send,
  X,
  Shield,
  Clock,
  AlertCircle,
  Sparkles,
  CheckCircle,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5050';

export default function LiveClassRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Meeting Details
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Media Controls
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Side Drawers
  const [activeDrawer, setActiveDrawer] = useState(null); // 'chat' | 'participants' | null
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Participants & Streams
  const [participants, setParticipants] = useState([]); // [{ socketId, user, isAudioOn, isVideoOn, isHandRaised, stream }]
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnections = useRef(new Map()); // socketId -> RTCPeerConnection

  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  // 1. Initialize Local Media Stream
  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsVideoOn(true);
      setIsAudioOn(true);
    } catch (err) {
      console.warn('Camera/Mic permission denied or unavailable:', err.message);
      setIsVideoOn(false);
      setIsAudioOn(false);
    }
  }, []);

  // 2. Fetch Meeting Info & Connect Socket
  useEffect(() => {
    let mounted = true;

    async function setupMeeting() {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/live/${meetingId}`);
        if (!mounted) return;

        setMeeting(res.data.meeting);

        // Fetch Chat History
        try {
          const chatRes = await axios.get(`${API_BASE}/api/live/${meetingId}/chat`);
          if (mounted) setChatMessages(chatRes.data);
        } catch (chatErr) {
          console.warn('Failed to load chat history:', chatErr.message);
        }

        await initLocalStream();

        // Connect Socket.IO to /live namespace
        const socket = io(`${API_BASE}/live`, {
          transports: ['websocket', 'polling']
        });
        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('[Socket] Connected to live namespace');
          socket.emit('join-room', { meetingId, user });
        });

        // Event: Existing Participants in Room
        socket.on('existing-participants', (existingList) => {
          existingList.forEach(({ socketId, user: peerUser }) => {
            createPeerConnection(socketId, peerUser, true);
          });
        });

        // Event: New User Joined Room
        socket.on('user-joined', ({ socketId, user: newUser }) => {
          setParticipants((prev) => {
            if (prev.some((p) => p.socketId === socketId)) return prev;
            return [...prev, { socketId, user: newUser, isAudioOn: true, isVideoOn: true, isHandRaised: false }];
          });
        });

        // WebRTC Signaling: Offer
        socket.on('webrtc-offer', async ({ fromSocketId, fromUser, offer }) => {
          let pc = peerConnections.current.get(fromSocketId);
          if (!pc) {
            pc = createPeerConnection(fromSocketId, fromUser, false);
          }
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc-answer', { toSocketId: fromSocketId, answer });
        });

        // WebRTC Signaling: Answer
        socket.on('webrtc-answer', async ({ fromSocketId, answer }) => {
          const pc = peerConnections.current.get(fromSocketId);
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        // WebRTC Signaling: ICE Candidate
        socket.on('webrtc-ice-candidate', async ({ fromSocketId, candidate }) => {
          const pc = peerConnections.current.get(fromSocketId);
          if (pc && candidate) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.error('ICE candidate error:', e);
            }
          }
        });

        // Media Toggles
        socket.on('user-media-toggled', ({ socketId, isAudioOn: peerAudio, isVideoOn: peerVideo }) => {
          setParticipants((prev) =>
            prev.map((p) => (p.socketId === socketId ? { ...p, isAudioOn: peerAudio, isVideoOn: peerVideo } : p))
          );
        });

        // Hand Raised
        socket.on('user-raised-hand', ({ socketId, isHandRaised: peerHand }) => {
          setParticipants((prev) =>
            prev.map((p) => (p.socketId === socketId ? { ...p, isHandRaised: peerHand } : p))
          );
        });

        // Chat Message
        socket.on('new-message', (msg) => {
          setChatMessages((prev) => [...prev, msg]);
        });

        // Muted by Faculty
        socket.on('faculty-muted-you', () => {
          if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) audioTrack.enabled = false;
          }
          setIsAudioOn(false);
          alert('You have been muted by the faculty.');
        });

        // Removed by Faculty
        socket.on('faculty-removed-you', () => {
          alert('You have been removed from the class by the faculty.');
          navigate('/live');
        });

        // User Left
        socket.on('user-left', ({ socketId }) => {
          if (peerConnections.current.has(socketId)) {
            peerConnections.current.get(socketId).close();
            peerConnections.current.delete(socketId);
          }
          setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
        });

        setLoading(false);
      } catch (err) {
        console.error('Setup meeting error:', err);
        setError(err.response?.data?.msg || 'Failed to connect to live class');
        setLoading(false);
      }
    }

    setupMeeting();

    return () => {
      mounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      if (socketRef.current) {
        socketRef.current.emit('leave-room');
        socketRef.current.disconnect();
      }
    };
  }, [meetingId, user, initLocalStream, navigate]);

  // Create RTCPeerConnection helper
  const createPeerConnection = (targetSocketId, targetUser, isInitiator) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnections.current.set(targetSocketId, pc);

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc-ice-candidate', {
          toSocketId: targetSocketId,
          candidate: event.candidate
        });
      }
    };

    // Handle Remote Stream
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      setParticipants((prev) => {
        const existing = prev.find((p) => p.socketId === targetSocketId);
        if (existing) {
          return prev.map((p) => (p.socketId === targetSocketId ? { ...p, stream: remoteStream } : p));
        }
        return [...prev, { socketId: targetSocketId, user: targetUser, stream: remoteStream, isAudioOn: true, isVideoOn: true }];
      });
    };

    // Initiate offer if initiator
    if (isInitiator) {
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          socketRef.current.emit('webrtc-offer', {
            toSocketId: targetSocketId,
            offer: pc.localDescription
          });
        })
        .catch((e) => console.error('Error creating offer:', e));
    }

    return pc;
  };

  // Toggle Audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
        setIsAudioOn(!isAudioOn);
        if (socketRef.current) {
          socketRef.current.emit('media-toggle', { isAudioOn: !isAudioOn, isVideoOn });
        }
      }
    }
  };

  // Toggle Video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
        if (socketRef.current) {
          socketRef.current.emit('media-toggle', { isAudioOn, isVideoOn: !isVideoOn });
        }
      }
    }
  };

  // Screen Sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop Screen Share
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      setIsScreenSharing(false);
      if (socketRef.current) socketRef.current.emit('screen-share-stopped');
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);
        if (socketRef.current) socketRef.current.emit('screen-share-started');

        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (socketRef.current) socketRef.current.emit('screen-share-stopped');
        };
      } catch (err) {
        console.warn('Screen share cancelled:', err.message);
      }
    }
  };

  // Raise Hand
  const toggleRaiseHand = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    if (socketRef.current) {
      socketRef.current.emit('raise-hand', { isHandRaised: nextState });
    }
  };

  // Send Chat Message
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketRef.current) return;
    socketRef.current.emit('send-message', { text: chatInput });
    setChatInput('');
  };

  // Faculty Mute Participant
  const handleMuteParticipant = (targetSocketId) => {
    if (socketRef.current) {
      socketRef.current.emit('mute-participant', { targetSocketId });
    }
  };

  // Faculty Remove Participant
  const handleRemoveParticipant = (targetSocketId) => {
    if (window.confirm('Are you sure you want to remove this participant from the live class?')) {
      if (socketRef.current) {
        socketRef.current.emit('remove-participant', { targetSocketId });
      }
    }
  };

  // Leave / End Meeting
  const handleLeaveOrEnd = () => {
    if (isFaculty) {
      if (window.confirm('Are you sure you want to end this class for all participants?')) {
        if (socketRef.current) socketRef.current.emit('end-meeting');
        navigate('/live');
      }
    } else {
      if (socketRef.current) socketRef.current.emit('leave-room');
      navigate('/live');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a', color: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles className="spin" size={40} style={{ color: 'var(--primary-red)', marginBottom: '16px' }} />
          <h3>Connecting to Live Classroom...</h3>
          <p style={{ color: '#a0a0a0', fontSize: '14px' }}>Setting up encrypted WebRTC peer connections</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1ede4', padding: '24px' }}>
        <div className="card" style={{ maxWidth: '480px', textAlign: 'center', padding: '40px' }}>
          <AlertCircle size={48} style={{ color: '#cc3333', marginBottom: '16px' }} />
          <h2>Unable to Join Meeting</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
          <button className="btn btn-red" onClick={() => navigate('/live')}>Return to Live Classes</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ── Top Bar ── */}
      <header style={{ height: '60px', backgroundColor: '#1e1e1e', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ backgroundColor: '#cc3333', color: '#ffffff', fontSize: '10px', fontWeight: '800', padding: '4px 8px', borderRadius: '4px', letterSpacing: '0.08em' }}>● LIVE</span>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: '#ffffff' }}>{meeting?.title || 'EduSphere Live Classroom'}</h4>
            <span style={{ fontSize: '11px', color: '#a0a0a0' }}>{meeting?.courseName || 'Course'} · {meeting?.topic || 'Lecture'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Class joining link copied to clipboard!');
            }}
            style={{ backgroundColor: '#2a2a2a', border: '1px solid #333', color: '#e0e0e0', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
          >
            <Sparkles size={14} style={{ color: 'var(--primary-red)' }} />
            <span>Copy Class Link</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#a0a0a0', backgroundColor: '#2a2a2a', padding: '6px 12px', borderRadius: '20px' }}>
            <Users size={15} />
            <span>{participants.length + 1} Connected</span>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#a0a0a0', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
      </header>

      {/* ── Main Conference Body ── */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Video Grid */}
        <div style={{ flex: 1, padding: '20px', display: 'grid', gridTemplateColumns: participants.length > 0 ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr', gap: '16px', alignContent: 'center', overflowY: 'auto' }}>
          
          {/* Local User Tile */}
          <div style={{ position: 'relative', backgroundColor: '#1e1e1e', borderRadius: '16px', overflow: 'hidden', border: isHandRaised ? '2px solid #ffb703' : '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
            {isVideoOn ? (
              <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700' }}>
                  {(user?.name || user?.email || 'U')[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '14px', color: '#a0a0a0' }}>Camera Off</span>
              </div>
            )}

            {/* User Label Badge */}
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span>{user?.name || user?.email} (You)</span>
              {isFaculty && <Crown size={12} style={{ color: '#ffb703' }} />}
              {!isAudioOn && <MicOff size={13} style={{ color: '#ff5a4c' }} />}
              {isHandRaised && <Hand size={13} style={{ color: '#ffb703' }} />}
            </div>
          </div>

          {/* Remote Participants Tiles */}
          {participants.map((p) => (
            <RemoteParticipantTile key={p.socketId} participant={p} isFaculty={isFaculty} onMute={handleMuteParticipant} onRemove={handleRemoveParticipant} />
          ))}

        </div>

        {/* ── Side Drawer (Chat or Participants) ── */}
        {activeDrawer && (
          <aside style={{ width: '340px', backgroundColor: '#1e1e1e', borderLeft: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '56px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#ffffff' }}>
                {activeDrawer === 'chat' ? 'In-Class Chat' : `Participants (${participants.length + 1})`}
              </h4>
              <button onClick={() => setActiveDrawer(null)} style={{ background: 'none', border: 'none', color: '#a0a0a0', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Chat Drawer Content */}
            {activeDrawer === 'chat' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden' }}>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                  {chatMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#7a7670', fontSize: '13px', margin: 'auto' }}>
                      No messages yet. Send a message to class!
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div key={i} style={{ backgroundColor: '#2a2a2a', padding: '10px 14px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: msg.senderRole === 'faculty' ? '#ffb703' : 'var(--primary-red)' }}>
                            {msg.senderName} {msg.senderRole === 'faculty' && '(Faculty)'}
                          </span>
                          <span style={{ fontSize: '10px', color: '#7a7670' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#e0e0e0', wordBreak: 'break-word' }}>{msg.text}</p>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    style={{ flex: 1, backgroundColor: '#2a2a2a', border: '1px solid #333', borderRadius: '20px', padding: '10px 16px', color: '#fff', fontSize: '13px', outline: 'none' }}
                  />
                  <button type="submit" style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--primary-red)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}

            {/* Participants Drawer Content */}
            {activeDrawer === 'participants' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                {/* You */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#2a2a2a', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                      {(user?.name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{user?.name || user?.email} (You)</div>
                      <span style={{ fontSize: '10px', color: '#a0a0a0', textTransform: 'capitalize' }}>{user?.role}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {isAudioOn ? <Mic size={16} style={{ color: '#22863a' }} /> : <MicOff size={16} style={{ color: '#cc3333' }} />}
                    {isVideoOn ? <Video size={16} style={{ color: '#22863a' }} /> : <VideoOff size={16} style={{ color: '#cc3333' }} />}
                  </div>
                </div>

                {/* Remote Participants */}
                {participants.map((p) => (
                  <div key={p.socketId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#222222', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' }}>
                        {(p.user?.name || p.user?.email || 'P')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{p.user?.name || p.user?.email}</div>
                        <span style={{ fontSize: '10px', color: '#a0a0a0', textTransform: 'capitalize' }}>{p.user?.role || 'student'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {p.isHandRaised && <Hand size={16} style={{ color: '#ffb703' }} />}
                      {p.isAudioOn ? <Mic size={16} style={{ color: '#22863a' }} /> : <MicOff size={16} style={{ color: '#cc3333' }} />}
                      {isFaculty && (
                        <>
                          <button
                            onClick={() => handleMuteParticipant(p.socketId)}
                            style={{ backgroundColor: '#2a2a2a', border: '1px solid #333', color: '#ff5a4c', borderRadius: '4px', padding: '3px 6px', fontSize: '10px', cursor: 'pointer', fontWeight: '700' }}
                          >
                            Mute
                          </button>
                          <button
                            onClick={() => handleRemoveParticipant(p.socketId)}
                            style={{ backgroundColor: '#cc3333', border: 'none', color: '#ffffff', borderRadius: '4px', padding: '3px 6px', fontSize: '10px', cursor: 'pointer', fontWeight: '700' }}
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>

      {/* ── Bottom Floating Control Bar ── */}
      <footer style={{ height: '76px', backgroundColor: '#1e1e1e', borderTop: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '0 24px', zIndex: 10 }}>
        {/* Mic Toggle */}
        <button
          onClick={toggleAudio}
          style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: isAudioOn ? '#2a2a2a' : '#cc3333', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
          title={isAudioOn ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={toggleVideo}
          style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: isVideoOn ? '#2a2a2a' : '#cc3333', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
          title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: isScreenSharing ? 'var(--primary-red)' : '#2a2a2a', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
          title="Present Screen"
        >
          <Monitor size={20} />
        </button>

        {/* Raise Hand */}
        <button
          onClick={toggleRaiseHand}
          style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: isHandRaised ? '#ffb703' : '#2a2a2a', border: 'none', color: isHandRaised ? '#1a1a1a' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
          title="Raise Hand"
        >
          <Hand size={20} />
        </button>

        {/* Chat Drawer Toggle */}
        <button
          onClick={() => setActiveDrawer(activeDrawer === 'chat' ? null : 'chat')}
          style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: activeDrawer === 'chat' ? 'var(--primary-red)' : '#2a2a2a', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
          title="Toggle Chat"
        >
          <MessageSquare size={20} />
        </button>

        {/* Participants Drawer Toggle */}
        <button
          onClick={() => setActiveDrawer(activeDrawer === 'participants' ? null : 'participants')}
          style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: activeDrawer === 'participants' ? 'var(--primary-red)' : '#2a2a2a', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
          title="View Participants"
        >
          <Users size={20} />
        </button>

        {/* Leave / End Meeting Button */}
        <button
          onClick={handleLeaveOrEnd}
          style={{ padding: '0 24px', height: '48px', borderRadius: '24px', backgroundColor: '#cc3333', border: 'none', color: '#fff', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginLeft: '12px' }}
        >
          <PhoneOff size={18} />
          <span>{isFaculty ? 'END CLASS' : 'LEAVE'}</span>
        </button>
      </footer>
    </div>
  );
}

// Remote Participant Video Tile Helper
function RemoteParticipantTile({ participant, isFaculty, onMute, onRemove }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div style={{ position: 'relative', backgroundColor: '#1e1e1e', borderRadius: '16px', overflow: 'hidden', border: participant.isHandRaised ? '2px solid #ffb703' : '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '260px' }}>
      {participant.stream && participant.isVideoOn !== false ? (
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#333333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700' }}>
            {(participant.user?.name || participant.user?.email || 'P')[0].toUpperCase()}
          </div>
          <span style={{ fontSize: '14px', color: '#a0a0a0' }}>{participant.user?.name || participant.user?.email}</span>
        </div>
      )}

      {/* User Info Overlay */}
      <div style={{ position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
        <span>{participant.user?.name || participant.user?.email}</span>
        {!participant.isAudioOn && <MicOff size={13} style={{ color: '#ff5a4c' }} />}
        {participant.isHandRaised && <Hand size={13} style={{ color: '#ffb703' }} />}
      </div>

      {/* Faculty Quick Controls Overlay */}
      {isFaculty && (
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
          <button
            onClick={() => onMute && onMute(participant.socketId)}
            style={{ backgroundColor: 'rgba(0,0,0,0.75)', border: '1px solid #444', color: '#ffb703', borderRadius: '12px', padding: '4px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
            title="Mute Student"
          >
            Mute
          </button>
          <button
            onClick={() => onRemove && onRemove(participant.socketId)}
            style={{ backgroundColor: 'rgba(204,51,51,0.85)', border: 'none', color: '#ffffff', borderRadius: '12px', padding: '4px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
            title="Remove Student"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

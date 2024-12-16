"use client";

import { useEffect, useRef, useState } from 'react';
import { signalServerAdress } from '../Components/constants';
import { FriendList } from '../Components/friendsWindow';
import { getById, getCookie } from '../Services/users';
import { UUID } from 'crypto';
import { Button } from 'antd';
import styles from "../page.module.css";

const VideoCall: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  const [otherUserId, setOtherUserId] = useState<UUID>('4b9adb19-5fe0-43d8-956a-2b63c7d8cb77');
  const [myId, setMyId] = useState<string>('');
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const [incomingCall, setIncomingCall] = useState<{ fromUserId: UUID; offer: RTCSessionDescriptionInit; name: string } | null>(null);

  const startVideo = async (): Promise<MediaStream | undefined> => {
    if (stream) {
      console.log('Медиа-устройства уже инициализированы');
      return stream;
    }
    try {
      console.log('Запрос доступа к медиа-устройствам...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log('Доступ к медиа-устройствам получен');
      
      setStream(mediaStream);
      if (myVideoRef.current) {
        myVideoRef.current.srcObject = mediaStream;
      }
      return mediaStream;
    } catch (err) {
      console.error('Ошибка при доступе к медиа-устройствам:', err);
      alert('Не удалось получить доступ к камере или микрофону.');
      return undefined;
    }
  };

  const createPeerConnection = (currentStream: MediaStream, otherUserId: string) => {
    if (peerConnection.current) {
      console.log('RTCPeerConnection уже существует, переиспользуем...');
      return peerConnection.current;
    }
    if (!currentStream) {
      console.error("Нет доступа к медиа-потоку");
      return null;
    }

    if (!otherUserId) {
      console.error("ID собеседника не указан");
      return null;
    }

    console.log('Создание RTCPeerConnection...');
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      iceCandidatePoolSize: 2
    });


    currentStream.getTracks().forEach(track => {
      console.log('Добавление трека:', track.kind);
      pc.addTrack(track, currentStream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate != null) {
        console.log('Отправка ICE кандидата');
        sendIceCandidate(event.candidate);
      }
      else{
        console.log('Кандидаты закончились');
      }
    };

    pc.ontrack = (event) => {
      console.log('Получен медиа-поток собеседника');
      if (userVideoRef.current && event.streams[0]) {
        const videoElement = userVideoRef.current;
        if (videoElement.srcObject !== event.streams[0]) {
          console.log('Обновление медиа-потока для видео собеседника');
          videoElement.srcObject = event.streams[0];
          videoElement.onloadedmetadata = () => {
            videoElement.play().catch((error) => {
              console.error('Ошибка воспроизведения видео собеседника:', error);
            });
          };
        }
      }
    };

    peerConnection.current = pc;
    return pc;
  };


  const monitorStats = async (pc: RTCPeerConnection) => {
    const stats = await pc.getStats();
    stats.forEach(report => {
      if (report.type === 'outbound-rtp' && report.kind === 'video') {
        console.log('Видео отправляется:', {
          packetsSent: report.packetsSent,
          bytesSent: report.bytesSent,
          frameRate: report.framesPerSecond,
        });
      }
      if (report.type === 'inbound-rtp' && report.kind === 'video') {
        console.log('Видео получено:', {
          packetsReceived: report.packetsReceived,
          bytesReceived: report.bytesReceived,
          frameRate: report.framesPerSecond,
        });
      }
    });
  };

  useEffect(() => {
    if (otherUserId && stream) {
      const pc = createPeerConnection(stream, otherUserId);
      if (pc) {
        console.log('Peer connection создан');
      } else {
        console.error('Не удалось создать peer connection (IN 2)');
      }
    }
  }, [otherUserId, stream]);

  // Кусок легаси
  function generateRandomUsername() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 8;  // Длина никнейма
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  const fetchMyId = async () => {
  if (myId) {
    console.log('ID уже получен:', myId);
    return;
  }

  const randomUsername = generateRandomUsername();
  console.log(`Генерируем случайный никнейм: ${randomUsername}`);
  const cookie = await getCookie('something');
  console.log(`На самом деле используем userId из кук: ${cookie.userId}`);
  try {
    const response = await fetch(`${signalServerAdress}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: cookie.userId }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Пользователь зарегистрирован с ID:', data.id);
      setMyId(data.id);
    } else {
      console.error('Не удалось зарегистрировать пользователя');
    }
  } catch (error) {
    console.error('Ошибка при регистрации пользователя:', error);
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Функции для отправки сигналов
  const sendOffer = async (offer: RTCSessionDescriptionInit) => {
    try {
      await fetch(`${signalServerAdress}/offer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offer: offer,
          to: otherUserId,
          from: myId,
        }),
      });
    } catch (error) {
      console.error('Ошибка при отправке предложения:', error);
    }
  };

  const sendAnswer = async (answer: RTCSessionDescriptionInit, otherUserId: string) => {
    try {
      await fetch(`${signalServerAdress}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: answer,
          to: otherUserId,
          from: myId,
        }),
      });
    } catch (error) {
      console.error('Ошибка при отправке ответа:', error);
    }
  };
  
  const sendIceCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      await fetch(`${signalServerAdress}/candidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate: candidate,
          to: otherUserId,
          from: myId,
        }),
      });
    } catch (error) {
      console.error('Ошибка при отправке ICE кандидата:', error);
    }
  };

  const getSignalFromServer = async () => {
    try {
      const response = await fetch(`${signalServerAdress}/signal/${myId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.offer) handleOffer(data.offer, data.fromUserId);
        if (data.answer) handleAnswer(data.answer);
        if (data.candidate) handleCandidate(data.candidate);
      }
    } catch (error) {
      console.error('Ошибка при получении сигнала:', error);
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit, fromUserId: UUID) => {
    console.log('Получено предложение звонка от:', fromUserId);
    const userData = await getById(fromUserId);
    const name = userData.name;
    setIncomingCall({ fromUserId, offer, name});
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    const { offer, fromUserId } = incomingCall;
    setOtherUserId(fromUserId);

    try {
      let currentStream = stream;
      if (!currentStream) {
        currentStream = await startVideo();
        if (!currentStream) {
          throw new Error('Не удалось получить доступ к медиа-устройствам');
        }
      }
      const pc = createPeerConnection(currentStream, fromUserId);
      if (!pc) {
        throw new Error('Не удалось создать peer connection');
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      if (pendingCandidates.current.length > 0) {
        console.log('Добавление буферизованных ICE кандидатов');
        pendingCandidates.current.forEach(async (pendingCandidate) => {
          try {
            await peerConnection.current?.addIceCandidate(pendingCandidate);
          } catch (err) {
            console.error('Ошибка при добавлении буферизованного ICE кандидата:', err);
          }
        });
        pendingCandidates.current = [];
      }
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendAnswer(answer, fromUserId);
    } catch (err) {
      console.error('Ошибка при обработке предложения звонка:', err);
      alert('Не удалось ответить на звонок: ' + (err instanceof Error ? err.message : 'неизвестная ошибка'));
    }
    setIncomingCall(null); // Скрываем окно
  };

  const rejectCall = () => {
    console.log('Звонок отклонен');
    setIncomingCall(null); // Скрываем окно
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    console.log('Получен ответ на звонок');
    if (!peerConnection.current) {
      console.error('PeerConnection не существует');
      return;
    }
    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      if (pendingCandidates.current.length > 0) {
        console.log('Добавление буферизованных ICE кандидатов');
        pendingCandidates.current.forEach(async (pendingCandidate) => {
          try {
            await peerConnection.current?.addIceCandidate(pendingCandidate);
          } catch (err) {
            console.error('Ошибка при добавлении буферизованного ICE кандидата:', err);
          }
        });
        pendingCandidates.current = [];
      }
      
    } catch (err) {
      console.error('Ошибка при обработке ответа:', err);
    }
  };

  const handleCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection.current || !peerConnection.current.remoteDescription) {
      console.log('Буферизация кандидата до установки remoteDescription');
      pendingCandidates.current.push(new RTCIceCandidate(candidate));
      return;
    }
    try {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Ошибка при добавлении ICE кандидата:', err);
    }
  };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    setInterval(() => {
      checkConnectionState();
      if (peerConnection.current) {
        monitorStats(peerConnection.current);
      }
    }, 1000);

    if (!myId) {  // Проверяем, если ID ещё не получен, только тогда отправляем запрос
      fetchMyId();
    }
  
    const interval = setInterval(getSignalFromServer, 1000); // Периодический запрос для получения сигналов
    return () => clearInterval(interval);
  }, [myId]);

  const startCall = async (id: UUID) => {
    setOtherUserId(id);
    if (!otherUserId) {
      console.error("ID собеседника не указан (in startCall)");
      return;
    }

    try {
      let currentStream = stream;
      if (!currentStream) {
        currentStream = await startVideo();
        if (!currentStream) {
          throw new Error('Не удалось получить доступ к медиа-устройствам');
        }
      }
      console.log('ID');
      console.log(id);
      const pc = createPeerConnection(currentStream, id);
      
      if (!pc) {
        throw new Error('Не удалось создать peer connection');
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendOffer(offer);
    }catch (err) {
      console.error('Ошибка при создании предложения:', err);
    }
  };

  
  const checkConnectionState = () => {
    if (peerConnection.current) {
      const connectionState = peerConnection.current.iceConnectionState;
      console.log("Состояние ICE соединения:", connectionState);
  
      if (connectionState === "connected") {
        console.log("Соединение установлено. Можно отправлять видео.");
      } else {
        console.log("Соединение не установлено, состояние:", connectionState);
      }
    }
  };
  

  return (
    <div className={styles.fullscreen_div}>
      {incomingCall && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-md text-center">
            <h2 className="text-xl font-bold mb-4">Входящий звонок</h2>
            <p>От пользователя: {incomingCall.name}</p>
            <div className="mt-4 flex gap-4 justify-center">
              <Button
                onClick={acceptCall}
                type="primary"
              >
                Принять
              </Button>
              <Button
                onClick={rejectCall}
                danger
                className={styles.reject_call_button}
              >
                Отклонить
              </Button>
            </div>
          </div>
        </div>)}
      <div>
      <FriendList onButtonClick={(id) => startCall(id)}>

      </FriendList>
      </div>
      <h2 className="text-2xl mb-4">Видеозвонок</h2>
      <div className={styles.video_block_wrapper}>
        <div className="grid grid-cols-2 gap-4">
          <div className={styles.video_block_div}>
            <h3 className="text-lg mb-2"></h3>
            <video
              ref={userVideoRef}
              playsInline
              className={styles.other_user_video_block}
            />
          </div>
        </div>
        <div className={styles.video_block_div}>
            <h3 className="text-lg mb-2"></h3>  
            <video
              ref={myVideoRef}
              autoPlay
              playsInline
              muted
              className={styles.my_video_block}
            />
        </div>
      </div>
      <div>
        {peerConnection.current ? (
          <Button danger onClick={() => location.reload()}>Завершить звонок</Button>
        ) : null}     
      </div>
      <footer className={styles.footer}>
      <div className="mt-4 text-sm text-gray-600">
        Статус соединения: {peerConnection.current?.iceConnectionState || 'не подключено'}
      </div>
      </footer>
    </div>
  );
};

export default VideoCall;

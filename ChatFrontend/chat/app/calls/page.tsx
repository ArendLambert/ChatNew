"use client";

import { useEffect, useRef, useState } from 'react';
import { signalServerAdress } from '../Components/constants'; // Предполагаем, что используется https

const VideoCall = () => {
  const [stream, setStream] = useState<MediaStream | undefined>(undefined);
  const [otherUserId, setOtherUserId] = useState<string>('');
  const [myId, setMyId] = useState<string>('');
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  const userVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

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
    // Проверяем, если есть и stream и otherUserId
    if (otherUserId && stream) {
      const pc = createPeerConnection(stream, otherUserId);
      if (pc) {
        console.log('Peer connection создан');
      } else {
        console.error('Не удалось создать peer connection (IN 2)');
      }
    }
  }, [otherUserId, stream]);  // Зависят от stream и otherUserId

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
    return;  // Если ID уже получен, не выполняем запрос
  }

  const randomUsername = generateRandomUsername();
  console.log(`Генерируем случайный никнейм: ${randomUsername}`);
  
  try {
    const response = await fetch(`${signalServerAdress}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: randomUsername }),
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

  // Функции для отправки сигналов через HTTP
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
          from: myId,  // Передаем ID отправителя
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
          from: myId,  // Передаем ID отправителя
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
          from: myId,  // Передаем ID отправителя
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

  const handleOffer = async (offer: RTCSessionDescriptionInit, fromUserId: string) => {
    console.log('Получено предложение звонка от:', fromUserId);
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
        pendingCandidates.current = []; // Очищаем буфер
      }
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendAnswer(answer, fromUserId);
    } catch (err) {
      console.error('Ошибка при обработке предложения звонка:', err);
      alert('Не удалось ответить на звонок: ' + (err instanceof Error ? err.message : 'неизвестная ошибка'));
    }
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
        pendingCandidates.current = []; // Очищаем буфер
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

  const startCall = async () => {
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

      const pc = createPeerConnection(currentStream, otherUserId);
      
      if (!pc) {
        throw new Error('Не удалось создать peer connection');
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendOffer(offer);
    } catch (err) {
      console.error('Ошибка при создании предложения:', err);
    }
  };

  const handlePeerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherUserId(e.target.value);
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
    <div className="p-4">
      <h2 className="text-2xl mb-4">Видеозвонок</h2>
      <div className="mb-4">
        <label className="block">Ваш ID: {myId}</label>
      </div>
      <div className="mb-4">
        <label className="block">
          ID собеседника:
          <input
            type="text"
            value={otherUserId}
            onChange={handlePeerIdChange}
            className="border p-2 ml-2"
          />
        </label>
      </div>
      <div className="flex gap-4 mb-4">
        <button
          onClick={startVideo}
          disabled={!!stream}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {stream ? 'Камера включена' : 'Включить камеру'}
        </button>
        <button
          onClick={startCall}
          disabled={!stream || !otherUserId}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Позвонить
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="w-full">
          <h3 className="text-lg mb-2">Ваше видео</h3>
          <video
            ref={myVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-[360px] border bg-gray-100 object-cover"
          />
        </div>
        <div className="w-full">
          <h3 className="text-lg mb-2">Видео собеседника</h3>
          <video
            ref={userVideoRef}
            playsInline
            className="w-full h-[360px] border bg-gray-100 object-cover"
          />
        </div>
      </div>
    
      
      <div className="mt-4 text-sm text-gray-600">
        Статус соединения: {peerConnection.current?.iceConnectionState || 'не подключено'}
      </div>
    </div>
  );
};

export default VideoCall;

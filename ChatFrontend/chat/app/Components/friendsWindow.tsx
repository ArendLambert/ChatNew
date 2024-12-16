import React, { useEffect, useState } from 'react';
import { Form, Input, Button, List, Space } from 'antd';
import styles from '../page.module.css';
import { createPair, getByFriendId, isInitiator, updatePair, getByIdPair } from '../Services/friendsPair';
import { getByEmail, getById, getCookie } from '../Services/users';
import { UUID } from 'crypto';

interface ChildProps {
  onButtonClick: (id: UUID) => void;
}

export const FriendList: React.FC<ChildProps> = ({ onButtonClick }) => {
  const [friends, setFriends] = useState<
    { id: UUID; name: string; email: string; cancel: boolean; confirm: boolean; isInitiator: boolean}[]
  >([]);

  useEffect(() => {
    const cookie = getCookie("something");
    const interval = setInterval(async () => {
      try {
        const response = await getByFriendId(cookie.userId); // Ожидаем массив объектов
        const response2 = await getByIdPair(cookie.userId);
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // ДОБАВТЬ ЗАМЕНУ ПОЧТЫ НА ДРУГУЮ И ДОБАВЛЕНИЕ ПОСЛЕ РЕШЕНИЯ
        if (Array.isArray(response) && Array.isArray(response2)) {
          const allResponses = [...response, ...response2];
          // Фильтрация и сортировка массива
          const filteredAndSortedResponse = allResponses
            .filter((pair: { cancel: boolean; confirm: boolean }) => !pair.cancel) // Исключаем запросы с cancel === true
            .sort((a: { confirm: boolean }, b: { confirm: boolean }) => {
              // Ставим запросы с confirm === false перед confirm === true
              if (!a.confirm && b.confirm) return -1;
              if (a.confirm && !b.confirm) return 1;
              return 0;
            });

          const newFriends = await Promise.all(
            filteredAndSortedResponse.map(async (pair: { idUser: UUID; idFriend: UUID; cancel: boolean; confirm: boolean }) => {
              const cookie = await getCookie("something");
              if(pair.idUser === cookie.userId){
                const friendDetails = await getById(pair.idFriend);
                const isInitiatorRender = await isInitiator(cookie.userId, friendDetails.id)
                return {
                  id: friendDetails.id,
                  name: friendDetails.name,
                  email: friendDetails.email,
                  cancel: pair.cancel,
                  confirm: pair.confirm,
                  isInitiator: isInitiatorRender,
                };
              }else{
                const friendDetails = await getById(pair.idUser);
                const isInitiatorRender = await isInitiator(cookie.userId, friendDetails.id)
                return {
                  id: friendDetails.id,
                  name: friendDetails.name,
                  email: friendDetails.email,
                  cancel: pair.cancel,
                  confirm: pair.confirm,
                  isInitiator: isInitiatorRender,
                };
              }          
            })
          );

        setFriends(newFriends);
        } else {
          console.error("Ожидался массив, но получено:", response);
        }
        
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  interface friendsPairRequest {
    userId: UUID;
    friendId: UUID;
    confirm: boolean;
    cancel: boolean;
  }

  interface FormValues {
    email: string;
  }

  const handleAccept = async (id: UUID) => {
    const cookie = await getCookie("something");
    const isInitiatorBool = await isInitiator(cookie.userId, id);
    if(isInitiatorBool){
      const pairData = await getByFriendId(id);
      if (Array.isArray(pairData)) {
        const pair = pairData.find(
          (p: { idUser: UUID; idFriend: UUID, cancel: boolean, confirm: boolean}) =>
            p.idFriend === id && p.idUser === cookie.userId && p.cancel === false && p.confirm === false
        );
        const requestBase = {
          userId: cookie.userId,
          friendId: id,
          confirm: true,
          cancel: false,
        };
        await updatePair(requestBase, pair.idPair);
        console.log(`Запрос успешно принят для ${id}`);
    }
    }else{
      const pairData = await getByFriendId(cookie.userId);
      if (Array.isArray(pairData)) {
        const pair = pairData.find(
          (p: { idUser: UUID; idFriend: UUID, cancel: boolean, confirm: boolean}) =>
            p.idFriend === cookie.userId && p.idUser === id && p.cancel === false && p.confirm === false
        );
        const requestBase = {
          userId: id,
          friendId: cookie.userId,
          confirm: true,
          cancel: false,
        };
        await updatePair(requestBase, pair.idPair);
        console.log(`Запрос успешно принят для ${id}`);
    }
    }
  };

  const handleReject = async (id: UUID) => {

    const cookie = await getCookie("something");
    const isInitiatorBool = await isInitiator(cookie.userId, id);
    if(isInitiatorBool){
      const pairData = await getByFriendId(id);
      if (Array.isArray(pairData)) {
        const pair = pairData.find(
          (p: { idUser: UUID; idFriend: UUID, cancel: boolean, confirm: boolean}) =>
            p.idFriend === id && p.idUser === cookie.userId && p.cancel === false && p.confirm === false
        );
        const requestBase = {
          userId: cookie.userId,
          friendId: id,
          confirm: false,
          cancel: true,
        };
        await updatePair(requestBase, pair.idPair);
        console.log(`Запрос отклонен для ${id}`);
    }
    }else{
      const pairData = await getByFriendId(cookie.userId);
      if (Array.isArray(pairData)) {
        const pair = pairData.find(
          (p: { idUser: UUID; idFriend: UUID, cancel: boolean, confirm: boolean}) =>
            p.idFriend === cookie.userId && p.idUser === id && p.cancel === false && p.confirm === false
        );
        const requestBase = {
          userId: id,
          friendId: cookie.userId,
          confirm: false,
          cancel: true,
        };
        await updatePair(requestBase, pair.idPair);
        console.log(`Запрос отклонен для ${id}`);
    }
    }
  };


  const handleDelete = async (id: UUID) => {
    setFriends((friends) => friends.filter((friend) => friend.id !== id));
    const cookie = await getCookie("something");
    const isInitiatorBool = await isInitiator(cookie.userId, id);
    if(isInitiatorBool){
      const pairData = await getByFriendId(id);
      if (Array.isArray(pairData)) {
        const pair = pairData.find(
          (p: { idUser: UUID; idFriend: UUID, cancel: boolean, confirm: boolean}) =>
            p.idFriend === id && p.idUser === cookie.userId && p.cancel === false && p.confirm === true
        );
        const requestBase = {
          userId: cookie.userId,
          friendId: id,
          confirm: true,
          cancel: true,
        };
        await updatePair(requestBase, pair.idPair);
        console.log(`${id} удален из друзей`);
    }
    }else{
      const pairData = await getByFriendId(cookie.userId);
      if (Array.isArray(pairData)) {
        const pair = pairData.find(
          (p: { idUser: UUID; idFriend: UUID, cancel: boolean, confirm: boolean}) =>
            p.idFriend === cookie.userId && p.idUser === id && p.cancel === false && p.confirm === true
        );
        const requestBase = {
          userId: id,
          friendId: cookie.userId,
          confirm: true,
          cancel: true,
        };
        await updatePair(requestBase, pair.idPair);
        console.log(`${id} удален из друзей`);
    }
    }
  };

  const sendFriendRequest = async (values: FormValues) => {
    const cookie = await getCookie("something");
    const friendData = await getByEmail(values.email);
    if (friendData.email === "-1") {
      alert("Нет такого пользователя");
      return;
    }
    if (friendData.email === cookie.email) {
      alert("Нельзя дружить с самим собой)");
      return;
    }
    const requestBase: friendsPairRequest = {
      userId: cookie.userId,
      friendId: friendData.id,
      confirm: false,
      cancel: false,
    };
/////////////////////////////////////////////////////////
// Проверка на наличие такого запроса на дружбу
const responseExists = await getByFriendId(cookie.userId);
const responseExists2 = await getByFriendId(friendData.id);
console.log("responseExists:", responseExists);
console.log("responseExists2:", responseExists2);

if (Array.isArray(responseExists) && Array.isArray(responseExists2)) {
  // Объединяем два массива запросов
  const allResponses = [...responseExists, ...responseExists2];

  // Ищем все подходящие запросы
  const matchingRequests = allResponses.filter(
    (pair) =>
      (pair.idUser === requestBase.friendId && pair.idFriend === requestBase.userId) ||
      (pair.idUser === requestBase.userId && pair.idFriend === requestBase.friendId)
  );

  console.log("Matching requests:", matchingRequests);
  if (matchingRequests.length > 0) {
    const hasPendingRequest = matchingRequests.some(
      (req) => !req.confirm && !req.cancel
    );
    if (hasPendingRequest) {
      console.log("Такой запрос дружбы уже отправлен, ожидайте.");
      return;
    }

    const hasCancelledRequest = matchingRequests.some(
      (req) => req.cancel && !req.confirm
    );
    if (hasCancelledRequest) {
      alert("Вам отказали в запросе.");
      
      return;
    }

    const isAlreadyFriends = matchingRequests.some(
      (req) => req.confirm && !req.cancel
    );
    if (isAlreadyFriends) {
      console.log("Уже дружите.");
      return;
    }
  } else {
    console.log("Запросов не найдено.");
  }
} else {
  console.error("Ожидался массив, но получено:", { responseExists, responseExists2 });
}
/////////////////////////////////////////////////////////


    const response = await createPair(requestBase);
    console.log(response);
  };
  

  return (
    <div className={styles.container}>
      <h2>Список друзей</h2>
      <List
        bordered
        dataSource={friends}
        renderItem={(friend) => (
          <List.Item>
            <Space
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>
                {friend.name} ({friend.email})
              </span>
              <Space>
                {!friend.isInitiator && friend.cancel === false && friend.confirm === false ? (
                  <>
                    <Button type="primary" onClick={() => handleAccept(friend.id)}>
                      Принять
                    </Button>
                    <Button danger onClick={() => handleReject(friend.id)}>
                      Отклонить
                    </Button>
                  </>
                ) : friend.confirm === true && friend.cancel === false ? (
                  <>
                    <Button type="primary" onClick={() => onButtonClick(friend.id)}>
                      Позвонить
                    </Button>
                    <Button danger onClick={() => handleDelete(friend.id)}>
                      Удалить
                    </Button>
                  </>
                ) : null}
              </Space>
            </Space>
          </List.Item>
        )}
      />

      <h3>Добавить друга</h3>
      <Form
        layout="inline"
        name="myForm"
        onFinish={sendFriendRequest}
      >
        <Form.Item name="email">
          <Input placeholder="Введите почту друга" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            className={styles.buttonHorizontalCenter2}
            htmlType="submit"
          >
            Отправить запрос дружбы
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

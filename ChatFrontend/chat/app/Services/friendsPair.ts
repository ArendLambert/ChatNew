import { UUID } from "crypto";
import { serverAddress } from "../Components/constants";

export interface friendsPairRequest{
    userId: string;
    friendId: string;
    confirm: boolean;
    cancel: boolean;
}

export const getByIdPair = async (id : UUID) => {
    const response = await fetch(`${serverAddress}/FriendsPair/by-id?idPair=${id}`, {
        method: "GET",
    },);

    return response.json();
}
export const getByFriendId = async (id : UUID) => {
    const response = await fetch(`${serverAddress}/FriendsPair/by-friend-id?idPair=${id}`, {
        method: "GET",
    },);

    return response.json();
}

export const createPair = async (pairRequest : friendsPairRequest) => {
    const response = await fetch(`${serverAddress}/FriendsPair`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(pairRequest),
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error(`Ошибка запроса: ${response.statusText}`);
    }

    return await response.json(); // Возвращаем ответ сервера
}; 

export const updatePair = async (pairRequest : friendsPairRequest, idPair: UUID) => {
    try {
      const response = await fetch(`${serverAddress}/FriendsPair/${idPair}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain",
        },
        body: JSON.stringify(pairRequest),
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update pair: ${response.statusText}`);
      }
  
      const pairId = await response.json();
      return pairId;
    } catch (error) {
      console.error("Error updating pair:", error);
      throw error;
    }
  };

  export const isInitiator = async (idInitiator: UUID, idFriend: UUID) => {
    try {
      const friendPair = await getByFriendId(idFriend);
  
      if (!Array.isArray(friendPair)) {
        console.error("Ожидался массив пар, но получено:", friendPair);
        return false;
      }
  
      const matchingPair = friendPair.find(
        (pair) => pair.idUser === idInitiator && pair.idFriend === idFriend
      );
  
      if (matchingPair) {
        console.log(`Пользователь ${idInitiator} является инициатором запроса дружбы.`);
        return true;
      } else {
        console.log(`Пользователь ${idInitiator} не является инициатором запроса дружбы.`);
        return false;
      }
    } catch (error) {
      console.error("Ошибка при проверке инициатора:", error);
      throw error;
    }
  };
  
  
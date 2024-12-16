import { UUID } from "crypto";
import { serverAddress } from "../Components/constants";

export interface UserRequest{
    name: string;
    sessionId: string;
    password: string;
    email: string;
}

export interface UserLoginRequest{
    email: string;
    password: string;
}

export const getAllUsers = async () => {
    const response = await fetch(`${serverAddress}/Users`,{
        credentials: "include",
    });

    return response.json();
}

export const register = async (userRequest : UserRequest) => {
    const user = await getByEmail(userRequest.email);
    console.log(user);
    if(user.email == "-1"){ // Если такого пользователся не существует, то регистрируем
        await fetch(`${serverAddress}/register`, {
            method: "POST",
            headers: {
                "content-type" : "application/json",
            },
            body: JSON.stringify(userRequest),
        });
    }
    else{
        console.log(`Пользователь с электронной почтой ${userRequest.email} уже существует`);
        return user;
    }
}

export const login = async (userRequest : UserLoginRequest) => {
    await fetch(`${serverAddress}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userRequest),
        credentials: 'include', // Добавьте это
    });
    
};  

export const getByEmail = async (email : string) => {
    const response = await fetch(`${serverAddress}/Users/by-email?email=${email}`, {
        method: "GET",
    },);

    return response.json();
}

export function getCookie(name: string) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
        const cookieValue = match[2];
        const decodedToken = parseJwt(cookieValue);
        return decodedToken;
    } else {
        console.log('Кука не найдена');
        return undefined;
    }

    function parseJwt(token: string) {
        if (!token || token.split('.').length < 2) {
            throw new Error('Некорректный токен');
        }
    
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    
        return JSON.parse(jsonPayload);
    }
    
}


export const getById = async (id : UUID) => {
    const response = await fetch(`${serverAddress}/Users/by-id?id=${id}`, {
        method: "GET",
    },);

    return response.json();
}

export const updateUser = async (userRequest : UserRequest, idUser: UUID) => {
    try {
      const response = await fetch(`${serverAddress}/Users/${idUser}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/plain",
        },
        body: JSON.stringify(userRequest),
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }
  
      const pairId = await response.json();
      return pairId;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };
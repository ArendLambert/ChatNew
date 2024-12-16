"use client";

import { useEffect, useState } from 'react';
import { getByEmail, getById, getCookie, updateUser, UserRequest } from '../Services/users';
import { Button, Form, Input } from 'antd';
import styles from "../page.module.css";

const AdminPanel: React.FC = () => {
    const [email, setMyEmail] = useState<string>('');
    const [prayEmail, setPrayEmail] = useState<string>('');

    interface FormValues {
        email: string;
      }

  useEffect(() => {
    const cookie = getCookie("something");
    const userData = cookie.email
    setMyEmail(userData);
  }, [getCookie, setMyEmail, setPrayEmail]);

  const sendBanRequest = async (values: FormValues) => {
    const banUserData = await getByEmail(values.email);
    console.log("Banned user:");
    console.log(banUserData);
    const request: UserRequest = {
        name: banUserData.name,
        sessionId: "banned",
        password: banUserData.password,
        email: banUserData.email,
    };
    const response = await updateUser(request, banUserData.idUser);
    console.log("Response:");
    console.log(response);
  };
  
  const sendUnbanRequest = async () => {
    const banUserPreData = await getByEmail(prayEmail);
    const banUserData = await getById(banUserPreData.id);
    console.log("Unbanned user:");
    console.log(banUserData);
    const request: UserRequest = {
        name: banUserData.name,
        sessionId: "",
        password: banUserData.password,
        email: banUserData.email,
    };
    const response = await updateUser(request, banUserData.id);
    console.log("Response:");
    console.log(response);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrayEmail(e.target.value);
};

  return (
    <div className={styles.fullscreen_div}>
        {email === '333@gmail.com' ? (
            <div>
                <h3>ЗАБАНИТЬ</h3>
                <Form
                layout="inline"
                name="myForm"
                onFinish={sendBanRequest}>

                    <Form.Item name="email">
                        <Input placeholder="Введите почту жертвы" onChange={handleChange}/>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" className={styles.buttonHorizontalCenter2} htmlType="submit">
                            Отправить в бан
                        </Button>
                        <Button type="dashed" className={styles.buttonHorizontalCenter} onClick={sendUnbanRequest}>
                            Вернуть
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        ) : null}
    </div>
  );
};

export default AdminPanel;

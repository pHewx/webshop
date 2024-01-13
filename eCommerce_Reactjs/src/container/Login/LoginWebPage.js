import React, { useRef } from "react";
import { useEffect, useState } from 'react';
import { useHistory } from "react-router";
import { toast } from 'react-toastify';
import './LoginWebPage.css';
import { FacebookLoginButton, GoogleLoginButton } from "react-social-login-buttons";
import { handleLoginService, checkPhonenumberEmail, createNewUser } from '../../services/userService';
import Otp from "./Otp";
import { authentication } from "../../utils/firebase";
import { signInWithPopup, FacebookAuthProvider, GoogleAuthProvider } from 'firebase/auth'
import { async } from "@firebase/util";
import { isNull } from "lodash";
const LoginWebPage = () => {

    const [inputValues, setInputValues] = useState({
        email: '', password: 'passwordsecrect', passwordCon: '', lastName: '', phonenumber: '', isOpen: false, dataUser: {}
    });

    let history = useHistory()
    const handleOnChange = event => {
        const { name, value } = event.target;
        setInputValues({ ...inputValues, [name]: value });

    };
    let handleLogin = async (event) => {
        event.preventDefault();

        let res = await handleLoginService({
            email: inputValues.email,
            password: inputValues.password
        })


        if (res && res.errCode === 0) {
            localStorage.setItem("userData", JSON.stringify(res.user))
            localStorage.setItem("token", JSON.stringify(res.accessToken))
            if (res.user.roleId === "R1" || res.user.roleId === "R4") {
                window.location.href = "/admin"

            }
            else {
                window.location.href = "/"
            }
        }
        else {
            toast.error(res.errMessage)
        }
    }
    let handleLoginSocial = async (email) => {
        const element = document.querySelector('form');
        element.addEventListener('submit', event => {
            event.preventDefault();

        });
        let res = await handleLoginService({
            email: email,
            password: inputValues.password
        })


        if (res && res.errCode === 0) {


            localStorage.setItem("userData", JSON.stringify(res.user))
            localStorage.setItem("token", JSON.stringify(res.accessToken))
            if (res.user.roleId === "R1" || res.user.roleId === "R4") {
                window.location.href = "/admin"

            }
            else {
                window.location.href = "/"
            }
        }
        else {
            toast.error(res.errMessage)
        }
    }

    let handleSubmit = async (event) => {
        event.preventDefault();
        


        if (inputValues.passwordCon != inputValues.password)
        {
            toast.error("Xác minh mật khẩu không đúng");
            return
        }

        let res = await checkPhonenumberEmail({
            phonenumber: inputValues.phonenumber,
            email: inputValues.email
        })
        if (res.isCheck === true) {
            toast.error(res.errMessage)
        } else {
            setInputValues({
                ...inputValues, ["dataUser"]:
                {
                    email: inputValues.email,
                    lastName: inputValues.lastName,
                    phonenumber: inputValues.phonenumber,
                    password: inputValues.password,
                    roleId: 'R2',
                }, ["isOpen"]: true
            })
        }
    }
    
    const getBase64FromUrl = async (url) => {

        const data = await fetch(url);
        const blob = await data.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64data = reader.result;
                resolve(base64data);
            }
        });
    }
    let signInwithFacebook = () => {
        const provider = new FacebookAuthProvider()
        signInWithPopup(authentication, provider)
            .then((re) => {

                LoginWithSocial(re)

            })
            .catch((err) => {
                console.log(err.message)
            })
    }
    let LoginWithSocial = async (re) => {
        let res = await checkPhonenumberEmail({
            phonenumber: re.user.providerData[0].phoneNumber,
            email: re.user.providerData[0].email
        })

        if (res.isCheck === true) {
            setInputValues({
                ...inputValues,
                ["email"]: re.user.providerData[0].email,


            })
            handleLoginSocial(re.user.providerData[0].email)

        } else {
            getBase64FromUrl(re.user.providerData[0].photoURL).then(async (value) => {

                let res = await createNewUser({


                    email: re.user.providerData[0].email,
                    lastName: re.user.providerData[0].displayName,
                    phonenumber: re.user.providerData[0].phoneNumber,
                    avatar: value,
                    roleId: "R2",
                    password: inputValues.password
                })
                if (res && res.errCode === 0) {
                    toast.success("Tạo tài khoản thành công")
                    handleLoginSocial(re.user.providerData[0].email)


                } else {
                    toast.error(res.errMessage)
                }
            })


        }
    }
    let signInwithGoogle = async () => {
        const provider = new GoogleAuthProvider()
        signInWithPopup(authentication, provider)
            .then(async (re) => {

                LoginWithSocial(re)

            })
            .catch((err) => {
                console.log(err.message)
            })
    }

    return (
        <>
            {inputValues.isOpen === false &&
                <div className="box-login">
                    <div className="login-container">
                        <section id="formHolder">
                            <div className="row">
                                {/* Brand Box */}
                                <div className="col-sm-6 brand">
                                    <a href="#" className="logo">MR <span>.</span></a>
                                    <div className="heading">
                                        <h2>Esier</h2>
                                        <p>Sự lựa chọn của bạn</p>
                                    </div>

                                </div>
                                {/* Form Box */}
                                <div className="col-sm-6 form">
                                    {/* Login Form */}
                                    <div className="login form-peice ">
                                        <form className="login-form" onSubmit={handleLogin}>
                                            <div className="form-group">
                                                <label htmlFor="loginemail">Địa chỉ email</label>
                                                <input name="email" onChange={(event) => handleOnChange(event)} type="email" id="loginemail" required />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="loginPassword">Mật khẩu</label>
                                                <input name="password" onChange={(event) => handleOnChange(event)} type="password" id="loginPassword" required />
                                            </div>
                                            <div className="CTA">
                                                <input type="submit" value="Đăng nhập" />
                                                <a style={{ cursor: 'pointer', }} className="switch">Tài khoản mới</a>
                                            </div>
                                            {/* <FacebookLoginButton text="Đăng nhập với Facebook" iconSize="25px" style={{ width: "300px", height: "40px", fontSize: "16px", marginTop: "40px", marginBottom: "10px" }} onClick={() => signInwithFacebook()} /> */}
                                            <GoogleLoginButton text="Đăng nhập với Google" iconSize="25px" style={{ width: "300px", height: "40px", fontSize: "16px", marginTop: "40px", marginBottom: "10px" }} onClick={() => signInwithGoogle()} />
                                        </form>
                                    </div>{/* End Login Form */}
                                    {/* Signup Form */}
                                    <div className="signup form-peice switched">
                                        <form className="signup-form" onSubmit={handleSubmit}>
                                            <div className="form-group">
                                                <label htmlFor="name">Họ và tên <span style={{color: 'red'}}>*</span></label>
                                                <input type="text" name="lastName" onChange={(event) => handleOnChange(event)} id="name" className="name" required minLength={6}/>
                                            </div> 

                                            <div className="form-group">
                                                <label htmlFor="email">Địa chỉ email <span style={{color: 'red'}}>*</span></label>
                                                <input type="email" name="email" onChange={(event) => handleOnChange(event)} id="email" className="email" required/>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="phone">Số điện thoại <span style={{color: 'red'}}>*</span></label>
                                                <input type="tel" name="phonenumber" onChange={(event) => handleOnChange(event)} id="phone" className="phone" pattern="^\+?(84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9\d)\d{7,8}$" required/>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="password">Mật khẩu <span style={{color: 'red'}}>*</span></label>
                                                <input type="password" name="password" onChange={(event) => handleOnChange(event)} id="password" className="pass" required minLength={6}/>
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="passwordCon">Xác nhận mật khẩu <span style={{color: 'red'}}>*</span></label>
                                                <input type="password" name="passwordCon" onChange={(event) => handleOnChange(event)} id="passwordCon" className="passConfirm" required minLength={6}/>
                                            </div>
                                            <div className="CTA">
                                                <input type="submit" value="Lưu" id="submit"/>
                                                <a style={{ cursor: 'pointer' }} className="switch">Tôi có tài khoản</a>
                                            </div>
                                        </form>
                                    </div>{/* End Signup Form */}
                                </div>
                            </div>
                        </section>

                    </div>


                </div>
            }


            {inputValues.isOpen === true &&
                <Otp dataUser={inputValues.dataUser} />
            }
        </>
    )

}
export default LoginWebPage;
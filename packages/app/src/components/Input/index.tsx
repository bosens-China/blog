import { InputHTMLAttributes } from "react";

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <>
      <input className="inp" {...props}></input>
      <div className="1pxbor"></div>
    </>
  );
}

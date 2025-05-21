"use client"
import "./button-styles.css"

export default function HoverButton({ children, onClick }) {
  return (
    <button className="sweep-button" onClick={onClick}>
      <span className="button-text">{children || "Hover Me"}</span>
    </button>
  )
}


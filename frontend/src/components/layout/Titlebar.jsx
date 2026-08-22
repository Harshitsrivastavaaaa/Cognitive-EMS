import { Minus, Square, X } from 'lucide-react'
import './Titlebar.css'

export default function Titlebar() {
    const handleMinimize = () => {
        window.electronAPI?.minimizeWindow()
    }

    const handleMaximize = () => {
        window.electronAPI?.maximizeWindow()
    }

    const handleClose = () => {
        window.electronAPI?.closeWindow()
    }

    if (!window.electronAPI) return null

    return (
        <div className="titlebar">
            <div className="titlebar-drag-area">
                <span className="titlebar-title">Hash#AI EMS</span>
            </div>
            <div className="titlebar-controls">
                <button className="titlebar-button" onClick={handleMinimize}>
                    <Minus size={16} />
                </button>
                <button className="titlebar-button" onClick={handleMaximize}>
                    <Square size={14} />
                </button>
                <button className="titlebar-button close" onClick={handleClose}>
                    <X size={16} />
                </button>
            </div>
        </div>
    )
}

/* ENDS HERE */
/* Checked - HARSHIT SRIVASTAVA */
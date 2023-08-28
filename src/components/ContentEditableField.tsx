"use client"
import { useEffect, useRef } from "react"
import ContentEditable, { ContentEditableEvent } from "react-contenteditable"


export function ContentEditableField({
    value,
    onChange,
    onEmptyBlur,
    onDeselect,
    onEnterKey,
    focus = false,
    enterNotAllowed = false,
    onEmptyDelete,
    triggerOnEmptyBlurOnBlur = false
}: {
    value: string
    onChange: (text: string) => void
    onEmptyBlur?: () => void
    onDeselect?: () => void
    onEnterKey?: (shift: boolean) => void
    enterNotAllowed?: boolean,
    focus?: boolean,
    onEmptyDelete?: () => void
    triggerOnEmptyBlurOnBlur?: boolean
}) {
    const text = useRef(value)

    const handleChange = (evt: ContentEditableEvent) => {
        text.current = evt.target.value
        //if(text.current !== evt.target.value){
        onChange(text.current)
        //}
    }

    const handleBlur = () => {
        if (text.current.trim() === "" && triggerOnEmptyBlurOnBlur) onEmptyBlur && onEmptyBlur()
    }
    const eleemntRef = useRef<any>(null)
    useEffect(()=>{
        if(!eleemntRef.current) return;
        try{
            eleemntRef.current.el.current.setAttribute("contenteditable", "plaintext-only");
        }catch(ex : any){}
    }, [eleemntRef.current])
    useEffect(() => {
        if (!focus) return
        setTimeout(() => {
            try {
                const range = document.createRange()
                const sel = window.getSelection()
                range.selectNodeContents(eleemntRef.current.el.current)
                range.collapse(false)
                sel!.removeAllRanges()
                sel!.addRange(range)
                eleemntRef.current.el.current.focus()
                range.detach()
            } catch (ex) { }
        }, 1)
    }, [focus])
    return (
        <ContentEditable
            ref={eleemntRef}
            html={text.current}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeyDown={(ev) => {
                if (ev.key === "Backspace" && text.current === "") {
                    onEmptyDelete && onEmptyDelete();
                }
                if (ev.key === "Enter") {
                    onEnterKey && onEnterKey(ev.shiftKey)
                }
                if (ev.key === "Enter" && enterNotAllowed && !ev.shiftKey) {
                    ev.preventDefault();
                }
                if (ev.key === "Escape") {
                    if (text.current === "") {
                        onEmptyBlur && onEmptyBlur()
                    }
                    onDeselect && onDeselect()
                }
            }}
        />
    )
}

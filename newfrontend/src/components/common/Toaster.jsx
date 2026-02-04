import React from 'react'
import { useToast } from '../../hooks/useToast'
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastTitle,
} from '../ui/toast'

export function Toaster() {
    const { toasts, removeToast } = useToast()

    return (
        <>
            {toasts.map(({ id, title, description, variant, ...props }) => (
                <Toast key={id} variant={variant} {...props}>
                    <div className="grid gap-1">
                        {title && <ToastTitle>{title}</ToastTitle>}
                        {description && <ToastDescription>{description}</ToastDescription>}
                    </div>
                    <ToastClose onClick={() => removeToast(id)} />
                </Toast>
            ))}
        </>
    )
}
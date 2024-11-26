import React from "react"
import { Icon } from "@iconify/react"

export const authProviders = {
    apple: {
        name: "Apple",
        icon: <Icon className="text-default-500" icon="fa:apple" width={18} />,
    },
    discord: {
        name: "Discord",
        icon: <Icon icon="logos:discord-icon" width={25} />,
    },
    facebook: {
        name: "Facebook",
        icon: <Icon icon="logos:facebook" width={23} />,
    },
    google: {
        name: "Google",
        icon: <Icon icon="flat-color-icons:google" width={24} />,
    },
    github: {
        name: "GitHub",
        icon: <Icon className="text-default-500" icon="fe:github" width={27} />,
    },
    email: {
        name: "Email",
        icon: <Icon className="text-2xl" icon="solar:letter-bold" />
    },
    password: {
        name: "Password",
        icon: <Icon className="text-xl" icon="solar:lock-keyhole-bold" />
    }
}
import { Icon } from "@iconify/react"

export const authProviders = {
    azure: {
        name: "Azure",
        icon: <Icon icon="logos:microsoft-icon" width={18} />,
    },
    apple: {
        name: "Apple",
        icon: <Icon icon="fa:apple" width={18} />,
    },
    bitbucket: {
        name: "Bitbucket",
        icon: <Icon icon="logos:bitbucket" width={20} />,
    },
    discord: {
        name: "Discord",
        icon: <Icon icon="logos:discord-icon" width={23} />,
    },
    facebook: {
        name: "Facebook",
        icon: <Icon icon="logos:facebook" width={22} />,
    },
    figma: {
        name: "Figma",
        icon: <Icon icon="logos:figma" width={13} />,
    },
    github: {
        name: "GitHub",
        icon: <Icon icon="fe:github" width={27} />,
    },
    gitlab: {
        name: "GitLab",
        icon: <Icon icon="logos:gitlab" width={21} />,
    },
    google: {
        name: "Google",
        icon: <Icon icon="flat-color-icons:google" width={24} />,
    },
    kakao: {
        name: "Kakao",
        icon: <Icon icon="simple-icons:kakaotalk" width={21} />,
    },
    keycloak: {
        name: "Keycloak",
        icon: <Icon icon="simple-icons:keycloak" width={22} />,
    },
    linkedin: {
        name: "LinkedIn",
        icon: <Icon icon="devicon:linkedin" width={21} />,
    },
    notion: {
        name: "Notion",
        icon: <Icon icon="simple-icons:notion" width={20} />,
    },
    twitch: {
        name: "Twitch",
        icon: <Icon icon="logos:twitch" width={20} className="mt-0.5" />,
    },
    twitter: {
        name: "Twitter",
        icon: <Icon icon="logos:twitter" width={23} />,
    },
    slack: {
        name: "Slack",
        icon: <Icon icon="logos:slack-icon" width={20} />,
    },
    spotify: {
        name: "Spotify",
        icon: <Icon icon="logos:spotify-icon" width={22} />,
    },
    workos: {
        name: "WorkOS",
        icon: <Icon icon="logos:workos-icon" width={22} />,
    },
    zoom: {
        name: "Zoom",
        icon: <Icon icon="logos:zoom-icon" width={22} />,
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
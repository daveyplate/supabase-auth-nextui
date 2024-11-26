import React, { useEffect, useState } from "react"
import { Button, Input, Link, Divider, Card, CardBody, cn, CardHeader, CardFooter } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useRouter } from "next/router"
import { createClient } from "./utils/supabase/component"
import { useIsClient } from "@uidotdev/usehooks"
import { SupabaseClient } from "@supabase/supabase-js"

const authProviders = {
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

const viewTitles = {
    login: "Log In",
    signup: "Sign Up",
    "forgot-password": "Forgot Password",
}

const viewActions = {
    login: "Log In",
    signup: "Sign Up",
    "forgot-password": "Reset Password"
}

/**
 * Auth component
 * @param {Object} props
 * @param {SupabaseClient} props.supabase
 */
export function Auth({
    supabase,
    defaultRedirect = "/",
    redirect = null,
    magicLink = true,
    emailPassword = true,
    nextRouter = true,
    initialView = "login",
    providers = [],
    formatLabel = (label) => label,
}) {
    const router = useRouter()
    const [view, setView] = useState(nextRouter ? router.pathname.split("/")[1] : initialView)
    const [session, setSession] = useState(null)
    const [currentRedirect, setCurrentRedirect] = useState(defaultRedirect)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const isClient = useIsClient()

    // Get and watch changes to the session
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    // Redirect the user when the session is active
    useEffect(() => {
        if (session) router.replace(redirect || currentRedirect)
    }, [session])

    // Set the view based on the current router path
    useEffect(() => {
        if (nextRouter && view != router.pathname.split("/")[1]) {
            setView(router.pathname.split("/")[1])
        }
    }, [router.pathname])

    // Push the router to the pathname for the current view
    useEffect(() => {
        if (nextRouter && view != router.pathname.split("/")[1]) {
            router.push(`/${view}`)
        }
    }, [view])

    // Change the redirect based on the URL query
    useEffect(() => {
        if (router.query.redirect) {
            setCurrentRedirect(router.query.redirect)
        }
    }, [router.query])

    // Handle the form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        setError(null)
        setIsLoading(true)

        const { email, password } = Object.fromEntries(new FormData(e.target))

        switch (view) {
            case "login":
                if (emailPassword) {
                    console.log("attempt it")
                    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
                    console.log(data, error)
                } else {
                    await supabase.auth.signIn({ email })
                }
                break

            case "signup":
                await supabase.auth.signUp({ email, password })
                break

            case "forgot-password":
                await supabase.auth.api.resetPasswordForEmail(email)
                break
        }

        setIsLoading(false)
    }

    return (
        <div className={cn((session || !isClient) && "opacity-0",
            "flex flex-col w-full max-w-sm gap-4 transition-all"
        )}>
            <p className="text-xl font-medium ms-1">
                {formatLabel(viewTitles[view])}
            </p>

            <form
                className="relative flex flex-col gap-3"
                onSubmit={handleSubmit}
            >
                <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    variant="bordered"
                />

                <Input
                    className={cn(
                        ["login", "signup"].includes(view) ? "opacity-1" : "opacity-0 -mt-3 !h-0 overflow-hidden",
                        "transition-all"
                    )}
                    label="Password"
                    name="password"
                    type="password"
                    variant="bordered"
                />

                <Button color="primary" type="submit" isLoading={isLoading}>
                    {viewActions[view]}
                </Button>
            </form>

            <Card className="bg-danger-50">
                <CardBody className="text-small text-center !text-danger-700">
                    Error signing in
                </CardBody>
            </Card>

            <Card className="bg-success-50">
                <CardBody className="text-small text-center !text-success-700">
                    Check your email
                </CardBody>
            </Card>

            <Link
                className={cn(
                    view == "login" ? "opacity-1" : "opacity-0 -mt-4 !h-0 overflow-hidden",
                    "transition-all self-center cursor-pointer"
                )}
                size="sm"
                onPress={() => setView("forgot-password")}
            >
                Forgot password?
            </Link>

            <div className="flex items-center gap-4 py-2">
                <Divider className="flex-1" />

                <p className="shrink-0 text-tiny text-default-500">
                    OR
                </p>

                <Divider className="flex-1" />
            </div>

            <div className="flex flex-col gap-2">
                {magicLink && view != "magic-link" && (
                    <Button
                        startContent={
                            authProviders.email.icon
                        }
                        variant="flat"
                        onPress={() => setView("magic-link")}
                    >
                        Continue with Email
                    </Button>
                )}

                {view == "magic-link" && (
                    <Button
                        startContent={
                            authProviders.password.icon
                        }
                        variant="flat"
                        onPress={() => setView("login")}
                    >
                        Continue with Password
                    </Button>
                )}

                {providers?.length < 3 && (
                    <div className="flex flex-col gap-2">
                        {providers?.map((provider) => (
                            <Button
                                key={provider}
                                startContent={authProviders[provider].icon}
                                variant="flat"
                            >
                                Continue with {authProviders[provider].name}
                            </Button>
                        ))}
                    </div>
                )}


                {providers?.length > 2 && (
                    <div className="flex gap-2">
                        {providers?.map((provider) => (
                            <Button
                                key={provider}
                                variant="flat"
                                className="min-w-0"
                                fullWidth
                            >
                                {authProviders[provider].icon}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col my-1">
                <p className={cn(
                    ["login", "magic-link"].includes(view) ? "opacity-1" : "opacity-0 translate-y-3 h-0 overflow-hidden",
                    "text-center text-small transition-all"
                )}>
                    Need to create an account?&nbsp;
                    <Link
                        size="sm"
                        onPress={() => setView("signup")}
                        className="cursor-pointer"
                    >
                        Sign Up
                    </Link>
                </p>

                <p className={cn(
                    ["signup", "forgot-password"].includes(view) ? "opacity-1" : "opacity-0 translate-y-3 h-0 overflow-hidden",
                    "text-center text-small transition-all"
                )}>
                    Already have an account?&nbsp;

                    <Link
                        size="sm"
                        onPress={() => setView("login")}
                        className="cursor-pointer"
                    >
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    )
}

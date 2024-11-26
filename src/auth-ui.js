import React, { useEffect, useState } from "react"
import { Button, Input, Link, Divider, Card, CardBody, cn, CardHeader, CardFooter } from "@nextui-org/react"
import { useRouter } from "next/router"
import { SupabaseClient } from "@supabase/supabase-js"
import { authProviders } from "./auth-providers"
import { useIsHydrated } from "./use-is-hydrated"

/**
 * Auth component
 * @param {Object} props
 * @param {SupabaseClient} props.supabase - Supabase client
 * @param {string} [props.defaultRedirect="/"] - Default redirect path
 * @param {string} [props.redirect] - Override Redirect path
 * @param {boolean} [props.magicLink=true] - Enable magic link
 * @param {boolean} [props.emailPassword=true] - Enable email and password
 * @param {boolean} [props.startWithMagicLink=false] - Start with magic link
 * @param {boolean} [props.nextRouter=true] - Enable Next.js router integration
 * @param {string} [props.initialView="login"] - Initial view to render
 * @param {string[]} [props.providers=[]] - Auth providers
 * @param {(label: string) => string} [props.formatLabel] - Format label
 * @returns {JSX.Element}
 */
export function Auth({
    supabase,
    defaultRedirect = "/",
    redirect = null,
    magicLink = true,
    emailPassword = true,
    startWithMagicLink = false,
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
    const [successMessage, setSuccessMessage] = useState(null)
    const [isMagicLink, setIsMagicLink] = useState(startWithMagicLink || !emailPassword)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isEmailValid, setIsEmailValid] = useState(true)
    const [isPasswordValid, setIsPasswordValid] = useState(true)
    const isHydrated = useIsHydrated()

    const viewTitles = {
        login: formatLabel("Log In"),
        signup: formatLabel("Sign Up"),
        "forgot-password": formatLabel("Forgot Password"),
    }

    const viewActions = {
        login: isMagicLink ? formatLabel("Send Magic Link") : formatLabel("Log In"),
        signup: formatLabel("Sign Up"),
        "forgot-password": formatLabel("Reset Password")
    }

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
        if (view != "login") {
            setIsMagicLink(false)
        }

        if (nextRouter && view != router.pathname.split("/")[1]) {
            router.push(`/${view}`)
        }

        setError(null)
        setSuccessMessage(null)
    }, [view])

    // Change the redirect based on the URL query
    useEffect(() => {
        if (router.query.redirect_to) {
            setCurrentRedirect(router.query.redirect_to)
        }
    }, [router.query])

    // Handle the form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        setError(null)
        setSuccessMessage(null)

        setIsLoading(true)

        switch (view) {
            case "login": {
                if (isMagicLink) {
                    const { error } = await supabase.auth.signInWithOtp({
                        email,
                        options: {
                            // set this to false if you do not want the user to be automatically signed up
                            emailRedirectTo: redirect || currentRedirect
                        }
                    })
                    setError(error)
                    !error && setSuccessMessage("Check your email for the magic link")
                    !error && e.target.reset()
                } else {
                    const { error } = await supabase.auth.signInWithPassword({ email, password })
                    setError(error)
                }

                break
            }
            case "signup": {
                const { error } = await supabase.auth.signUp({ email, password })
                setError(error)
                break
            }
            case "forgot-password": {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `/update-password?redirect_to=${redirect || currentRedirect}`,
                })
                setError(error)
                !error && setSuccessMessage("Check your email for the password reset link")
                break
            }

        }

        setIsLoading(false)
    }

    return (
        <div className={cn((!isHydrated) && "opacity-0",
            "flex flex-col w-full max-w-sm gap-4 transition-all"
        )}>
            <p className="text-xl font-medium ms-1">
                {viewTitles[view]}
            </p>

            <form
                className="relative flex flex-col gap-3"
                onSubmit={handleSubmit}
            >
                <Input
                    label={formatLabel("Email Address")}
                    name="email"
                    type="email"
                    value={email}
                    onValueChange={setEmail}
                    variant="bordered"
                />

                <Input
                    className={cn(
                        (emailPassword && !isMagicLink && ["login", "signup"].includes(view)) ? "opacity-1" : "opacity-0 -mt-3 !h-0 overflow-hidden",
                        "transition-all"
                    )}
                    label={formatLabel("Password")}
                    name="password"
                    value={password}
                    onValueChange={setPassword}
                    type="password"
                    variant="bordered"
                />

                <Button color="primary" type="submit" isLoading={isLoading}>
                    {viewActions[view]}
                </Button>
            </form>

            <Link
                className={cn(
                    (view == "login" && !isMagicLink) ? "opacity-1" : "opacity-0 -mt-4 !h-0 overflow-hidden",
                    "transition-all self-center cursor-pointer"
                )}
                size="sm"
                onPress={() => setView("forgot-password")}
            >
                {formatLabel("Forgot password?")}
            </Link>

            <div className={cn(
                error ? "opacity-1" : "opacity-0 -mt-4 !h-0 overflow-hidden",
                "transition-all"
            )}>
                <Card className="bg-danger-50">
                    <CardBody className="text-small text-center !text-danger-700 h-12">
                        {error && formatLabel(error?.message)}
                    </CardBody>
                </Card>
            </div>

            <div className={cn(
                successMessage ? "opacity-1" : "opacity-0 -mt-4 !h-0 overflow-hidden",
                "transition-all"
            )}>
                <Card className="bg-success-50">
                    <CardBody className="text-small text-center !text-success-700 h-12">
                        {successMessage && formatLabel(successMessage)}
                    </CardBody>
                </Card>
            </div>

            <div className="flex items-center gap-4 py-2">
                <Divider className="flex-1" />

                <p className="shrink-0 text-tiny text-default-500">
                    {formatLabel("OR")}
                </p>

                <Divider className="flex-1" />
            </div>

            <div className="flex flex-col gap-2">
                {magicLink && !isMagicLink && (
                    <Button
                        startContent={
                            authProviders.email.icon
                        }
                        variant="flat"
                        onPress={() => {
                            setView("login")
                            setIsMagicLink(true)
                        }}
                    >
                        {formatLabel("Continue with Email")}
                    </Button>
                )}

                {emailPassword && isMagicLink && (
                    <Button
                        startContent={
                            authProviders.password.icon
                        }
                        variant="flat"
                        onPress={() => {
                            setView("login")
                            setIsMagicLink(false)
                        }}
                    >
                        {formatLabel("Continue with Password")}
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
                                {formatLabel("Continue with")}

                                &nbsp;

                                {authProviders[provider].name}
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
                    ["login"].includes(view) ? "opacity-1" : "opacity-0 translate-y-3 h-0 overflow-hidden",
                    "text-center text-small transition-all"
                )}>
                    {formatLabel("Need to create an account?")}

                    &nbsp;

                    <Link
                        size="sm"
                        onPress={() => setView("signup")}
                        className="cursor-pointer"
                    >
                        {formatLabel("Sign Up")}
                    </Link>
                </p>

                <p className={cn(
                    ["signup", "forgot-password"].includes(view) ? "opacity-1" : "opacity-0 translate-y-3 h-0 overflow-hidden",
                    "text-center text-small transition-all"
                )}>
                    {formatLabel("Already have an account?")}

                    &nbsp;

                    <Link
                        size="sm"
                        onPress={() => setView("login")}
                        className="cursor-pointer"
                    >
                        {formatLabel("Log In")}
                    </Link>
                </p>
            </div>
        </div>
    )
}

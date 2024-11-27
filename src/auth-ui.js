import React, { useEffect, useRef, useState } from "react"
import { Button, Input, Link, Divider, Card, CardBody, cn, CardHeader, CardFooter } from "@nextui-org/react"
import { useRouter } from "next/router"
import { SupabaseClient } from "@supabase/supabase-js"
import { authProviders } from "./auth-providers"
import { useIsHydrated } from "./use-is-hydrated"
import { Icon } from "@iconify/react"

/**
 * @typedef {Object} AuthLocalization
 * @property {string} [header_text_login="Log In"]
 * @property {string} [header_text_signup="Sign Up"]
 * @property {string} [header_text_forgot_password="Forgot Password"]
 * @property {string} [header_text_update_password="Update Password"]
 * @property {string} [email_label="Email Address"]
 * @property {string} [password_label="Password"]
 * @property {string} [email_placeholder]
 * @property {string} [password_placeholder]
 * @property {string} [button_label_login="Log In"]
 * @property {string} [button_label_signup="Sign Up"]
 * @property {string} [button_label_forgot_password="Send Reset Password Link"]
 * @property {string} [button_label_update_password="Update Password"]
 * @property {string} [button_label_magic_link="Send Magic Link"]
 * @property {string} [forgot_password_link="Forgot password?"]
 * @property {string} [or_text="OR"]
 * @property {string} [provider_label="Continue with"]
 * @property {string} [email_provider_text="Email"]
 * @property {string} [password_provider_text="Password"]
 * @property {string} [footer_text_login="Already have an account?"]
 * @property {string} [footer_text_signup="Need to create an account?"]
 * @property {string} [footer_link_login="Log In"]
 * @property {string} [footer_link_signup="Sign Up"]
 * @property {string} [email_confirmation_text="Check your email for the confirmation link"]
 * @property {string} [email_reset_password_text="Check your email for the password reset link]
 * @property {string} [email_magic_link_text="Check your email for the magic link"]
 * @property {string} [error_email_text="Enter a valid email"]
 * @property {string} [error_password_text="Enter a valid password"]
 */

const defaultLocalization = {
    header_text_login: "Log In",
    header_text_signup: "Sign Up",
    header_text_forgot_password: "Forgot Password",
    header_text_update_password: "Update Password",
    email_label: "Email Address",
    password_label: "Password",
    email_placeholder: "",
    password_placeholder: "",
    button_label_login: "Log In",
    button_label_signup: "Sign Up",
    button_label_forgot_password: "Send Reset Password Link",
    button_label_update_password: "Update Password",
    button_label_magic_link: "Send Magic Link",
    forgot_password_link: "Forgot password?",
    or_text: "OR",
    provider_label: "Continue with",
    email_provider_text: "Email",
    password_provider_text: "Password",
    footer_text_login: "Already have an account?",
    footer_text_signup: "Need to create an account?",
    footer_link_login: "Log In",
    footer_link_signup: "Sign Up",
    email_confirmation_text: "Check your email for the confirmation link",
    email_reset_password_text: "Check your email for the password reset link",
    email_magic_link_text: "Check your email for the magic link",
    error_email_text: "Enter a valid email",
    error_password_text: "Enter a valid password",
}

/**
 * Auth component
 * @param {Object} props
 * @param {SupabaseClient} props.supabaseClient - Supabase client
 * @param {("horizontal" | "vertical")} [props.socialLayout="vertical"] - Social layout (horizontal or vertical)
 * @param {string} [props.defaultRedirectTo="/"] - Default redirect path
 * @param {string} [props.redirectTo] - Override Redirect path
 * @param {boolean} [props.magicLink=true] - Enable magic link
 * @param {boolean} [props.emailPassword=true] - Enable email and password
 * @param {boolean} [props.startWithMagicLink=false] - Start with magic link
 * @param {boolean} [props.nextRouter=true] - Enable Next.js router integration
 * @param {string} [props.initialView="login"] - Initial view to render
 * @param {("apple" | "facebook" | "github" | "google" | "twitter" | "email")[]} [props.providers=[]] - Auth providers
 * @param {AuthLocalization} [props.localization={}] - Localization variables
 * @param {string} [props.baseUrl=""] - Base URL for the app
 * @returns {JSX.Element}
 */
export function Auth({
    supabaseClient,
    socialLayout = "vertical",
    defaultRedirectTo = "/",
    redirectTo = null,
    magicLink = true,
    emailPassword = true,
    startWithMagicLink = false,
    nextRouter = true,
    initialView = "login",
    providers = [],
    localization = {},
    baseUrl = ""
}) {
    localization = { ...defaultLocalization, ...localization }

    const router = useRouter()
    const [view, setView] = useState(nextRouter ? router.pathname.split("/")[1] : initialView)
    const [session, setSession] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    const [isMagicLink, setIsMagicLink] = useState(startWithMagicLink || !emailPassword)
    const emailInput = useRef(null)
    const passwordInput = useRef(null)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isVisible, setIsVisible] = React.useState(false)
    const [isEmailValid, setIsEmailValid] = useState(true)
    const [isPasswordValid, setIsPasswordValid] = useState(true)
    const isHydrated = useIsHydrated()

    const viewActions = {
        login: isMagicLink ? localization.button_label_magic_link : localization.button_label_login,
        signup: localization.button_label_signup,
        "forgot-password": localization.button_label_forgot_password
    }

    // Get and watch changes to the session
    useEffect(() => {
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const {
            data: { subscription },
        } = supabaseClient.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    // Redirect the user when the session is active
    useEffect(() => {
        if (session) router.replace(redirectTo || router.query.redirect_to || defaultRedirectTo)
    }, [session])

    // Set the view based on the current router path
    useEffect(() => {
        if (nextRouter && view != router.pathname.split("/")[1]) {
            setView(router.pathname.split("/")[1])
        }
    }, [router.pathname])

    // Push the router to the pathname for the current view
    useEffect(() => {
        if (view != "login") setIsMagicLink(false)

        if (nextRouter && view != router.pathname.split("/")[1]) {
            router.push(`/${view}`)
        }

        setError(null)
        setSuccessMessage(null)
        setIsEmailValid(true)
        setIsPasswordValid(true)

        if (view == "signup") setIsVisible(false)
    }, [view])

    useEffect(() => {
        if (startWithMagicLink || !emailPassword) {
            setIsMagicLink(true)
        }

        if (!magicLink) {
            setIsMagicLink(false)
        }

    }, [magicLink, startWithMagicLink, emailPassword])

    // Handle the form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        setError(null)
        setSuccessMessage(null)

        setIsEmailValid(true)
        setIsPasswordValid(true)

        if (!email || !email.includes("@")) {
            setIsEmailValid(false)
            emailInput.current.focus()
            return
        }

        if (!password && ["login", "signup"].includes(view) && !isMagicLink) {
            setIsPasswordValid(false)
            passwordInput.current.focus()
            return
        }

        setIsLoading(true)

        switch (view) {
            case "login": {
                if (isMagicLink) {
                    const { error } = await supabaseClient.auth.signInWithOtp({
                        email,
                        options: {
                            // set this to false if you do not want the user to be automatically signed up
                            emailRedirectTo: redirectTo || router.query.redirect_to || defaultRedirectTo,
                        }
                    })
                    setError(error)
                    !error && setSuccessMessage(localization.email_magic_link_text)
                    !error && setEmail("")
                } else {
                    const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
                    setError(error)
                }
                break
            }
            case "signup": {
                const { error } = await supabaseClient.auth.signUp({ email, password })
                setError(error)
                break
            }
            case "forgot-password": {
                const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                    redirectTo: `${baseUrl}/update-password?redirect_to=${redirectTo || router.query.redirect_to || defaultRedirectTo}`,
                })
                setError(error)
                !error && setSuccessMessage(localization.email_reset_password_text)
                !error && setEmail("")
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
                {localization[`header_text_${view.replaceAll("-", "_")}`]}
            </p>

            <form
                className="relative flex flex-col gap-3"
                noValidate={true}
                onSubmit={handleSubmit}
            >
                <Input
                    ref={emailInput}
                    errorMessage={!isEmailValid && localization.error_email_text}
                    isInvalid={!isEmailValid}
                    label={localization.email_label}
                    placeholder={localization.email_placeholder}
                    name="email"
                    type="email"
                    value={email}
                    onValueChange={(value) => {
                        setIsEmailValid(true)
                        setEmail(value)
                    }}
                    variant="bordered"
                />

                <Input
                    ref={passwordInput}
                    errorMessage={!isPasswordValid && localization.error_password_text}
                    isInvalid={!isPasswordValid}
                    className={cn(
                        (emailPassword && !isMagicLink && ["login", "signup"].includes(view)) ? "opacity-1" : "opacity-0 -mt-3 !h-0 overflow-hidden",
                        "transition-all"
                    )}
                    label={localization.password_label}
                    placeholder={localization.password_placeholder}
                    name="password"
                    value={password}
                    onValueChange={setPassword}
                    type={(isVisible && view == "signup") ? "text" : "password"}
                    variant="bordered"
                    endContent={
                        <Button
                            isIconOnly
                            type="button"
                            onPress={() => setIsVisible(!isVisible)}
                            size="sm"
                            variant="light"
                            radius="full"
                            className={cn(
                                view != "signup" && "opacity-0 !min-w-0 !max-w-0",
                                "transition-all !bg-transparent"
                            )}
                            isDisabled={view != "signup"}
                            disableRipple
                        >
                            {isVisible ? (
                                <Icon
                                    className="pointer-events-none text-2xl text-default-400"
                                    icon="solar:eye-closed-linear"
                                />
                            ) : (
                                <Icon
                                    className="pointer-events-none text-2xl text-default-400"
                                    icon="solar:eye-bold"
                                />
                            )}
                        </Button>
                    }
                />

                <Button color="primary" type="submit" isLoading={isLoading} isDisabled={!!session}>
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
                {localization.forgot_password_link}
            </Link>

            <div className={cn(
                error ? "opacity-1" : "opacity-0 -mt-4 !h-0 overflow-hidden",
                "transition-all"
            )}>
                <Card className="bg-danger-50">
                    <CardBody className="text-small text-center !text-danger-700 min-h-12">
                        {error?.message}
                    </CardBody>
                </Card>
            </div>

            <div className={cn(
                successMessage ? "opacity-1" : "opacity-0 -mt-4 !h-0 overflow-hidden",
                "transition-all"
            )}>
                <Card className="bg-success-50">
                    <CardBody className="text-small text-center !text-success-700 min-h-10">
                        {successMessage}
                    </CardBody>
                </Card>
            </div>

            <div className="flex items-center gap-4 py-2">
                <Divider className="flex-1" />

                <p className="shrink-0 text-tiny text-default-500">
                    {localization.or_text}
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
                        {localization.provider_label}

                        &nbsp;

                        {localization.email_provider_text}
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
                        {localization.provider_label}

                        &nbsp;

                        {localization.password_provider_text}
                    </Button>
                )}

                {socialLayout == "vertical" && (
                    <div className="flex flex-col gap-2">
                        {providers?.map((provider) => (
                            <Button
                                key={provider}
                                startContent={authProviders[provider].icon}
                                variant="flat"
                                onPress={() => supabaseClient.auth.signInWithOAuth({ provider })}
                            >
                                {localization.provider_label}

                                &nbsp;

                                {authProviders[provider].name}
                            </Button>
                        ))}
                    </div>
                )}


                {socialLayout == "horizontal" && (
                    <div className="flex gap-2">
                        {providers?.map((provider) => (
                            <Button
                                key={provider}
                                variant="flat"
                                className="min-w-0"
                                fullWidth
                                onPress={() => supabaseClient.auth.signInWithOAuth({ provider })}
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
                    {localization.footer_text_signup}

                    &nbsp;

                    <Link
                        size="sm"
                        onPress={() => setView("signup")}
                        className="cursor-pointer"
                    >
                        {localization.footer_link_signup}
                    </Link>
                </p>

                <p className={cn(
                    ["signup", "forgot-password"].includes(view) ? "opacity-1" : "opacity-0 translate-y-3 h-0 overflow-hidden",
                    "text-center text-small transition-all"
                )}>
                    {localization.footer_text_login}

                    &nbsp;

                    <Link
                        size="sm"
                        onPress={() => setView("login")}
                        className="cursor-pointer"
                    >
                        {localization.footer_link_login}
                    </Link>
                </p>
            </div>
        </div>
    )
}

import { SupabaseClient } from "@supabase/supabase-js"
import { useRouter } from "next/router"
import React, { CSSProperties, useEffect, useRef, useState } from "react"

import { Icon } from "@iconify/react"
import { Alert, Button, cn, Divider, Form, Input, Link } from "@nextui-org/react"

import { authProviders } from "./auth-providers"
import { useIsHydrated } from "./use-is-hydrated"

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

/**
 * @typedef {Object} AuthClassNames
 * @property {string} [container]
 * @property {string} [header]
 * @property {string} [form]
 * @property {string} [input]
 * @property {string} [button_submit]
 * @property {string} [link]
 * @property {string} [alert_error]
 * @property {string} [alert_success]
 * @property {string} [divider]
 * @property {string} [button_provider]
 * @property {string} [footer]
 */

/**
 * @typedef {Object} AuthStyles
 * @property {CSSProperties} [container]
 * @property {CSSProperties} [header]
 * @property {CSSProperties} [form]
 * @property {CSSProperties} [input]
 * @property {CSSProperties} [button_submit]
 * @property {CSSProperties} [link]
 * @property {CSSProperties} [alert_error]
 * @property {CSSProperties} [alert_success]
 * @property {CSSProperties} [divider]
 * @property {CSSProperties} [button_provider]
 * @property {CSSProperties} [footer]
 */

export const defaultLocalization = {
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
 * @param {("horizontal" | "vertical")} [props.socialLayout="vertical"] - Social providers layout
 * @param {boolean} [props.asCard=true] - Render as Card
 * @param {string} [props.defaultRedirectTo="/"] - Default redirect path
 * @param {string} [props.redirectTo] - Override Redirect path
 * @param {boolean} [props.magicLink=true] - Enable magic link
 * @param {boolean} [props.emailPassword=true] - Enable email and password
 * @param {boolean} [props.startWithMagicLink=false] - Start with magic link
 * @param {boolean} [props.isRoutingEnabled=true] - Use pathnames for routing different views
 * @param {string} [props.initialView="login"] - Initial view to render
 * @param {("apple" | "azure" | "bitbucket" | "discord" | "facebook" | "figma" | "github" | "gitlab" | "google" | "kakao" | "keycloak" | "linkedin" | "notion" | "twitch" | "twitter" | "slack" | "spotify" | "workos" | "zoom")[]} [props.providers=[]] - Auth providers
 * @param {AuthLocalization} [props.localization={}] - Localization variables
 * @param {string} [props.baseUrl=""] - Base URL for the app
 * @param {string} [props.className] - Container class name
 * @param {CSSProperties} [props.style] - Container style
 * @param {AuthClassNames} [props.classNames={}] - Class names for different elements
 * @param {AuthStyles} [props.styles={}] - Styles for different elements
 * @param {("primary" | "secondary" | "success" | "warning" | "error" | "default" | "info")} [props.color="primary"] - Button color
 * @returns {JSX.Element}
 */
export function Auth({
    supabaseClient,
    socialLayout = "vertical",
    asCard = true,
    defaultRedirectTo = "/",
    redirectTo = null,
    magicLink = true,
    emailPassword = true,
    startWithMagicLink = false,
    isRoutingEnabled = true,
    initialView = "login",
    providers = [],
    localization = {},
    baseUrl = "",
    className = null,
    style = null,
    classNames = {},
    styles = {},
    color = "primary"
}) {
    localization = { ...defaultLocalization, ...localization }

    const router = useRouter()
    const [view, setView] = useState(isRoutingEnabled ? router.pathname.split("/")[1] : initialView)
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
    const isHydrated = useIsHydrated()

    const viewActions = {
        login: isMagicLink ? localization.button_label_magic_link : localization.button_label_login,
        signup: localization.button_label_signup,
        "forgot-password": localization.button_label_forgot_password,
        "update-password": localization.button_label_update_password,
    }

    const currentRedirectTo = redirectTo || router.query.redirect_to || defaultRedirectTo

    // Get and watch changes to the session
    useEffect(() => {
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            if (view == "update-password" && !session) {
                setView("login")
            }

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
        if (session && view != "update-password") router.replace(currentRedirectTo)
    }, [session])

    // Set the view based on the current router path
    useEffect(() => {
        if (isRoutingEnabled && view != router.pathname.split("/")[1]) {
            setView(router.pathname.split("/")[1])
        }
    }, [router.pathname])

    // Push the router to the pathname for the current view
    useEffect(() => {
        if (view != "login") setIsMagicLink(false)

        if (isRoutingEnabled && view != router.pathname.split("/")[1]) {
            router.push(`/${view}`)
        }

        setError(null)
        setSuccessMessage(null)

        if (view == "signup") setIsVisible(false)
    }, [view])

    useEffect(() => {
        setPassword("")
        setError(null)
        setSuccessMessage(null)
    }, [isMagicLink])

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
        setIsLoading(true)

        switch (view) {
            case "login": {
                if (isMagicLink) {
                    const { error } = await supabaseClient.auth.signInWithOtp({
                        email,
                        options: {
                            emailRedirectTo: `${baseUrl}/${currentRedirectTo}`,
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
                    redirectTo: `${baseUrl}/update-password`,
                })
                setError(error)
                !error && setSuccessMessage(localization.email_reset_password_text)
                !error && setEmail("")
                break
            }
            case "update-password": {
                const { error } = await supabaseClient.auth.updateUser({ password })
                setError(error)
                !error && router.replace("/")
                break
            }
        }

        setIsLoading(false)
    }

    return (
        <div className={cn((!isHydrated) && "opacity-0",
            "flex w-full max-w-sm flex-col gap-4 p-5",
            asCard && "rounded-large bg-content1 shadow-small",
            className,
            classNames?.container
        )} style={{ ...style, ...styles?.container }}>
            <style global="true" jsx="true">{`
                input:-webkit-autofill-and-obscured,
                input:-webkit-autofill-strong-password,
                input:-webkit-autofill-strong-password-viewable,
                input:-webkit-autofill {
                    -webkit-text-fill-color: #71717a;
                }
            `}</style>

            <p className={cn("text-xl font-medium ms-1", classNames?.header)} style={styles?.header}>
                {localization[`header_text_${view.replaceAll("-", "_")}`]}
            </p>

            <Form
                key={isMagicLink ? "magic-link" : view}
                className={cn("flex flex-col gap-3", classNames?.form)}
                validationBehavior="native"
                style={styles?.form}
                onSubmit={handleSubmit}
                action={`/${view}`}
            >
                <Input
                    ref={emailInput}
                    enterKeyHint={isMagicLink ? "send" : "next"}
                    errorMessage={localization.error_email_text}
                    label={localization.email_label}
                    placeholder={localization.email_placeholder}
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onValueChange={(value) => {
                        setEmail(value)
                    }}
                    onKeyDown={(e) => {
                        if (e.key == "Enter" && !isMagicLink) {
                            e.preventDefault()
                            passwordInput.current.focus()
                        }
                    }}
                    variant="bordered"
                    className={cn(
                        view != "update-password" ? "opacity-1" : "opacity-0 -mt-3 !h-0 overflow-hidden",
                        "transition-all",
                        classNames?.input
                    )}
                    validate={(value) =>
                        value?.includes("@") ? true : localization.error_email_text
                    }
                    style={styles?.input}
                    isDisabled={view == "update-password"}
                />

                <Input
                    ref={passwordInput}
                    enterKeyHint={view == "update-password" ? "send" : "go"}
                    errorMessage={localization.error_password_text}
                    validate={(value) =>
                        !value?.length && localization.error_password_text
                    }
                    isDisabled={!emailPassword || isMagicLink || view == "update-password"}
                    className={cn(
                        (emailPassword && !isMagicLink && ["login", "signup", "update-password"].includes(view)) ? "opacity-1" : "opacity-0 -mt-3 !h-0 overflow-hidden",
                        "transition-all",
                        classNames?.input
                    )}
                    style={styles?.input}
                    label={localization.password_label}
                    placeholder={localization.password_placeholder}
                    autoComplete={isMagicLink ? "off" : ["signup", "update-password"].includes(view) ? "new-password" : "new-password"}
                    name={isMagicLink ? null : "password"}
                    value={isMagicLink ? "" : password}
                    onValueChange={setPassword}
                    type={(isMagicLink || (isVisible && view == "signup")) ? "text" : "password"}
                    variant="bordered"
                    endContent={
                        <Button
                            isIconOnly
                            type="button"
                            onPressStart={() => setIsVisible(!isVisible)}
                            size="sm"
                            variant="light"
                            radius="full"
                            className={cn(
                                !["signup", "update-password"].includes(view) && "opacity-0 !min-w-0 !max-w-0",
                                "transition-all !bg-transparent"
                            )}
                            isDisabled={!["signup", "update-password"].includes(view)}
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

                <Button
                    fullWidth
                    color={color}
                    type="submit"
                    isLoading={isLoading}
                    isDisabled={!!session && view != "update-password"}
                    className={cn(classNames?.button_submit)}
                    style={styles?.button_submit}
                    onPressStart={(e) => e.target.click()}
                >
                    {viewActions[view]}
                </Button>
            </Form>

            <Link
                className={cn(
                    (view == "login" && !isMagicLink) ? "opacity-1" : "opacity-0 -mt-4 !h-0 overflow-hidden",
                    "transition-all self-center cursor-pointer",
                    `text-${color}`,
                    classNames?.link
                )}
                style={styles?.link}
                size="sm"
                onPressStart={() => setView("forgot-password")}
            >
                {localization.forgot_password_link}
            </Link>

            <div className={cn(
                error ? "opacity-1" : "opacity-0 -mt-4 !h-0 overflow-hidden",
                "transition-all text-small"
            )}>
                <Alert color="danger" variant="faded" classNames={{ base: cn(classNames?.alert_error) }} style={styles?.alert_error}>
                    {error?.message}
                </Alert>
            </div>

            <div className={cn(
                !successMessage && "opacity-0 -mt-4 !h-0 overflow-hidden",
                "transition-all text-small"
            )}>
                <Alert color="success" variant="faded" classNames={{ base: cn(classNames?.alert_success) }} style={styles?.alert_success}>
                    {successMessage}
                </Alert>
            </div>

            {view != "update-password" && (
                <div className="flex items-center gap-4 py-2">
                    <Divider className={cn("flex-1", classNames?.divider)} style={styles?.divider} />

                    <p className="shrink-0 text-tiny text-default-500">
                        {localization.or_text}
                    </p>

                    <Divider className={cn("flex-1", classNames?.divider)} style={styles?.divider} />
                </div>
            )}

            {view != "update-password" && (
                <div className="flex flex-col gap-2">
                    <Button
                        startContent={
                            authProviders.email.icon
                        }
                        variant="flat"
                        onPress={() => {
                            setView("login")
                            setIsMagicLink(true)
                        }}
                        className={cn(
                            (!magicLink || isMagicLink) && "opacity-0 translate-y-3 -mt-2 !h-0 overflow-hidden",
                            "transition-all",
                            classNames?.button_provider
                        )}
                        style={styles?.button_provider}
                    >
                        {localization.provider_label}

                        &nbsp;

                        {localization.email_provider_text}
                    </Button>

                    <Button
                        startContent={
                            authProviders.password.icon
                        }
                        variant="flat"
                        onPress={() => {
                            setView("login")
                            setIsMagicLink(false)
                        }}
                        className={cn(
                            (!emailPassword || !isMagicLink) && "opacity-0 translate-y-3 -mt-2 !h-0 overflow-hidden",
                            "transition-all",
                            classNames?.provider
                        )}
                        style={styles?.provider}
                    >
                        {localization.provider_label}

                        &nbsp;

                        {localization.password_provider_text}
                    </Button>

                    {socialLayout == "vertical" && (
                        <div className="flex flex-col gap-2">
                            {providers?.map((provider) => (
                                <Button
                                    key={provider}
                                    startContent={authProviders[provider].icon}
                                    variant="flat"
                                    onPress={() => supabaseClient.auth.signInWithOAuth({ provider })}
                                    className={classNames?.provider}
                                    style={styles?.provider}
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
                                    className={cn("min-w-0", classNames?.provider)}
                                    style={styles?.provider}
                                    fullWidth
                                    onPress={() => supabaseClient.auth.signInWithOAuth({ provider })}
                                >
                                    {authProviders[provider].icon}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {view != "update-password" && (
                <div className={cn("flex flex-col my-1", classNames?.footer)} style={styles?.footer}>
                    <p className={cn(
                        ["login"].includes(view) ? "opacity-1" : "opacity-0 translate-y-3 h-0 overflow-hidden",
                        "text-center text-small transition-all"
                    )}>
                        {localization.footer_text_signup}

                        &nbsp;

                        <Link
                            size="sm"
                            onPress={() => setView("signup")}
                            className={`cursor-pointer text-${color}`}
                            style={styles?.link}
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
                            className={`cursor-pointer text-${color}`}
                            style={styles?.link}
                        >
                            {localization.footer_link_login}
                        </Link>
                    </p>
                </div>
            )}
        </div>
    )
}

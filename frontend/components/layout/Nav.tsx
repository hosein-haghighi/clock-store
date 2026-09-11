"use client"

import React from "react"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import {
    Handbag,
    HomeIcon,
    LogInIcon,
    PhoneCallIcon,
    ShoppingCartIcon,
} from "lucide-react"

import { Button } from "../ui/button"
import { Link } from "@/i18n/navigation"
import Logout from "../auth/logout"
import { useUser } from "@/hooks/useUser"
import { useCart } from "@/hooks/useCart"

export const Nav = () => {
    const t = useTranslations("nav")
    const tAuth = useTranslations("auth")

    const { items: cartItems } = useCart()
    const { isAuthenticated } = useUser()
    const pathname = usePathname()

    const totalItems = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    )

    const navItems = [
        {
            name: t("home"),
            href: "/",
            icon: <HomeIcon size={18} />,
        },
        {
            name: t("contact"),
            href: "/contact",
            icon: <PhoneCallIcon size={18} />,
        },
        ...(isAuthenticated
            ? [
                {
                    name: t("orders"),
                    href: "/orders",
                    icon: <Handbag size={18} />,
                },
            ]
            : []),
        {
            name: t("cart"),
            href: "/cart",
            icon: <ShoppingCartIcon size={18} />,
        },
    ]

    return (
        <nav className="sticky top-0 z-50 bg-background p-2 flex justify-between items-center">
            <ul className="flex gap-0 lg:gap-2 items-center">
                {navItems.map((navItem) => {
                    const isActive =
                        pathname === navItem.href ||
                        (navItem.href !== "/" &&
                            pathname.startsWith(navItem.href))

                    return (
                        <li key={navItem.href} className="relative">
                            <Link href={navItem.href}>
                                <Button
                                    variant="link"
                                    className={`${isActive
                                            ? "text-foreground bg-muted"
                                            : "text-muted-foreground"
                                        } rounded-lg p-2 py-6 text-inherit flex flex-col`}
                                >
                                    <span className="flex items-center flex-col">
                                        {navItem.icon}

                                        <span>{navItem.name}</span>

                                        {totalItems > 0 &&
                                            navItem.href === "/cart" && (
                                                <span className="absolute top-1 right-0 text-xs bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                                                    {totalItems}
                                                </span>
                                            )}
                                    </span>
                                </Button>
                            </Link>
                        </li>
                    )
                })}
            </ul>

            {!isAuthenticated ? (
                <Link href="/login">
                    <Button
                        variant="default"
                        className="flex flex-col gap-0 py-6 items-center"
                    >
                        <span className="flex items-center gap-1">
                            <LogInIcon size={18} />
                            <span>{tAuth("login")}</span>
                        </span>
                    </Button>
                </Link>
            ) : (
                <Logout className="py-6" />
            )}
        </nav>
    )
}
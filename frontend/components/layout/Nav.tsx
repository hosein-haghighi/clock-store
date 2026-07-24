"use client"
import { useUser } from '@/hooks/useUser';
import React from 'react'
import { Button } from '../ui/button';
import { Link } from '@/i18n/navigation';
import Logout from '../auth/logout';
import { LogIn, LogInIcon, ShoppingCartIcon, WatchIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCart } from '@/hooks/useCart';

export const Nav = () => {
    const t = useTranslations("nav")
    const tAuth = useTranslations("auth")

    const { items: cartItems } = useCart()

    let totalItems = 0
    cartItems.forEach((item) => {
        totalItems += item.quantity
    })

    const { user, loading, isAuthenticated } = useUser();
    const pathName = usePathname()

    const navItems = [
        {
            name: t("contact"),
            href: "/contact",
        },

        {
            name: t("cart"),
            href: "/cart",
        }
    ]

    return (

        <nav className="sticky top-0 z-50 bg-background p-2 flex justify-between items-center">
            <ul className='flex gap-0  lg:gap-2 items-center '>

                <li className={`${pathName === "/" ? "text-foreground" : "text-muted-foreground"} `}>
                    <Link href={"/"} >
                        <WatchIcon />
                    </Link>
                </li>

                {
                    navItems.map((navItem) => {
                        const isActive = `/${pathName.split("/").at(-1)}` === navItem.href
                        const isCart = navItem.href === "/cart"

                        if (isCart) {
                            return (
                                <li key={navItem.name} className='relative'>
                                    <Link href={navItem.href}>
                                        <Button variant={'link'} className={`${isActive ? "text-foreground bg-muted " : "text-muted-foreground"} rounded-lg p-2 text-inherit `} >
                                            <span className='flex items-center'>

                                                <span className='pb-1'>
                                                    <ShoppingCartIcon size={18} /></span>
                                                <span>{navItem.name}</span>
                                                {totalItems > 0 && (
                                                    <span className="absolute top-1 right-0 text-xs bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                                                        {totalItems}
                                                    </span>
                                                )}</span>
                                        </Button>
                                    </Link>
                                </li>
                            )
                        }

                        return (
                            <li key={navItem.name}>
                                <Link href={navItem.href} className={`${isActive ? "text-foreground bg-muted " : "text-muted-foreground"} rounded-sm p-1 `}>
                                    <Button variant={'link'} className={`${isActive ? "text-foreground bg-muted " : "text-muted-foreground"} rounded-lg p-2 text-inherit `} >
                                        {navItem.name}
                                    </Button>
                                </Link>
                            </li>
                        )

                    })
                }

            </ul>

            {
                !isAuthenticated ?

                    <div  >
                        <Link href="/login"  >
                            <Button asChild variant={"default"} className='flex gap-2 items-center'>

                                <span className='flex'>
                                    <span> {tAuth("login")}</span>
                                    <LogInIcon />
                                </span>


                            </Button>
                        </Link>
                    </div>

                    :

                    <Logout />
            }
        </nav >
    )
}
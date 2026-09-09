"use client"
import { useUser } from '@/hooks/useUser';
import React from 'react'
import { Button } from '../ui/button';
import { Link } from '@/i18n/navigation';
import Logout from '../auth/logout';
import { Handbag, HomeIcon, icons, LogIn, LogInIcon, PhoneCallIcon, ShoppingCartIcon, WatchIcon } from 'lucide-react';
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
            name: t("home"),
            href: "/",
            icon: <HomeIcon size={18} />


        },
        {
            name: t("contact"),
            href: "/contact",
            icon: <PhoneCallIcon size={18} />
        },
        ...(isAuthenticated
            ? [
                {
                    name: t("orders"),
                    href: "/orders",
                    icon: <Handbag size={18} />
                },
            ]
            : []),
        ,
        {
            name: t("cart"),
            href: "/cart",
            icon: <ShoppingCartIcon size={18} />
        }
    ]
    // :
    //     [
    //         {
    //             name: t("contact"),
    //             href: "/contact",
    //         },


    //         {
    //             href: "/cart",
    //             icon: <ShoppingCartIcon size={18} />
    //         }
    //     ]


    return (

        <nav className="sticky top-0 z-50 bg-background p-2 flex justify-between items-center">
            <ul className='flex gap-0  lg:gap-2 items-center '>

                {
                    navItems.map((navItem) => {
                        if (!navItem) {
                            return
                        }
                        const isActive = `/${pathName.split("/").at(-1)}` === navItem.href


                        return (
                            <li key={navItem.name} className='relative'>
                                <Link href={navItem.href}>
                                    <Button variant={'link'} className={`${isActive ? "text-foreground bg-muted flex flex-col" : "text-muted-foreground"} rounded-lg p-2 py-6 text-inherit `} >
                                        <span className='flex items-center flex-col'>
                                            {navItem.icon}
                                            <span className='pb-1'>
                                            </span>
                                            <span>{navItem.name}</span>
                                            {totalItems > 0 && navItem.href === "/cart" && (
                                                <span className="absolute top-1 right-0 text-xs bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                                                    {totalItems}
                                                </span>
                                            )}
                                        </span>

                                    </Button>
                                </Link>
                            </li>
                        )


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
                            <Button asChild variant={"default"} className='flex flex-col   gap-0  py-6 items-center'>

                                <span className='flex'>
                                    <LogInIcon />
                                    <span> {tAuth("login")}</span>

                                </span>


                            </Button>
                        </Link>
                    </div>

                    :

                    <Logout className={"py-6"} />
            }
        </nav >
    )
}
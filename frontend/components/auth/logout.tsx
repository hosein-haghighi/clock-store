
import toast from 'react-hot-toast';
import { Button } from '../ui/button'
import { useLogout } from '@/hooks/useLogout';
import { LogOutIcon } from 'lucide-react';
import { useTranslations } from "next-intl";
import { redirect } from 'next/navigation';
export function Logout() {

    const t = useTranslations("auth")
    const { mutate: logout } = useLogout()
    const onLogoutHandle = async () => {
        logout(undefined, {
            onSuccess: (data) => {
                toast.success(data.message);
                redirect("/");
            },

            onError: (err: any) => {
                toast.error(err.message);
            }
        });
    }
    return (
        <Button onClick={onLogoutHandle} className='bg-muted text-foreground'>
            <span>{t("logout")}</span>
            <LogOutIcon />
        </Button>
    )
}

export default Logout
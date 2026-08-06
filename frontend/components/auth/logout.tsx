
import toast from 'react-hot-toast';
import { Button } from '../ui/button'
import { useLogout } from '@/hooks/useLogout';
import { LogOutIcon } from 'lucide-react';
import { useTranslations } from "next-intl";
import { redirect } from 'next/navigation';
type Props = {
    className?: string
}
export function Logout({ className }: Props) {

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
        <Button onClick={onLogoutHandle} className={`bg-muted text-foreground flex flex-col gap-0 ${className}`}>
            <LogOutIcon />
            <span >{t("logout")}</span>
        </Button>
    )
}

export default Logout
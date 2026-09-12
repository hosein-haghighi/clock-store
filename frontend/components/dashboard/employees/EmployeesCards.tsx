import { BadgeAlertIcon, BadgeCheckIcon, PartyPopperIcon, UserCheck2Icon, UserIcon, UserRoundXIcon } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { Avatar } from '@/components/ui/avatar';
import cm from '@/public/images/cm.jpg'
import Image from 'next/image';

function EmployeesCards() {
    const totalEmployees = 100;
    const employeesPresent = 70;
    const percentOfPresentEmployees = (employeesPresent / totalEmployees) * 100
    const areEmployeesEnough = percentOfPresentEmployees >= 70
    return (
        <div className='grid lg:grid-cols-3 gap-4'>
            <Card className='p-4 pt-6'>
                <CardHeader className='pb-2'>
                    <CardTitle className='text-base '>
                        Total employees
                    </CardTitle>
                </CardHeader>
                <CardContent className='flex justify-between items-center ' >
                    <div className='flex gap-2 '>
                        <UserIcon />
                        <p className='text-5xl font-bold'>{totalEmployees}</p>
                    </div>
                    <div>
                        <Button size={"sm"} asChild>
                            <Link href={"/dashboard/employees"}>
                                View all
                            </Link>
                        </Button>
                    </div>

                </CardContent>
            </Card>
            <Card className='p-4 pt-6'>
                <CardHeader className='pb-2'>
                    <CardTitle className='text-base '>

                        Employees present
                    </CardTitle>
                </CardHeader>
                <CardContent className='flex justify-between items-center '>
                    <div className='flex gap-2 '>
                        {areEmployeesEnough ? <UserCheck2Icon /> : <UserRoundXIcon />}
                        <p className='text-5xl font-bold'>{employeesPresent}</p>
                    </div>

                    <div>
                        <Button size={"sm"} asChild>
                            <Link href={"/dashboard/employees"}>
                                View all
                            </Link>
                        </Button>
                    </div>


                </CardContent>
                <CardFooter className={`flex items-center ${areEmployeesEnough ? "text-green-500" : "text-red-500"} gap-2 bg-inherit border-none`}>
                    {areEmployeesEnough ? <BadgeCheckIcon size={18} /> : <BadgeAlertIcon size={18} />}
                    <p className='text-xs '>
                        {percentOfPresentEmployees} % of employees are present
                    </p>

                </CardFooter>
            </Card>
            <Card className='shadow-xs shadow-amber-200 flex flex-col p-4 pt-6'>
                <CardHeader className='pb-2'>
                    <CardTitle className='text-base '>
                        Employee of the month
                    </CardTitle>
                </CardHeader>
                <CardContent className='flex gap-4 items-center'>
                    <Avatar>
                        <Image src={cm} className='rounded-full' alt='Employee of the month avatar' />
                        {/* <AvatarFallback >
                            AA
                        </AvatarFallback> */}
                    </Avatar>
                    <p className='text-2xl '>Ami Ackerman</p>
                </CardContent>
                <CardFooter className='bg-inherit border-none flex items-center  text-xs text-muted-foreground gap-2 mt-auto'>
                    <PartyPopperIcon className='text-pink-500' />
                    <p>Congratulations Ami</p>
                </CardFooter>
            </Card>
        </div >
    )
}

export default EmployeesCards
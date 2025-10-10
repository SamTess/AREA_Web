"use client";
import { useState, useEffect } from 'react';
import {
  IconGauge,
  IconHome2,
  IconLogin,
  IconListDetails,
} from '@tabler/icons-react';
import { Center, Stack, Tooltip, UnstyledButton } from '@mantine/core';
import Image from 'next/image';

import { useRouter } from 'next/navigation';
import { UserMenu } from '../user/UserMenu';
import classes from './NavBarMinimal.module.css';
import { NavbarLinkProps, UserContent } from '../../../types';
import { getUserInfo } from '../../../services/userService';


function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  return (
    <Tooltip label={label} position="right" transitionProps={{ duration: 0 }}>
      <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
        <Icon size={20} stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const dataCenter = [
  { icon: IconHome2, label: 'Home', link: "/", checkAdmin: false },
  { icon: IconListDetails, label: 'Areas', link: "/areas", checkAdmin: false },
  { icon: IconGauge, label: 'Dashboard', link: "/dashboard", checkAdmin: true },
];

export function NavbarMinimal() {
  const [active, setActive] = useState(0);
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<UserContent | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userInfo = await getUserInfo();
        if (userInfo && userInfo.email) {
          setIsConnected(true);
          setUser(userInfo);
          setIsAdmin(userInfo.isAdmin === true);
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        setIsConnected(false);
        console.error("Error fetching user info:", error);
      }
    };
    checkAuthStatus();
  }, []);

  const links = dataCenter.map((link, index) => (
    (link.checkAdmin && !isAdmin) ? null :
    <NavbarLink
      {...link}
      key={link.label}
      active={index === active}
      onClick={() => {
        setActive(index);
        console.log("Navigating to:", link.link);
        router.push(link.link);
      }}
    />
  ));

  return (
    <nav className={classes.navbar} style={{ backgroundColor: 'var(--mantine-color-white)', width: '78px' }}>
      <Center>
        <Image src="/A1.png" alt="Logo" width={40} height={40} />
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>


      <Stack justify="center" gap={0}>
        {isConnected && user ? (
          <UserMenu user={user} />
        ) : (
          <NavbarLink icon={IconLogin} label="Login" onClick={() => router.push('/login')} />
        )}
      </Stack>
    </nav>
  );
}
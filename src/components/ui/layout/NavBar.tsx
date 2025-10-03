"use client";
import { useState } from 'react';
import {
  IconGauge,
  IconHome2,
  IconLogin,
  IconListDetails
} from '@tabler/icons-react';
import { Center, Stack, Tooltip, UnstyledButton } from '@mantine/core';
import Image from 'next/image';

import { useRouter } from 'next/navigation';
import { UserMenu } from '../user/UserMenu';
import classes from './NavBarMinimal.module.css';
import { NavbarLinkProps, UserContent } from '../../../types';

const user: UserContent = {
  name: "Test User",
  email: "testuser@example.com",
  avatarSrc: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-7.png",
  profileData: {
    email: "testuser@example.com",
    firstName: "Test",
    lastName: "User",
    language: "English",
  },
};

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
  { icon: IconHome2, label: 'Home', link: "/" },
  { icon: IconGauge, label: 'Dashboard', link: "/dashboard" },
  { icon: IconListDetails, label: 'Areas', link: "/areas" },
];

export function NavbarMinimal() {
  const [active, setActive] = useState(0);
  const router = useRouter();
  const [isConnected] = useState(false);

  const links = dataCenter.map((link, index) => (
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
    <nav className={classes.navbar} style={{ backgroundColor: 'var(--mantine-color-white)', width: '78px' }}> {/* la couleurs / le style a mettre ailleurs */}
      <Center>
        <Image src="/A1.png" alt="Logo" width={40} height={40} />
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </div>


      <Stack justify="center" gap={0}>
        {isConnected ? (
          <UserMenu user={user} />
        ) : (
          <NavbarLink icon={IconLogin} label="Login" onClick={() => router.push('/login')} />
        )}
      </Stack>
    </nav>
  );
}
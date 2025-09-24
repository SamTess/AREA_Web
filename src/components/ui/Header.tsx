"use client";
import { IconBook, IconChevronDown, IconListDetails, IconCircleDashedPlus, IconHome, IconLayoutDashboard } from '@tabler/icons-react';
import { Box, Burger, Button, Center, Collapse, Divider, Drawer, Group, HoverCard, Image, ScrollArea, SimpleGrid, Text, ThemeIcon, UnstyledButton, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import classes from './Header.module.css';
import { UserButton } from './UserButton';

const areaData = [
  {
    link: "/areaList",
    icon: IconListDetails,
    title: 'Area List',
    description: 'View the complete list of all your created areas and manage them easily.',
  },
  {
    link: "/createArea",
    icon: IconCircleDashedPlus,
    title: 'Create Area',
    description: 'Create a new custom area according to your needs and automate your tasks.',
  },
  {
    link: "/documentation",
    icon: IconBook,
    title: 'Documentation',
    description: 'Access the full documentation to understand and use all features.',
  },

];

const MockUser = {
  name: "Test User",
  email: "test@test.com",
  avatarSrc: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png"
};

export function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const [isConnected, setIsConnected] = useDisclosure(true);
  const theme = useMantineTheme();
  const router = useRouter();

  const links = areaData.map((item) => (
    <Link key={item.title} href={item.link}>
      <UnstyledButton className={classes.subLink}>
        <Group wrap="nowrap" align="flex-start">
          <ThemeIcon size={34} variant="default" radius="md">
            <item.icon size={22} color={theme.colors.blue[6]} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={500}>
              {item.title}
            </Text>
            <Text size="xs" c="dimmed">
              {item.description}
            </Text>
          </div>
        </Group>
      </UnstyledButton>
    </Link>
  ));

  return (
    <Box pb={120}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <Image src="/area1.png" alt="area logo" style={{ maxWidth: '7%', height: 'auto' }} onClick={() => router.push('/')} />
          <Group h="100%" gap={0} visibleFrom="sm">
            <Link href="/" className={classes.link}>
              Home
            </Link>
            <HoverCard width={600} position="bottom" radius="md" shadow="md" withinPortal>
              <HoverCard.Target>
                <a href="#" className={classes.link}>
                  <Center inline>
                    <Box component="span" mr={5}>
                      Area
                    </Box>
                    <IconChevronDown size={16} color={theme.colors.blue[6]} />
                  </Center>
                </a>
              </HoverCard.Target>

              <HoverCard.Dropdown style={{ overflow: 'hidden' }}>
                <Group justify="space-between" px="md">
                  <Text fw={500}>Area features</Text>

                </Group>

                <Divider my="sm" />

                <SimpleGrid cols={2} spacing={0}>
                  {links}
                </SimpleGrid>

                <div className={classes.dropdownFooter}>
                  <Group justify="space-between">
                    <div>
                      <Text fw={500} fz="sm">
                        Get started
                      </Text>
                      <Text size="xs" c="dimmed">
                        Start creating your first AREA now.
                      </Text>
                    </div>
                    <Button variant="default" onClick={() => router.push('/createArea')}>Get started</Button>
                  </Group>
                </div>
              </HoverCard.Dropdown>
            </HoverCard>
            <Link href="/dashboard" className={classes.link}>
              Dashboard
            </Link>

          </Group>

          <Group visibleFrom="sm">
            {isConnected ? (
              <UserButton
                name={MockUser.name}
                email={MockUser.email}
                avatarSrc={MockUser.avatarSrc}
              />
            ) : (
              <>
                <Button variant="default" onClick={() => router.push('/login')}>Log in</Button>
                <Button onClick={() => router.push('/signup')}>Sign up</Button>
              </>
            )}
          </Group>

          <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="80%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px" mx="-md">
          <Divider my="sm" />

          <Link href="/" className={classes.link}>
            <Group gap="sm">
              <IconHome size={18} />
              Home
            </Group>
          </Link>
          <UnstyledButton className={classes.link} onClick={toggleLinks}>
            <Group justify="space-between" w="100%">
              <Group gap="sm">
                <IconListDetails size={18} />
                Area
              </Group>
              <IconChevronDown size={16} color={theme.colors.blue[6]} />
            </Group>
          </UnstyledButton>
          <Collapse in={linksOpened}>{links}</Collapse>
          <Link href="/dashboard" className={classes.link}>
            <Group gap="sm">
              <IconLayoutDashboard size={18} />
              Dashboard
            </Group>
          </Link>

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            {isConnected ? (
              <UserButton
                name={MockUser.name}
                email={MockUser.email}
                avatarSrc={MockUser.avatarSrc}
              />
            ) : (
              <>
                <Button variant="default" onClick={() => router.push('/login')}>Log in</Button>
                <Button onClick={() => router.push('/signup')}>Sign up</Button>
              </>
            )}
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
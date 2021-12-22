import React from "react";
import { Link } from "react-router-dom";
import {
  Container,
  ButtonGroup,
  Text,
  Flex,
  Heading,
  useMediaQuery,
  Menu,
  IconButton,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";

import { useNavigate } from "react-router-dom";
import LinkButton from "./LinkButton";
import ConnectWallet from "./ConnectWallet";
import "./NavHeader.css";

const NavHeader = () => {
  const [isLargerThan720, isLargerThan520] = useMediaQuery([
    "(min-width: 720px)",
    "(min-width: 520px)",
  ]);
  let navigate = useNavigate();

  return (
    <>
      <Container maxW="100%" backgroundColor="green.700">
        <Flex
          justifyContent="space-between"
          h="84px"
          maxWidth="calc(100vw - 98px)"
          minWidth="320px"
          width="1200px"
          alignItems="center"
          direction="row"
          margin="0 auto"
        >
          <Link to="/">
            <Flex color="gray.100" direction="column" alignItems="flex-start">
              <Heading
                variant="h1"
                fontSize={{ base: "2xl", md: "3xl", lg: "3xl" }}
              >
                Explorio
              </Heading>
              <Text fontSize={{ base: "sm", md: "md", lg: "xl" }}>
                The Hunt for the Holy Grail
              </Text>
            </Flex>
          </Link>
          {isLargerThan720 ? (
            <ButtonGroup spacing={4} variant="outline">
              <LinkButton to="/" size="lg" backgroundColor="gray.100">
                <Text>Home</Text>
              </LinkButton>
              <LinkButton to="/hunt" size="lg" backgroundColor="gray.100">
                <Text>Hunt</Text>
              </LinkButton>
              <LinkButton
                to="/how-to-play"
                size="lg"
                backgroundColor="gray.100"
              >
                <Text>How to play</Text>
              </LinkButton>
              <LinkButton
                to="/information"
                size="lg"
                backgroundColor="gray.100"
              >
                <Text>Statistics</Text>
              </LinkButton>
              <LinkButton
                to="/marketplace"
                size="lg"
                backgroundColor="gray.100"
              >
                <Text>Marketplace</Text>
              </LinkButton>
            </ButtonGroup>
          ) : (
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Options"
                icon={<HamburgerIcon />}
                variant="outline"
              />
              <MenuList>
                <MenuItem onClick={() => navigate("/")}>Home</MenuItem>
                <MenuItem onClick={() => {}}>Connect wallet</MenuItem>
                <MenuItem onClick={() => navigate("/hunt")}>Hunt</MenuItem>
                <MenuItem onClick={() => navigate("/how-to-play")}>
                  How to Play
                </MenuItem>
                <MenuItem onClick={() => navigate("/information")}>
                  Statistics
                </MenuItem>
                <MenuItem onClick={() => navigate("/marketplace")}>
                  Marketplace
                </MenuItem>
              </MenuList>
            </Menu>
          )}

          {isLargerThan520 && (
            <Flex justifyContent="flex-end" paddingRight={6}>
              <ConnectWallet />
            </Flex>
          )}
        </Flex>
      </Container>
    </>
  );
};
export default NavHeader;
